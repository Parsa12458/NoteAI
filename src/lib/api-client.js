/**
 * Centralized API Client for NoteAI Smart Classroom.
 * Manages communication with FastAPI backend, structured error handling,
 * configurable mock fallback, and upload tracking.
 */

const DEFAULT_BASE_URL = 'http://localhost:8000/api'

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Returns current API base URL from env or fallback.
 */
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string') {
    return envUrl.replace(/\/+$/, '')
  }
  return DEFAULT_BASE_URL
}

/**
 * Checks whether mock data mode is active.
 * Defaults to true for local development when backend is offline or configured so.
 */
export function isMockMode() {
  const localOverride = localStorage.getItem('noteai_mock_mode')
  if (localOverride !== null) {
    return localOverride === 'true'
  }
  return import.meta.env.VITE_USE_MOCK_DATA !== 'false'
}

export function setMockMode(enabled) {
  localStorage.setItem('noteai_mock_mode', enabled ? 'true' : 'false')
  window.dispatchEvent(new CustomEvent('noteai_mock_mode_changed', { detail: { enabled } }))
}

/**
 * General HTTP request wrapper with timeout and error extraction.
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = 15000,
    signal: externalSignal,
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Chain external signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort())
  }

  const url = `${getApiBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  let finalBody = body
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    requestHeaders['Content-Type'] = 'application/json'
    finalBody = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: finalBody,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorData = null
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }
      throw new ApiError(
        errorData?.detail || errorData?.message || `خطای سرور (${response.status})`,
        response.status,
        errorData
      )
    }

    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new ApiError('مهلت ارسال درخواست به پایان رسید (Timeout)', 408)
    }
    if (err instanceof ApiError) {
      throw err
    }
    throw new ApiError(`خطای شبکه یا عدم دسترسی به سرور: ${err.message}`, 0, err)
  }
}

/**
 * Ping backend health endpoint to check real reachability.
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}

