import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpDown, Info } from 'lucide-react'

const ACCENT = '#008573'

export function SortMenu({ sections = [], value, onChange }) {
  const [open, setOpen] = useState(false)
  const [hoverTip, setHoverTip] = useState(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border bg-white px-4 text-sm font-medium shadow-sm cursor-pointer"
        style={{ borderColor: open ? ACCENT : '#e5e7eb', color: open ? ACCENT : '#18181B' }}
      >
        <ArrowUpDown className="h-4 w-4" />
        Sort by
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-[300px] rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          <div className="border-b border-gray-100 px-[18px] py-3.5 text-lg font-bold text-gray-900">
            Sort by
          </div>

          {sections.map((section, idx) => (
            <div
              key={section.title}
              className={`px-[18px] py-3 ${idx < sections.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="mb-1.5 text-[13px] font-medium text-gray-500">{section.title}</div>
              <div className="flex flex-col gap-0.5">
                {section.options.map((option) => {
                  const selected = option.value === value
                  return (
                    <div key={option.value} className="relative">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          onChange(option.value)
                          setOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[15px] cursor-pointer transition-colors ${
                          selected ? 'bg-[#eef6f4]' : 'hover:bg-[#f4f6f6]'
                        }`}
                      >
                        <span
                          className="box-border flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
                          style={selected ? { background: ACCENT } : { background: '#fff', border: '2px solid #d1d5db' }}
                        >
                          {selected && <span className="h-[9px] w-[9px] rounded-full bg-white" />}
                        </span>
                        <span className="font-medium text-gray-800">{option.label}</span>
                        <span
                          className="inline-flex cursor-help text-gray-400"
                          onMouseEnter={(e) => { e.stopPropagation(); setHoverTip(option.value) }}
                          onMouseLeave={(e) => { e.stopPropagation(); setHoverTip(null) }}
                        >
                          <Info className="h-[17px] w-[17px]" />
                        </span>
                      </button>

                      {hoverTip === option.value && (
                        <div
                          className="pointer-events-none absolute right-full top-1/2 z-30 mr-2.5 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-[12.5px] font-semibold text-white shadow-lg"
                          style={{ background: '#1e2732' }}
                        >
                          <span
                            className="absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45"
                            style={{ background: '#1e2732' }}
                          />
                          {option.hint}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
