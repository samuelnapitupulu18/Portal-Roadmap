import { useState, useEffect, useCallback } from 'react'

const API_BASE_URL = 'http://localhost:3001/api/v1'

export function useRoadmapData() {
  const [activeView, setActiveView] = useState('cards')

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState([])
  const [filterOptions, setFilterOptions] = useState({ statuses: [], projects: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [taskHistory, setTaskHistory] = useState([])

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true)
      try {
        const queryParams = new URLSearchParams()
        if (selectedStatus) queryParams.append('status', selectedStatus)
        if (selectedProject) queryParams.append('project', selectedProject)
        if (selectedMonth && selectedMonth !== 'All Months') queryParams.append('month', selectedMonth)
        if (searchQuery) queryParams.append('search', searchQuery)

        const response = await fetch(`${API_BASE_URL}/roadmap/stories?${queryParams.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch stories')

        const result = await response.json()
        const { stories, summary, filterOptions: fOptions } = result.data

        setTasks(stories)
        setFilterOptions(fOptions)
        setStats([
          { label: 'Total Work', count: summary.total },
          { label: 'To Do', count: summary.planned },
          { label: 'In Progress', count: summary.inProgress },
          { label: 'In Review', count: summary.testing },
          { label: 'Done', count: summary.done },
        ])
        setError(null)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(() => {
      fetchStories()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedStatus, selectedProject, selectedMonth, searchQuery])

  const fetchTaskDetail = useCallback(async (task) => {
    try {
      const response = await fetch(`${API_BASE_URL}/roadmap/stories/${task.id}`)
      if (!response.ok) throw new Error('Failed to fetch story details')
      const result = await response.json()
      return result.data
    } catch (err) {
      console.error(err)
      return task
    }
  }, [])

  const handleTaskClick = useCallback(async (task) => {
    setIsDetailOpen(true)
    setTaskHistory([])
    const detail = await fetchTaskDetail(task)
    setSelectedTask(detail)
  }, [fetchTaskDetail])

  const handleChildClick = useCallback(async (child) => {
    setSelectedTask((current) => {
      if (current) setTaskHistory((prev) => [...prev, current])
      return current
    })
    const detail = await fetchTaskDetail(child)
    setSelectedTask(detail)
  }, [fetchTaskDetail])

  const handleBack = useCallback(() => {
    setTaskHistory((prev) => {
      if (prev.length === 0) return prev
      setSelectedTask(prev[prev.length - 1])
      return prev.slice(0, -1)
    })
  }, [])

  const handleDetailClose = useCallback(() => {
    setIsDetailOpen(false)
    setTaskHistory([])
    setTimeout(() => setSelectedTask(null), 300)
  }, [])

  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => !prev)
  }, [])

  return {
    tasks,
    stats,
    filterOptions,
    isLoading,
    error,
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
    handleChildClick,
    handleBack,
    canGoBack: taskHistory.length > 0,
    handleDetailClose,
  }
}
