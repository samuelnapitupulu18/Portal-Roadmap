import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/v1`
const API_KEY = import.meta.env.VITE_API_KEY || ''
const FETCH_OPTS = { headers: { 'x-api-key': API_KEY } }

export const SORT_SECTIONS = [
  {
    title: 'Priority',
    options: [
      { value: 'priority', label: 'Priority', hint: 'Needs attention first' },
    ],
  },
  {
    title: 'Release Date',
    options: [
      { value: 'nearest', label: 'Nearest', hint: 'Closest release date first' },
      { value: 'farthest', label: 'Farthest', hint: 'Farthest release date first' },
    ],
  },
  {
    title: 'Last Update',
    options: [
      { value: 'newest', label: 'Newest', hint: 'Most recently updated first' },
      { value: 'oldest', label: 'Oldest', hint: 'Least recently updated first' },
    ],
  },
]

const DAY_MS = 24 * 60 * 60 * 1000
const RECENT_WINDOW_DAYS = 30

function startOfDay(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// Tier "Priority": Overdue → In Progress → In Review → To Do (due ≤30 hari)
// → Upcoming (due jauh/tanpa tanggal) → Done (selesai ≤30 hari) → Done (lama).
// Overdue didahulukan dari status apa pun selama epic belum Done.
function priorityTier(task, todayMs) {
  if (task.status === 'Done') {
    if (!task.completedAt) return 6
    const cutoff = todayMs - RECENT_WINDOW_DAYS * DAY_MS
    return startOfDay(task.completedAt) >= cutoff ? 5 : 6
  }

  const due = task.endDate ? startOfDay(task.endDate) : null
  if (due !== null && due < todayMs) return 0
  if (task.status === 'In Progress') return 1
  if (task.status === 'In Review') return 2
  if (due === null) return 4
  const soonCutoff = todayMs + RECENT_WINDOW_DAYS * DAY_MS
  return due <= soonCutoff ? 3 : 4
}

const SORT_COMPARATORS = {
  priority: (a, b, todayMs) => {
    const tierA = priorityTier(a, todayMs)
    const tierB = priorityTier(b, todayMs)
    if (tierA !== tierB) return tierA - tierB

    if (tierA >= 5) {
      const doneA = a.completedAt ? startOfDay(a.completedAt) : 0
      const doneB = b.completedAt ? startOfDay(b.completedAt) : 0
      return doneB - doneA
    }
    const dateA = a.endDate ? startOfDay(a.endDate) : Infinity
    const dateB = b.endDate ? startOfDay(b.endDate) : Infinity
    return dateA - dateB
  },
  nearest: (a, b) => {
    const dateA = a.endDate ? startOfDay(a.endDate) : Infinity
    const dateB = b.endDate ? startOfDay(b.endDate) : Infinity
    return dateA - dateB
  },
  farthest: (a, b) => {
    const dateA = a.endDate ? startOfDay(a.endDate) : -Infinity
    const dateB = b.endDate ? startOfDay(b.endDate) : -Infinity
    return dateB - dateA
  },
  newest: (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
  oldest: (a, b) => new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime(),
}

export function useRoadmapData() {
  const [sortBy, setSortBy] = useState('priority')
  const [selectedStatuses, setSelectedStatuses] = useState([])
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedReleaseDate, setSelectedReleaseDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState([])
  const [filterOptions, setFilterOptions] = useState({ statuses: [], categories: [], releaseDates: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [taskHistory, setTaskHistory] = useState([])
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // Detail yang sudah pernah diambil disimpan supaya epic yang dibuka ulang
  // tampil seketika; pendingTaskId menjaga respons lama tidak menimpa item baru.
  const detailCache = useRef(new Map())
  const pendingTaskId = useRef(null)
  const inFlight = useRef(new Map())
  const listCache = useRef(new Map())

  // Hanya ketikan pencarian yang perlu ditahan. Dulu semua trigger (termasuk
  // load pertama dan klik filter) ikut kena delay 300ms tanpa alasan.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchQuery), 250)
    return () => clearTimeout(id)
  }, [searchQuery])

  useEffect(() => {
    const queryParams = new URLSearchParams()
    selectedStatuses.forEach((s) => queryParams.append('status', s))
    selectedCategories.forEach((c) => queryParams.append('project', c))
    if (selectedReleaseDate) queryParams.append('month', selectedReleaseDate)
    if (debouncedSearch) queryParams.append('search', debouncedSearch)
    const queryKey = queryParams.toString()

    const apply = ({ stories, summary, filterOptions: fOptions }) => {
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
    }

    // Kombinasi filter yang pernah dibuka tampil seketika sambil tetap
    // disegarkan di latar, jadi tidak ada layar kosong saat bolak-balik filter.
    const cached = listCache.current.get(queryKey)
    if (cached) apply(cached)
    setIsLoading(!cached)

    const controller = new AbortController()

    fetch(`${API_BASE_URL}/roadmap/stories?${queryKey}`, { ...FETCH_OPTS, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch stories')
        return response.json()
      })
      .then((result) => {
        listCache.current.set(queryKey, result.data)
        apply(result.data)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error(err)
        setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [selectedStatuses, selectedCategories, selectedReleaseDate, debouncedSearch])

  // Urutan dihitung di klien untuk semua opsi sort supaya ganti urutan terasa
  // seketika tanpa request baru ke backend.
  const sortedTasks = useMemo(() => {
    const todayMs = startOfDay(new Date())
    const cmp = SORT_COMPARATORS[sortBy] || SORT_COMPARATORS.priority

    return tasks
      .map((task, index) => ({ task, index }))
      .sort((a, b) => cmp(a.task, b.task, todayMs) || a.index - b.index)
      .map(({ task }) => task)
  }, [tasks, sortBy])

  const fetchTaskDetail = useCallback((task) => {
    const cached = detailCache.current.get(task.id)
    if (cached) return Promise.resolve(cached)

    // Prefetch saat hover dan klik bisa jatuh ke id yang sama — cukup satu request.
    const pending = inFlight.current.get(task.id)
    if (pending) return pending

    const request = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/roadmap/stories/${task.id}`, FETCH_OPTS)
        if (!response.ok) throw new Error('Failed to fetch story details')
        const result = await response.json()
        detailCache.current.set(task.id, result.data)
        return result.data
      } catch (err) {
        console.error(err)
        // null = biarkan panel tetap memakai data ringkas dari kartu.
        return null
      } finally {
        inFlight.current.delete(task.id)
      }
    })()

    inFlight.current.set(task.id, request)
    return request
  }, [])

  // Panel dibuka langsung dengan data yang sudah dimiliki kartu, lalu child
  // items & activity menyusul. Sebelumnya panel baru muncul setelah request
  // selesai, sehingga klik terasa tidak bereaksi.
  const openTask = useCallback(async (task) => {
    pendingTaskId.current = task.id

    const cached = detailCache.current.get(task.id)
    setSelectedTask(cached || task)
    setIsDetailLoading(!cached)
    if (cached) return

    const detail = await fetchTaskDetail(task)
    if (pendingTaskId.current !== task.id) return
    if (detail) setSelectedTask(detail)
    setIsDetailLoading(false)
  }, [fetchTaskDetail])

  // Dipanggil saat kursor menyentuh kartu supaya detail sudah siap sebelum diklik.
  const prefetchTask = useCallback((task) => {
    if (!detailCache.current.has(task.id)) fetchTaskDetail(task)
  }, [fetchTaskDetail])

  const handleTaskClick = useCallback((task) => {
    setIsDetailOpen(true)
    setTaskHistory([])
    openTask(task)
  }, [openTask])

  const handleChildClick = useCallback((child) => {
    if (selectedTask) setTaskHistory((prev) => [...prev, selectedTask])
    openTask(child)
  }, [selectedTask, openTask])

  const handleBack = useCallback(() => {
    if (taskHistory.length === 0) return
    const previous = taskHistory[taskHistory.length - 1]
    pendingTaskId.current = previous.id
    setSelectedTask(previous)
    setIsDetailLoading(false)
    setTaskHistory((prev) => prev.slice(0, -1))
  }, [taskHistory])

  const handleDetailClose = useCallback(() => {
    setIsDetailOpen(false)
    setTaskHistory([])
    setIsDetailLoading(false)
    pendingTaskId.current = null
    setTimeout(() => setSelectedTask(null), 300)
  }, [])

  const toggleStatus = useCallback((value) => {
    setSelectedStatuses((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ))
  }, [])

  const toggleCategory = useCallback((value) => {
    setSelectedCategories((prev) => (
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    ))
  }, [])

  const selectReleaseDate = useCallback((value) => {
    setSelectedReleaseDate((prev) => (prev === value ? '' : value))
  }, [])

  const clearAllFilters = useCallback(() => {
    setSelectedStatuses([])
    setSelectedCategories([])
    setSelectedReleaseDate('')
  }, [])

  return {
    tasks: sortedTasks,
    sortBy,
    setSortBy,
    stats,
    filterOptions,
    isLoading,
    error,
    selectedStatuses,
    selectedCategories,
    selectedReleaseDate,
    toggleStatus,
    toggleCategory,
    selectReleaseDate,
    clearAllFilters,
    searchQuery,
    setSearchQuery,
    selectedTask,
    isDetailOpen,
    isDetailLoading,
    prefetchTask,
    handleTaskClick,
    handleChildClick,
    handleBack,
    canGoBack: taskHistory.length > 0,
    handleDetailClose,
  }
}
