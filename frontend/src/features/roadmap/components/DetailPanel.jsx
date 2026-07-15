import React from 'react'
import { X, Calendar, Tag, Circle, FileText, ImageIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function DetailPanel({ task, isOpen, onClose }) {
  if (!task) return null

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
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
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div>
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  Assignee
                </h3>
                <div className="text-sm font-semibold text-gray-900">
                  {task.assignee || 'Unassigned'}
                </div>
              </div>

              <div>
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  Project
                </h3>
                {task.tag && task.tag !== '-' ? (
                  <Badge
                    className="text-[10px] uppercase font-bold tracking-wider rounded border-0 px-2.5 py-0.5"
                    style={{ backgroundColor: task.tagColor, color: '#fff' }}
                  >
                    {task.tag}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm font-medium">-</span>
                )}
              </div>

              <div className="col-span-2">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" /> Due Date
                </h3>
                <div className="text-sm font-semibold text-gray-900">
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
              {task.images && task.images.length > 0 && (
                <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                  {task.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${img.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 block w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 hover:border-blue-400 transition-colors"
                      title={img.filename}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}${img.url}`}
                        alt={img.filename}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              )}

              <p className="text-[13px] text-gray-600 leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Activity Timeline */}
            {task.activity && task.activity.length > 0 && (
              <div className="mb-10 border-t border-gray-100 pt-8">
                <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-6">
                  ACTIVITY TIMELINE
                </h3>
                <div className="relative border-l border-green-100 ml-2 space-y-6">
                  {task.activity.map((act, idx) => (
                    <div key={idx} className="relative pl-6">
                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
                      <div className="text-[13px] text-gray-800 font-medium mb-1">
                        {act.action}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {act.user} &middot; {act.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
