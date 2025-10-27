import { useState, useEffect } from 'react'
import { evidenceApi, Evidence, EvidenceFilters } from '@/lib/api'

export function useEvidence(filters: EvidenceFilters = {}) {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(filters.page || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvidence()
  }, [page, filters.engagement_id, filters.finding_id, filters.type])

  async function loadEvidence() {
    try {
      setLoading(true)
      setError(null)
      const data = await evidenceApi.list({ ...filters, page })
      setEvidence(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load evidence')
      console.error('Failed to load evidence:', err)
    } finally {
      setLoading(false)
    }
  }

  async function uploadEvidence(data: Parameters<typeof evidenceApi.upload>[0]) {
    try {
      setLoading(true)
      setError(null)
      const newEvidence = await evidenceApi.upload(data)
      setEvidence(prev => [newEvidence, ...prev])
      setTotal(prev => prev + 1)
      return newEvidence
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload evidence')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function createEvidence(data: Parameters<typeof evidenceApi.create>[0]) {
    try {
      setLoading(true)
      setError(null)
      const newEvidence = await evidenceApi.create(data)
      setEvidence(prev => [newEvidence, ...prev])
      setTotal(prev => prev + 1)
      return newEvidence
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create evidence')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function updateEvidence(id: string, data: Parameters<typeof evidenceApi.update>[1]) {
    try {
      setLoading(true)
      setError(null)
      const updated = await evidenceApi.update(id, data)
      setEvidence(prev => prev.map(e => e.id === id ? updated : e))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update evidence')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function deleteEvidence(id: string) {
    try {
      setLoading(true)
      setError(null)
      await evidenceApi.delete(id)
      setEvidence(prev => prev.filter(e => e.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete evidence')
      throw err
    } finally {
      setLoading(false)
    }
  }

  function refresh() {
    loadEvidence()
  }

  return {
    evidence,
    total,
    page,
    loading,
    error,
    setPage,
    uploadEvidence,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    refresh,
  }
}
