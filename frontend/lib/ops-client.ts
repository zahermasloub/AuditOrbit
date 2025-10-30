export class OpsError extends Error {
  code?: string
  status: number
  details?: unknown

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'OpsError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const OPS_BASE = '/ops/api/ops'

type FetchJsonOptions = RequestInit & {
  json?: unknown
}

async function fetchJson<T>(path: string, options: FetchJsonOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const init: RequestInit = {
    ...options,
    headers,
  }

  if (options.json !== undefined) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    init.body = JSON.stringify(options.json)
  }

  const response = await fetch(path, init)

  if (!response.ok) {
    const data = await safeParseJson(response)
    const errorPayload = (data as { error?: { code?: string; message?: string; details?: unknown } })?.error
    const message = errorPayload?.message || response.statusText || 'حدث خطأ غير متوقع'
    const error = new OpsError(message, response.status, errorPayload?.code, errorPayload?.details)
    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentLength = response.headers.get('Content-Length')
  if (contentLength === '0') {
    return undefined as T
  }

  return (await safeParseJson(response)) as T
}

async function safeParseJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return undefined
  }
}

function buildQuery(params: Record<string, string | number | boolean | null | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export interface StorageFolderItem {
  key: string
  name: string
  isFolder: true
}

export interface StorageFileItem {
  key: string
  name: string
  size: number
  etag: string
  lastModified: string | null
  contentType: string
  isFolder: false
}

export type StorageObjectItem = StorageFolderItem | StorageFileItem

export interface StorageListResponse {
  prefix: string
  folders: StorageFolderItem[]
  items: StorageFileItem[]
  nextCursor?: string | null
  count: number
}

export interface StorageMoveCopyInput {
  source: string
  destination: string
}

export interface SettingsItem {
  key: string
  value: string
  group: string
  description: string
  isSecret: boolean
  defaultValue?: string | null
  updatedAt?: string | null
  updatedBy?: string | null
}

export interface SettingsListResponse {
  items: SettingsItem[]
  total: number
}

export interface CreateSettingInput {
  key: string
  value: string
  group?: string
  description?: string
  isSecret?: boolean
  defaultValue?: string | null
  updatedBy?: string
}

export interface UpdateSettingInput {
  key: string
  value: string
  group?: string
  description?: string
  isSecret?: boolean
  updatedBy?: string
}

export const opsClient = {
  async listStorage(params: { prefix?: string; q?: string; limit?: number; cursor?: string } = {}) {
    const query = buildQuery(params)
    return fetchJson<StorageListResponse>(`${OPS_BASE}/storage/objects${query}`)
  },

  async getDownloadUrl(key: string) {
    const query = buildQuery({ key })
    return fetchJson<{ url: string }>(`${OPS_BASE}/storage/download-url${query}`)
  },

  async getUploadUrl(body: { key: string; contentType: string }) {
    return fetchJson<{ url: string; headers: Record<string, string>; key: string }>(
      `${OPS_BASE}/storage/upload-url`,
      { method: 'POST', json: body },
    )
  },

  async renameObject(body: { source: string; newKey: string }) {
    return fetchJson(`${OPS_BASE}/storage/rename`, { method: 'PUT', json: body })
  },

  async moveCopyObjects(body: { items: StorageMoveCopyInput[]; mode: 'move' | 'copy' }) {
    return fetchJson(`${OPS_BASE}/storage/move-copy`, { method: 'POST', json: body })
  },

  async deleteObjects(keys: string[]) {
    return fetchJson(`${OPS_BASE}/storage/objects`, { method: 'DELETE', json: { keys } })
  },

  async listSettings(params: { group?: string; q?: string } = {}) {
    const query = buildQuery(params)
    return fetchJson<SettingsListResponse>(`${OPS_BASE}/settings${query}`)
  },

  async createSetting(body: CreateSettingInput) {
    return fetchJson(`${OPS_BASE}/settings`, { method: 'POST', json: body })
  },

  async updateSettingsBulk(items: UpdateSettingInput[]) {
    return fetchJson(`${OPS_BASE}/settings`, { method: 'PUT', json: { items } })
  },

  async updateSetting(key: string, body: Omit<UpdateSettingInput, 'key'>) {
    return fetchJson(`${OPS_BASE}/settings/${encodeURIComponent(key)}`, { method: 'PUT', json: body })
  },

  async deleteSetting(key: string, options: { reset?: boolean } = {}) {
    const query = buildQuery({ reset: options.reset })
    return fetchJson(`${OPS_BASE}/settings/${encodeURIComponent(key)}${query}`, { method: 'DELETE' })
  },
}
