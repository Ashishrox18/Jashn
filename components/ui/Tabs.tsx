import React, { useRef, KeyboardEvent } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}

export function Tabs({ tabs, activeTab, onChange, ariaLabel }: TabsProps) {
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    let targetIndex = -1;

    switch (e.key) {
      case 'ArrowRight':
        targetIndex = (currentIndex + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const targetTab = tabs[targetIndex];
    if (targetTab) {
      onChange(targetTab.id);
      tabRefs.current.get(targetTab.id)?.focus();
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto border-b border-border p-1 bg-surface-2 rounded-lg"
    >
      {tabs.map((tab, index) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isSelected ? 0 : -1}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.id, el);
              else tabRefs.current.delete(tab.id);
            }}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm md:text-base font-medium rounded-md whitespace-nowrap transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isSelected
                ? 'bg-surface text-ink font-semibold shadow-sm border border-border'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            }`}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  const isSelected = activeTab === id;
  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent mt-4"
    >
      {children}
    </div>
  );
}
