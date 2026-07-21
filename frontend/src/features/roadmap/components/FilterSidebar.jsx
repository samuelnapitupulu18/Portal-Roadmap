import React, { useState } from 'react'
import { ChevronDown, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

function FilterSection({ title, badgeCount, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-100 py-4 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800"
      >
        <span className="flex items-center gap-2">
          {title}
          {!!badgeCount && (
            <span className="text-[10px] bg-[#41aa72] text-white rounded-full px-1.5 py-0.5 leading-none">
              {badgeCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  )
}

function FilterRow({ color, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
        active ? 'bg-[#41aa72]/10 text-[#1a1f36] font-medium' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className="flex items-center gap-2 truncate">
        {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{count}</span>
    </button>
  )
}

export function FilterSidebar({
  statusOptions = [],
  categoryOptions = [],
  releaseDateOptions = [],
  selectedStatuses = [],
  selectedCategories = [],
  selectedReleaseDate = '',
  onToggleStatus,
  onToggleCategory,
  onSelectReleaseDate,
  onResetAll,
}) {
  return (
    <aside className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 h-fit lg:sticky lg:top-8">
      <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
        <Filter className="h-4 w-4" /> Filter
      </h3>

      <FilterSection title="Category" defaultOpen={false}>
        {categoryOptions.length === 0 && (
          <p className="text-xs text-gray-400 px-2 py-1">No categories</p>
        )}
        {categoryOptions.map((o) => (
          <FilterRow
            key={o.value}
            color={o.color}
            label={o.label}
            count={o.count}
            active={selectedCategories.includes(o.value)}
            onClick={() => onToggleCategory(o.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Status" defaultOpen>
        {statusOptions.map((o) => (
          <FilterRow
            key={o.value}
            color={o.color}
            label={o.label}
            count={o.count}
            active={selectedStatuses.includes(o.value)}
            onClick={() => onToggleStatus(o.value)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Release Date" badgeCount={selectedReleaseDate ? 1 : 0} defaultOpen>
        {releaseDateOptions.map((o) => (
          <FilterRow
            key={o.value}
            label={o.label}
            count={o.count}
            active={selectedReleaseDate === o.value}
            onClick={() => onSelectReleaseDate(o.value)}
          />
        ))}
      </FilterSection>

      <Button
        onClick={onResetAll}
        variant="outline"
        className="w-full mt-3 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Reset all filters
      </Button>
    </aside>
  )
}
