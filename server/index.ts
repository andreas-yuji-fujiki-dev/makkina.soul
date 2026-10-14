import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { getCredentialsStatus } from "./credentials";
import { askClaudeCli } from "./claudeCli";
import {
  addCategory,
  addHabit,
  deleteHabit,
  getEntries,
  reorderEntry,
  updateCategory,
  updateHabit,
} from "./rotinaEntries";
import {
  addArea,
  addPriority,
  deleteArea,
  deletePriority,
  getTaxonomy,
  updateArea,
  updatePriority,
} from "./kanbanTaxonomy";
import { addColumn, getColumns, reorderColumn, updateColumn } from "./kanbanColumns";
import type { ClaudeAction } from "../src/@types/claudeActions.types";
import type { DayIndex } from "../src/@types/rotina.types";
import type { ColumnAction, TaxonomyAction } from "../src/@types/kanban.types";

const PORT = Number(process.env.MACCHINA_SERVER_PORT) || 8787;
const HOST = "127.0.0.1";

function setCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/api/status") {
    const status = await getCredentialsStatus();
    sendJson(res, 200, status);
    return;
  }

  if (req.method === "GET" && req.url === "/api/rotina/habits") {
    sendJson(res, 200, { entries: getEntries() });
    return;
  }

  if (req.method === "POST" && req.url === "/api/rotina/habits/action") {
    let body: { action?: ClaudeAction };
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      sendJson(res, 400, { error: "Corpo da requisição inválido." });
      return;
    }

    const action = body.action;
    if (!action) {
      sendJson(res, 400, { error: "Ação ausente." });
      return;
    }

    let result: { ok: boolean; error?: string };
    switch (action.type) {
      case "add_habit":
        result = addHabit({
          title: action.title,
          note: action.note,
          days: action.days as DayIndex[],
          afterId: action.afterId,
        });
        break;
      case "update_habit": {
        const { id, ...edits } = action;
        result = updateHabit(id, { title: edits.title, note: edits.note, days: edits.days as DayIndex[] | undefined });
        break;
      }
      case "delete_habit":
        result = deleteHabit(action.id);
        break;
      case "add_category":
        result = addCategory(action.title, action.afterId);
        break;
      case "update_category":
        result = updateCategory(action.id, action.title);
        break;
      case "reorder_entry":
        result = reorderEntry(action.id, action.beforeId, action.afterId);
        break;
      default:
        sendJson(res, 400, { error: "Tipo de ação não suportado neste endpoint." });
        return;
    }
    sendJson(res, result.ok ? 200 : 422, result);
    return;
  }

  if (req.method === "GET" && req.url === "/api/kanban/taxonomy") {
    sendJson(res, 200, getTaxonomy());
    return;
  }

  if (req.method === "POST" && req.url === "/api/kanban/taxonomy/action") {
    let body: { action?: TaxonomyAction };
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      sendJson(res, 400, { error: "Corpo da requisição inválido." });
      return;
    }

    const action = body.action;
    if (!action) {
      sendJson(res, 400, { error: "Ação ausente." });
      return;
    }

    let result: { ok: boolean; error?: string };
    switch (action.type) {
      case "add_area":
        result = addArea(action.label, action.defaultPrio);
        break;
      case "update_area": {
        const { id, ...edits } = action;
        result = updateArea(id, edits);
        break;
      }
      case "delete_area":
        result = deleteArea(action.id);
        break;
      case "add_priority":
        result = addPriority(action.label);
        break;
      case "update_priority":
        result = updatePriority(action.id, action.label);
        break;
      case "delete_priority":
        result = deletePriority(action.id);
        break;
      default:
        sendJson(res, 400, { error: "Tipo de ação não suportado neste endpoint." });
        return;
    }
    sendJson(res, result.ok ? 200 : 422, result);
    return;
  }

  if (req.method === "GET" && req.url === "/api/kanban/columns") {
    sendJson(res, 200, { columns: getColumns() });
    return;
  }

  if (req.method === "POST" && req.url === "/api/kanban/columns/action") {
    let body: { action?: ColumnAction };
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      sendJson(res, 400, { error: "Corpo da requisição inválido." });
      return;
    }

    const action = body.action;
    if (!action) {
      sendJson(res, 400, { error: "Ação ausente." });
      return;
    }

    let result: { ok: boolean; error?: string };
    switch (action.type) {
      case "add_column":
        result = addColumn(action.label);
        break;
      case "update_column":
        result = updateColumn(action.id, action.label);
        break;
      case "reorder_column":
        result = reorderColumn(action.id, action.beforeId, action.afterId);
        break;
      default:
        sendJson(res, 400, { error: "Tipo de ação não suportado neste endpoint." });
        return;
    }
    sendJson(res, result.ok ? 200 : 422, result);
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body: { message?: string; sessionId?: string; context?: unknown };
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      sendJson(res, 400, { error: "Corpo da requisição inválido." });
      return;
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      sendJson(res, 400, { error: "Mensagem vazia." });
      return;
    }

    const result = await askClaudeCli(message, body.sessionId, body.context ?? {});
    if (!result.ok) {
      sendJson(res, 502, { error: result.error });
      return;
    }
    sendJson(res, 200, { reply: result.reply, actions: result.actions ?? [], sessionId: result.sessionId });
    return;
  }

  sendJson(res, 404, { error: "not found" });
});

server.listen(PORT, HOST, () => {
  console.log(`macchina-core server em http://${HOST}:${PORT}`);
});
