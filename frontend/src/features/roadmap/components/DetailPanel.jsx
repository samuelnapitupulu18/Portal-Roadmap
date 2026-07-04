import React from 'react'
import { X, Calendar, Tag, Circle, FileText, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DetailPanel({ task, isOpen, onClose }) {
  if (!task) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full overflow-y-auto">
          {/* Panel Header */}
          <div className="sticky top-0 bg-white px-8 pt-8 pb-4 flex items-start justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded">
                {task.id}
              </span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1.5"
                style={{ backgroundColor: `${task.statusColor}15`, color: task.statusColor }}
              >
                <Circle className="h-2 w-2 fill-current" />
                {task.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="px-8 pb-8">
            {/* Title */}
            <h2 className="text-[22px] font-bold text-[#1a1f36] leading-tight mb-8 pr-4">
              {task.title}
            </h2>

            {/* Meta Info */}
            <div className="flex gap-16 mb-8">
              <div>
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Tag className="h-3.5 w-3.5 text-[#41aa72]" /> TAG PROJECT
                </h3>
                {task.tag && task.tag !== '-' ? (
                  <Badge
                    className="text-[10px] uppercase font-bold tracking-wider rounded border-0 px-2.5 py-0.5"
                    style={{ backgroundColor: task.tagColor, color: '#fff' }}
                  >
                    {task.tag}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm font-medium ml-1">-</span>
                )}
                {task.tag && task.tag !== '-' && <div className="text-gray-400 mt-2 text-xs font-medium ml-1">-</div>}
              </div>
              
              <div>
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Calendar className="h-3.5 w-3.5 text-[#41aa72]" /> DUE DATE
                </h3>
                <div className="text-sm font-bold text-gray-800 ml-1">
                  {task.dueDate || task.date}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-[#41aa72]" /> DESCRIPTION
              </h3>
              
              {/* Images (if any) */}
              {task.images && (
                <div className="flex gap-4 mb-4">
                  {[1, 2, 3].map((_, idx) => (
                    <div
                      key={idx}
                      className="w-24 h-24 bg-[#6b6d76] flex items-center justify-center"
                    >
                      <ImageIcon className="h-6 w-6 text-white" />
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 mb-8" />

            {/* Activity Timeline */}
            <div>
              <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-5">
                ACTIVITY TIMELINE
              </h3>
              <div className="space-y-0">
                {task.activity && task.activity.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {idx < task.activity.length - 1 && (
                      <div className="absolute left-[5px] top-4 bottom-0 w-px bg-[#41aa72] opacity-30" />
                    )}
                    {/* Dot */}
                    <div className="relative z-10 mt-1 flex-shrink-0">
                      <Circle className="h-3 w-3 fill-[#41aa72] text-[#41aa72]" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 -mt-0.5">
                      <p className="text-[13px] text-[#1a1f36] font-semibold leading-snug">
                        {item.action}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {item.user} · {item.date}
                      </p>
                    </div>
                  </div>
                ))}
                {(!task.activity || task.activity.length === 0) && (
                  <p className="text-sm text-gray-400 italic">No activity recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
