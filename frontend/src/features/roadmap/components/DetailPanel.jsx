import React from 'react'
import { X, ArrowLeft, Calendar, Circle, FileText, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

const isDone = (status = '') => status.toLowerCase().includes('done')

export function DetailPanel({ task, isOpen, onClose, onChildClick, onBack, canGoBack }) {
  if (!task) return null

  const children = task.children || []
  const doneCount = children.filter((c) => isDone(c.status)).length
  const childProgress = children.length === 0 ? 0 : Math.round((doneCount / children.length) * 100)

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="sticky top-0 bg-white px-8 pt-8 pb-4 flex items-start justify-between z-10">
            <div className="flex items-center gap-3">
              {canGoBack && (
                <button
                  onClick={onBack}
                  className="p-1.5 -ml-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
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

          <div className="px-8 pb-8">
            <h2 className="text-[22px] font-bold text-[#1a1f36] leading-tight mb-8 pr-4">
              {task.title}
            </h2>

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

            <div className="mb-10">
              <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-3">
                <FileText className="h-3.5 w-3.5 text-[#41aa72]" /> DESCRIPTION
              </h3>

              {task.images && task.images.length > 0 && (
                <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                  {task.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={`${API_BASE}${img.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 block w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 hover:border-blue-400 transition-colors"
                      title={img.filename}
                    >
                      <img
                        src={`${API_BASE}${img.url}`}
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

            {task.children && (
              <div className="mb-10 border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Child work items
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    {childProgress}% Done
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${childProgress}%` }}
                  />
                </div>

                {children.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-400 italic bg-gray-50/50 rounded-lg border border-gray-100">
                    No child work items found.
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50/70 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="w-4 shrink-0" />
                      <span className="flex-1">Work</span>
                      <span className="w-4 text-center shrink-0">Prio</span>
                      <span className="w-6 text-center shrink-0">Assg</span>
                      <span className="w-20 text-right shrink-0">Status</span>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {children.map((child) => {
                        const done = isDone(child.status)
                        return (
                          <div
                            key={child.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => onChildClick?.(child)}
                          >
                            {child.issueTypeIconUrl ? (
                              <img
                                src={child.issueTypeIconUrl}
                                alt={child.issueType || 'Issue'}
                                title={child.issueType}
                                className="h-4 w-4 shrink-0"
                              />
                            ) : (
                              <span className="h-4 w-4 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              <span className={`text-xs font-mono text-blue-600 shrink-0 ${done ? 'line-through' : ''}`}>
                                {child.id}
                              </span>
                              <span className={`text-sm truncate ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                {child.title}
                              </span>
                            </div>
                            <span className="w-4 flex justify-center shrink-0" title={child.priority}>
                              {child.priorityIconUrl ? (
                                <img src={child.priorityIconUrl} alt={child.priority || 'Priority'} className="h-3.5 w-3.5" />
                              ) : null}
                            </span>
                            <div
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden"
                              title={child.assignee || 'Unassigned'}
                            >
                              {child.assigneeAvatarUrl ? (
                                <img src={child.assigneeAvatarUrl} alt={child.assignee || 'Unassigned'} className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-3.5 w-3.5 text-gray-400" />
                              )}
                            </div>
                            <span className="w-20 shrink-0 flex justify-end">
                              <Badge
                                className="text-[9px] uppercase font-bold tracking-wider rounded border-0"
                                style={{ backgroundColor: `${child.statusColor}20`, color: child.statusColor }}
                              >
                                {child.status}
                              </Badge>
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

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
