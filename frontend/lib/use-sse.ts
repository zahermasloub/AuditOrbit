'use client'

import { useEffect, useMemo, useRef } from 'react'

export interface OpsEvent<T = unknown> {
  type: string
  action?: string
  ts?: string
  data?: T
  message?: string
  details?: unknown
}

interface UseSseOptions {
  eventTypes?: string[]
  onError?: (error: Event) => void
  withCredentials?: boolean
}

export function useOpsSse<T = unknown>(
  onEvent: (event: OpsEvent<T>) => void,
  options: UseSseOptions = {},
) {
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  const filterSet = useMemo(() => {
    if (!options.eventTypes || options.eventTypes.length === 0) return null
    return new Set(options.eventTypes)
  }, [options.eventTypes])

  useEffect(() => {
    const source = new EventSource('/ops/api/ops/events', {
      withCredentials: options.withCredentials ?? true,
    })

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as OpsEvent<T>
        if (filterSet && !filterSet.has(payload.type)) {
          return
        }
        handlerRef.current(payload)
      } catch (error) {
        // Ignore malformed events but keep the stream alive
        console.warn('Ops SSE parse error', error)
      }
    }

    source.onerror = (event) => {
      options.onError?.(event)
    }

    return () => {
      source.close()
    }
  }, [filterSet, options.onError, options.withCredentials])
}
