import { useState, useEffect } from 'react'
import { reportsApi, Report, ReportsFilters } from '@/lib/api'

export function useReports(filters: ReportsFilters = {}) {
  const [reports, setReports] = useState<Report[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(filters.page || 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [page, filters.engagement_id, filters.type, filters.status])

  async function loadReports() {
    try {
      setLoading(true)
      setError(null)
      const data = await reportsApi.list({ ...filters, page })
      setReports(data.items)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
      console.error('Failed to load reports:', err)
    } finally {
      setLoading(false)
    }
  }

  async function createReport(data: Parameters<typeof reportsApi.create>[0]) {
    try {
      setLoading(true)
      setError(null)
      const newReport = await reportsApi.create(data)
      setReports(prev => [newReport, ...prev])
      setTotal(prev => prev + 1)
      return newReport
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function updateReport(id: string, data: Parameters<typeof reportsApi.update>[1]) {
    try {
      setLoading(true)
      setError(null)
      const updated = await reportsApi.update(id, data)
      setReports(prev => prev.map(r => r.id === id ? updated : r))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update report')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function deleteReport(id: string) {
    try {
      setLoading(true)
      setError(null)
      await reportsApi.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
      setTotal(prev => prev - 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report')
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function generateReport(id: string) {
    try {
      setLoading(true)
      setError(null)
      const updated = await reportsApi.generate(id)
      setReports(prev => prev.map(r => r.id === id ? updated : r))
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
      throw err
    } finally {
      setLoading(false)
    }
  }

  function refresh() {
    loadReports()
  }

  return {
    reports,
    total,
    page,
    loading,
    error,
    setPage,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    refresh,
  }
}
