import React from 'react'
import { X, Calendar, Tag, Circle } from 'lucide-react'
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
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                {task.id}
              </span>
              <Badge
                className="text-[10px] uppercase font-bold tracking-wider rounded border-0"
                style={{ backgroundColor: task.statusColor, color: '#fff' }}
              >
                {task.status}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="px-6 py-6">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-6">
              {task.title}
            </h2>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-gray-400" />
                <Badge
                  className="text-[10px] uppercase font-bold tracking-wider rounded border-0"
                  style={{ backgroundColor: task.tagColor, color: '#fff' }}
                >
                  {task.tag}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{task.dueDate || task.date}</span>
              </div>
            </div>

            {/* Images (if any) */}
            {task.images && (
              <div className="mb-8">
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((_, idx) => (
                    <div
                      key={idx}
                      className="flex-1 aspect-square bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300"
                    >
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {/* Divider */}
            <hr className="border-gray-100 mb-8" />

            {/* Activity Timeline */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
                Activity Timeline
              </h3>
              <div className="space-y-0">
                {task.activity && task.activity.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                    {/* Timeline line */}
                    {idx < task.activity.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-200" />
                    )}
                    {/* Dot */}
                    <div className="relative z-10 mt-1.5 flex-shrink-0">
                      <Circle className="h-4 w-4 fill-[#41aa72] text-[#41aa72]" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 font-medium leading-snug">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
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
