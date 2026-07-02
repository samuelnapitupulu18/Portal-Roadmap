import { useState, useMemo, useCallback } from 'react'
import { mockTasks, statusOptions, projectOptions } from '@/features/roadmap/data/mockData'

const MONTH_MAP = {
  'Apr 2026': '2026-04',
  'May 2026': '2026-05',
  'Jun 2026': '2026-06',
  'Jul 2026': '2026-07',
  'Aug 2026': '2026-08',
}

function taskMatchesMonth(task, monthStr) {
  if (!monthStr) return true
  const monthKey = MONTH_MAP[monthStr]
  if (!monthKey) return true
  return task.startDate <= monthKey + '-31' && task.endDate >= monthKey + '-01'
}

export function useRoadmapData() {
  const [activeView, setActiveView] = useState('cards')

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const filteredTasks = useMemo(() => {
    return mockTasks.filter((task) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const match =
          task.title.toLowerCase().includes(q) ||
          task.id.toLowerCase().includes(q) ||
          task.tag.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q))
        if (!match) return false
      }
      if (selectedStatus && task.status !== selectedStatus) return false
      if (selectedProject && task.tag !== selectedProject) return false
      if (!taskMatchesMonth(task, selectedMonth)) return false

      return true
    })
  }, [searchQuery, selectedStatus, selectedProject, selectedMonth])

  const stats = useMemo(() => [
    { label: 'Total Work', count: mockTasks.length },
    { label: 'Planned', count: mockTasks.filter(t => t.status === 'Planned').length },
    { label: 'In Progress', count: mockTasks.filter(t => t.status === 'In Progress').length },
    { label: 'Testing', count: mockTasks.filter(t => t.status === 'Testing').length },
    { label: 'Released/Done', count: mockTasks.filter(t => t.status === 'Released / Done').length },
  ], [])

  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }, [])

  const handleDetailClose = useCallback(() => {
    setIsDetailOpen(false)
    setTimeout(() => setSelectedTask(null), 300)
  }, [])

  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => !prev)
  }, [])

  return {
    tasks: filteredTasks,
    allTasks: mockTasks,
    stats,
    statusOptions,
    projectOptions,
    activeView,
    setActiveView,
    isFilterOpen,
    toggleFilter,
    selectedStatus,
    setSelectedStatus,
    selectedProject,
    setSelectedProject,
    selectedMonth,
    setSelectedMonth,
    searchQuery,
    setSearchQuery,
    selectedTask,
    isDetailOpen,
    handleTaskClick,
    handleDetailClose,
  }
}
