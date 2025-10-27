import { useState, useEffect } from 'react'
import { engagementsApi, Engagement, EngagementsFilters } from '@/lib/api'

export function useEngagements(filters: EngagementsFilters = {}) {
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(filters.page || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEngagements()
  }, [page, filters.status, filters.size])

  async function loadEngagements() {
    try {
      setLoading(true)
      setError(null)
      const data = await engagementsApi.list({ ...filters, page })
      setEngagements(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load engagements')
      console.error('Failed to load engagements:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createEngagement(data: Parameters<typeof engagementsApi.create>[0]) {
    try {
      setLoading(true)
      setError(null)
      const newEngagement = await engagementsApi.create(data)
      setEngagements(prev => [newEngagement, ...prev])
      setTotal(prev => prev + 1)
      return newEngagement
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create engagement')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function deleteEngagement(id: string) {
    try {
      setLoading(true)
      setError(null)
      await engagementsApi.delete(id)
      setEngagements(prev => prev.filter(e => e.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete engagement')
      throw err
    } finally {
      setLoading(false)
    }
  }

  function refresh() {
    loadEngagements()
  }

  return {
    engagements,
    total,
    page,
    loading,
    error,
    setPage,
    createEngagement,
    deleteEngagement,
    refresh,
  }
}
