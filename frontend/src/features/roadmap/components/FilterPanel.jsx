import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { statusOptions, projectOptions } from '@/features/roadmap/data/mockData'

// Custom Dropdown Component
function Dropdown({ label, value, options, allLabel, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayValue = value || allLabel

  return (
    <div className="flex-1 min-w-[160px]" ref={ref}>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#41aa72]/20 focus:border-[#41aa72]"
        >
          <span className={value ? 'text-gray-900 font-medium' : 'text-gray-500'}>
            {displayValue}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              onClick={() => { onChange(''); setIsOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
            >
              <span className={!value ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                {allLabel}
              </span>
              {!value && <Check className="h-4 w-4 text-[#41aa72]" />}
            </button>

            {options.map((option) => (
              <button
                key={option}
                onClick={() => { onChange(option); setIsOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                <span className={value === option ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                  {option}
                </span>
                {value === option && <Check className="h-4 w-4 text-[#41aa72]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const monthOptions = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026']

export function FilterPanel({
  isOpen,
  selectedStatus,
  onStatusChange,
  selectedProject,
  onProjectChange,
  selectedMonth,
  onMonthChange,
}) {
  if (!isOpen) return null

  return (
    <div className="px-16 pb-6">
      <div className="flex gap-4">
        <Dropdown
          label="Status"
          value={selectedStatus}
          options={statusOptions}
          allLabel="All Statuses"
          onChange={onStatusChange}
        />
        <Dropdown
          label="Project"
          value={selectedProject}
          options={projectOptions}
          allLabel="All Projects"
          onChange={onProjectChange}
        />
        <Dropdown
          label="Month"
          value={selectedMonth}
          options={monthOptions}
          allLabel="All Months"
          onChange={onMonthChange}
        />
      </div>
    </div>
  )
}
