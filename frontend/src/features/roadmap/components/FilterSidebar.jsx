import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

const ACCENT = '#10A37F'

function FilterSection({ title, badgeCount, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-100 px-5 py-4 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {badgeCount > 0 && (
            <span
              className="inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
              style={{ background: '#0d9488' }}
            >
              {badgeCount}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="mt-3 space-y-0.5 max-h-64 overflow-y-auto">
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
      className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors cursor-pointer ${
        active ? 'bg-[#eafbe9]' : 'hover:bg-gray-50'
      }`}
    >
      <span className="flex items-center gap-2 truncate">
        {color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />}
        <span className={`truncate ${active ? 'font-semibold' : 'text-gray-700'}`} style={active ? { color: '#166534' } : undefined}>
          {label}
        </span>
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
  const hasActiveFilters = selectedStatuses.length > 0 || selectedCategories.length > 0 || !!selectedReleaseDate

  return (
    <aside className="order-1 lg:order-2 rounded-2xl border border-gray-100 bg-white shadow-sm lg:sticky lg:top-6">
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Filter className="h-[18px] w-[18px]" style={{ color: ACCENT }} />
          <span className="text-[15px] font-semibold" style={{ color: ACCENT }}>Filter</span>
        </div>
        {hasActiveFilters && (
          <button onClick={onResetAll} className="text-xs font-semibold cursor-pointer" style={{ color: '#27ae60' }}>
            Reset All
          </button>
        )}
      </div>

      <FilterSection title="Category" badgeCount={selectedCategories.length}>
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

      <FilterSection title="Status" badgeCount={selectedStatuses.length}>
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

      <FilterSection title="Release Date" badgeCount={selectedReleaseDate ? 1 : 0}>
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
    </aside>
  )
}
