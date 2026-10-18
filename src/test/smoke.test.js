import { describe, it, expect } from 'vitest'

describe('Smoke test environment', () => {
  it('runs tests and verifies IndexedDB and MediaRecorder mocks exist', () => {
    expect(window.indexedDB).toBeDefined()
    expect(window.MediaRecorder).toBeDefined()
    expect(window.AudioContext).toBeDefined()
    expect(navigator.mediaDevices).toBeDefined()
  })
})

