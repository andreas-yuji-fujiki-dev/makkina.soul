import type { TabId } from "@app-types/layout.types";
import { TAB_LABELS, TABS } from "@constants/tabs";

interface TabsProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function Tabs({ active, onChange }: TabsProps) {
  return (
    <div className="tabs" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`tab-${tab}`}
          aria-selected={active === tab}
          aria-controls={`view-${tab}`}
          onClick={() => onChange(tab)}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
