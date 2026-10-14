import { execFile } from "node:child_process";
import type { ExecFileOptions } from "node:child_process";
import { tmpdir } from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface ClaudeCliResult {
  ok: boolean;
  reply?: string;
  actions?: unknown[];
  sessionId?: string;
  error?: string;
}

interface ClaudeCliJsonOutput {
  result?: string;
  session_id?: string;
  is_error?: boolean;
  subtype?: string;
}

const TIMEOUT_MS = 120_000;

const ACTION_PROTOCOL = `Você é a assistente embutida no app "Macchina Core": um kanban de tarefas, uma rotina semanal de hábitos, um rastreador de desmame de cigarro e um overview mensal. Você enxerga o estado atual do app (fornecido abaixo como JSON) e pode executar ações pra alterá-lo quando o usuário pedir.

AÇÕES DISPONÍVEIS (campo "type" exato; omita campos opcionais quando não vier ao caso):
- {"type":"add_card","title":string,"area":"Emprego"|"Saúde"|"Grana"|"Faculdade"|"Estudo"|"Leitura"|"Conteúdo"|"Cultura"|"Outros","prio":1|2|3|4}
- {"type":"update_card","id":string,"title"?:string,"note"?:string,"area"?:string,"prio"?:1|2|3|4}
- {"type":"move_card","id":string,"col":"todo"|"doing"|"done"}  (máximo 3 cartões em "doing" por vez)
- {"type":"reorder_card","id":string,"col":"todo"|"doing"|"done","beforeId"?:string,"afterId"?:string}  (posiciona o cartão antes/depois de outro pelo id; omita os dois pra mandar pro fim da coluna)
- {"type":"delete_card","id":string}
- {"type":"toggle_habit","habitId":string,"day":0-6,"value":boolean}  (0=segunda...6=domingo, sempre na semana atual)
- {"type":"add_habit","title":string,"note"?:string,"days":number[],"afterId"?:string}  (dias 0-6, segunda a domingo; sem afterId vai pro fim da lista, com afterId entra logo depois desse item)
- {"type":"update_habit","id":string,"title"?:string,"note"?:string,"days"?:number[]}
- {"type":"delete_habit","id":string}
- {"type":"add_category","title":string,"afterId"?:string}  (cria uma categoria/divisor; sem afterId vai pro fim da lista, com afterId entra logo depois desse item)
- {"type":"update_category","id":string,"title":string}  (renomeia uma categoria existente)
- {"type":"reorder_entry","id":string,"beforeId"?:string,"afterId"?:string}  (reordena um hábito OU categoria pelo id; posiciona antes/depois de outro item; omita os dois pra mandar pro fim da lista)
- {"type":"start_cigarros_plan","date":"YYYY-MM-DD"}
- {"type":"bump_cigarros","delta":number}  (positivo soma cigarros hoje, negativo subtrai)
- {"type":"reset_cigarros_plan"}

Use sempre os "id" exatos que aparecem no JSON de estado pra referenciar cartões, hábitos ou categorias existentes — nunca invente um id. Se o usuário pedir algo ambíguo ou que não corresponda a nenhum item existente, pergunte ou explique em vez de inventar uma ação.

Responda SEMPRE E SOMENTE com um objeto JSON válido, sem markdown, sem texto fora do JSON, exatamente neste formato:
{"reply": "mensagem curta e natural em pt-BR pro usuário", "actions": [zero ou mais ações do formato acima]}`;

function buildPrompt(message: string, context: unknown): string {
  return `${ACTION_PROTOCOL}

ESTADO ATUAL DO APP (JSON):
${JSON.stringify(context)}

MENSAGEM DO USUÁRIO:
${message}`;
}

function parseStructuredReply(raw: string): { reply: string; actions: unknown[] } {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    const parsed = JSON.parse(cleaned);
    const reply = typeof parsed.reply === "string" ? parsed.reply : String(parsed.reply ?? "");
    const actions = Array.isArray(parsed.actions) ? parsed.actions : [];
    return { reply, actions };
  } catch {
    return { reply: raw, actions: [] };
  }
}

// Em vez de chamar api.anthropic.com direto (que trata um Bearer avulso como
// tráfego não confiável e aplica rate limit agressivo), isso invoca o próprio
// binário do Claude Code — o cliente de verdade, já autenticado na máquina —
// em modo não-interativo. cwd aponta pra um diretório neutro e --restricted
// tira ferramentas de execução de comando: as ações no app acontecem via o
// protocolo JSON abaixo, executadas pelo front-end, não por ferramentas do CLI.
export async function askClaudeCli(
  message: string,
  sessionId: string | undefined,
  context: unknown,
): Promise<ClaudeCliResult> {
  const prompt = buildPrompt(message, context);
  const args = ["-p", prompt, "--output-format", "json", "--restricted"];
  if (sessionId) args.push("--resume", sessionId);

  try {
    // `stdio` não está no tipo de ExecFileOptions do Node, mas é aceito em
    // runtime (execFile repassa pro spawn por baixo). Sem isso, o stdin do
    // filho fica como um pipe aberto vazio e o CLI perde ~3s "esperando" por
    // dados de stdin antes de seguir em frente.
    const execOptions = {
      cwd: tmpdir(),
      timeout: TIMEOUT_MS,
      maxBuffer: 10 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    } as unknown as ExecFileOptions;

    const { stdout } = await execFileAsync("claude", args, execOptions);

    const data = JSON.parse(stdout.toString("utf8")) as ClaudeCliJsonOutput;

    if (data.is_error || !data.result) {
      return { ok: false, error: data.result || `Falha ao executar o Claude Code (${data.subtype ?? "erro desconhecido"}).` };
    }

    const { reply, actions } = parseStructuredReply(data.result);
    return { ok: true, reply, actions, sessionId: data.session_id };
  } catch (e) {
    const err = e as NodeJS.ErrnoException & { stdout?: string; stderr?: string; killed?: boolean; signal?: string };
    const msg = err instanceof Error ? err.message : String(err);

    if (err.code === "ENOENT") {
      return { ok: false, error: "Binário `claude` não encontrado no PATH do servidor." };
    }
    if (err.killed && err.signal === "SIGTERM") {
      console.error("[claude-cli] timeout após", TIMEOUT_MS, "ms. stderr:", err.stderr);
      return { ok: false, error: "O Claude Code demorou demais pra responder (timeout)." };
    }
    console.error("[claude-cli] falha:", msg, "\nstdout:", err.stdout, "\nstderr:", err.stderr);
    return { ok: false, error: "Falha ao chamar o Claude Code localmente. Veja o terminal do servidor." };
  }
}
