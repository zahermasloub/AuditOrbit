import { useState, useEffect } from 'react'
import { findingsApi, Finding, FindingsFilters } from '@/lib/api'

export function useFindings(filters: FindingsFilters = {}) {
  const [findings, setFindings] = useState<Finding[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(filters.page || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFindings()
  }, [page, filters.engagement_id, filters.severity, filters.status])

  async function loadFindings() {
    try {
      setLoading(true)
      setError(null)
      const data = await findingsApi.list({ ...filters, page })
      setFindings(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load findings')
      console.error('Failed to load findings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createFinding(data: Parameters<typeof findingsApi.create>[0]) {
    try {
      setLoading(true)
      setError(null)
      const newFinding = await findingsApi.create(data)
      setFindings(prev => [newFinding, ...prev])
      setTotal(prev => prev + 1)
      return newFinding
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create finding')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function updateFinding(id: string, data: Parameters<typeof findingsApi.update>[1]) {
    try {
      setLoading(true)
      setError(null)
      const updated = await findingsApi.update(id, data)
      setFindings(prev => prev.map(f => f.id === id ? updated : f))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update finding')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function deleteFinding(id: string) {
    try {
      setLoading(true)
      setError(null)
      await findingsApi.delete(id)
      setFindings(prev => prev.filter(f => f.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete finding')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: Finding['status']) {
    try {
      setLoading(true)
      setError(null)
      const updated = await findingsApi.updateStatus(id, status)
      setFindings(prev => prev.map(f => f.id === id ? updated : f))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
      throw err
    } finally {
      setLoading(false)
    }
  }

  function refresh() {
    loadFindings()
  }

  return {
    findings,
    total,
    page,
    loading,
    error,
    setPage,
    createFinding,
    updateFinding,
    deleteFinding,
    updateStatus,
    refresh,
  }
}
