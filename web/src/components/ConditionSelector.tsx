import { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronDown, Search } from 'lucide-react';

// ── Full condition list ───────────────────────────────────────────────────────
const STANDARD_CONDITIONS = [
  'Allergic Rhinitis',
  'Asthma',
  'Bronchiectasis',
  'Chronic Bronchitis',
  'COPD',
  'Cystic Fibrosis',
  'Emphysema',
  'Hypersensitivity Pneumonitis',
  'Pulmonary Fibrosis',
  'Sleep Apnea',
];

// Pinned at bottom (vulnerability groups)
const VULNERABILITY_GROUPS = [
  'Child (under 12)',
  'Elderly (60+)',
  'Pregnant',
];

interface ConditionSelectorProps {
  selected: string[];
  onChange: (conditions: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ConditionSelector({
  selected,
  onChange,
  placeholder = 'Search conditions...',
  disabled = false,
}: ConditionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  // Tracks the position of the trigger box so the portal can align to it
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recalculate portal position — flips up/down based on available viewport space
  const recalcPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const MARGIN = 8;          // gap between trigger and dropdown edge
    const VIEWPORT_PAD = 12;   // breathing room from viewport edges

    const spaceBelow = window.innerHeight - rect.bottom - MARGIN - VIEWPORT_PAD;
    const spaceAbove = rect.top - MARGIN - VIEWPORT_PAD;
    const PREFERRED_MAX = 300; // ideal max-height

    if (spaceBelow >= spaceAbove || spaceBelow >= PREFERRED_MAX) {
      // Open downward
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + MARGIN,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(PREFERRED_MAX, spaceBelow),
        zIndex: 9999,
      });
    } else {
      // Open upward — anchor to bottom of viewport so it grows toward top
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + MARGIN,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(PREFERRED_MAX, spaceAbove),
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      recalcPosition();
      window.addEventListener('scroll', recalcPosition, true);
      window.addEventListener('resize', recalcPosition);
    }
    return () => {
      window.removeEventListener('scroll', recalcPosition, true);
      window.removeEventListener('resize', recalcPosition);
    };
  }, [isOpen, recalcPosition]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Close if the click is outside both the trigger and the portal dropdown
      const portalEl = document.getElementById('condition-selector-portal');
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !(portalEl && portalEl.contains(target))
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (condition: string) => {
    if (selected.includes(condition)) {
      onChange(selected.filter((c) => c !== condition));
    } else {
      onChange([...selected, condition]);
    }
  };

  const remove = (condition: string) => {
    onChange(selected.filter((c) => c !== condition));
  };

  const filteredStandard = STANDARD_CONDITIONS.filter((c) =>
    search === '' || c.toLowerCase().startsWith(search.toLowerCase())
  );
  const filteredVuln = VULNERABILITY_GROUPS.filter((c) =>
    search === '' || c.toLowerCase().startsWith(search.toLowerCase())
  );
  const hasResults = filteredStandard.length > 0 || filteredVuln.length > 0;

  const dropdown = isOpen && !disabled ? (
    <div
      id="condition-selector-portal"
      style={dropdownStyle}
      className="bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto custom-scrollbar"
    >
      {!hasResults ? (
        <div className="px-4 py-6 text-center text-sm text-white/40">
          No results found for &quot;{search}&quot;
        </div>
      ) : (
        <>
          {filteredStandard.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                Respiratory Conditions
              </p>
              {filteredStandard.map((cond) => (
                <ConditionOption
                  key={cond}
                  condition={cond}
                  selected={selected.includes(cond)}
                  onToggle={() => toggle(cond)}
                />
              ))}
            </div>
          )}

          {filteredVuln.length > 0 && (
            <div className="border-t border-white/5">
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-widest text-white/30">
                Vulnerability Groups
              </p>
              {filteredVuln.map((cond) => (
                <ConditionOption
                  key={cond}
                  condition={cond}
                  selected={selected.includes(cond)}
                  onToggle={() => toggle(cond)}
                  pinned
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input area */}
      <div
        onClick={() => {
          if (disabled) return;
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`w-full min-h-[46px] bg-black/40 border rounded-xl px-3 py-2 flex flex-wrap gap-2 items-center cursor-text transition-all ${
          isOpen
            ? 'border-white/30 ring-2 ring-white/10'
            : 'border-white/10 hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Chips */}
        {selected.map((cond) => (
          <span
            key={cond}
            className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 text-purple-200 text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {cond}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(cond); }}
                className="hover:text-white transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {/* Search input */}
        {!disabled && (
          <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
            <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={selected.length === 0 ? placeholder : 'Add more...'}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none min-w-[80px]"
            />
          </div>
        )}

        {!disabled && (
          <ChevronDown
            className={`w-4 h-4 text-white/40 shrink-0 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {/* Dropdown rendered via portal — escapes overflow:hidden and backdrop-filter stacking contexts */}
      {ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
}

function ConditionOption({
  condition,
  selected,
  onToggle,
  pinned = false,
}: {
  condition: string;
  selected: boolean;
  onToggle: () => void;
  pinned?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-2 transition-colors ${
        selected
          ? 'bg-purple-500/15 text-purple-200'
          : 'text-white/80 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className="flex items-center gap-2">
        {pinned && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" />
        )}
        {condition}
      </span>
      {selected && (
        <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}
