"use client";

import { useState } from "react";
import { clsx } from "clsx";

export function Tabs({ 
  tabs 
}: { 
  tabs: { key: string; label: string; content: React.ReactNode }[] 
}) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveKey(tab.key)}
            className={clsx(
              "px-3 py-2 rounded-t-xl border border-b-0 transition-colors",
              activeKey === tab.key 
                ? "bg-card text-fg border-border" 
                : "bg-transparent text-muted border-transparent hover:text-fg"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-2">
        {tabs.find(t => t.key === activeKey)?.content}
      </div>
    </div>
  );
}
