import { useNotice } from "@hooks/useNotice";
import { useTabs } from "@hooks/useTabs";
import { useClaudeChat } from "@hooks/useClaudeChat";
import { Topbar } from "@components/layout/Topbar";
import { Header } from "@components/layout/Header";
import { Notice } from "@components/layout/Notice";
import { Tabs } from "@components/layout/Tabs";
import { ClaudePanel } from "@components/layout/ClaudePanel";
import { KanbanView } from "@components/kanban/KanbanView";
import { RotinaView } from "@components/rotina/RotinaView";
import { CigarrosView } from "@components/cigarros/CigarrosView";
import { OverviewView } from "@components/overview/OverviewView";

export function SelfManagerApp() {
  const { notice, showNotice } = useNotice();
  const { tab, setTab } = useTabs();
  const claudeChat = useClaudeChat();

  return (
    <>
      <Topbar status={claudeChat.status} onClaudeClick={claudeChat.toggle} />
      <div className="app-body">
        <div className="wrap">
          <Header />
          <Notice text={notice} />
          <Tabs active={tab} onChange={setTab} />
          <div hidden={tab !== "kanban"}>
            <KanbanView showNotice={showNotice} />
          </div>
          <div hidden={tab !== "rotina"}>
            <RotinaView showNotice={showNotice} />
          </div>
          <div hidden={tab !== "cigarros"}>
            <CigarrosView showNotice={showNotice} />
          </div>
          <div hidden={tab !== "overview"}>
            <OverviewView showNotice={showNotice} />
          </div>
        </div>
        <ClaudePanel
          open={claudeChat.isOpen}
          messages={claudeChat.messages}
          status={claudeChat.status}
          sending={claudeChat.sending}
          onClose={claudeChat.close}
          onSend={claudeChat.sendMessage}
        />
      </div>
    </>
  );
}
