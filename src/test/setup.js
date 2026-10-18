import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock window.navigator.storage
if (!navigator.storage) {
  Object.defineProperty(navigator, 'storage', {
    writable: true,
    value: {
      estimate: async () => ({ quota: 1024 * 1024 * 1024, usage: 1024 * 1024 * 5 }),
      persist: async () => true,
      persisted: async () => true,
    },
  })
}

// Mock Web Audio API
class MockAnalyserNode {
  constructor() {
    this.fftSize = 256
    this.frequencyBinCount = 128
  }
  getByteFrequencyData(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 80)
    }
  }
  connect() {}
  disconnect() {}
}

class MockAudioContext {
  constructor() {
    this.state = 'running'
  }
  createMediaStreamSource() {
    return {
      connect: () => {},
      disconnect: () => {},
    }
  }
  createAnalyser() {
    return new MockAnalyserNode()
  }
  close() {
    this.state = 'closed'
    return Promise.resolve()
  }
}

window.AudioContext = window.AudioContext || MockAudioContext
window.webkitAudioContext = window.webkitAudioContext || MockAudioContext

// Mock MediaRecorder
class MockMediaRecorder {
  constructor(stream, options = {}) {
    this.stream = stream
    this.mimeType = options.mimeType || 'audio/webm'
    this.state = 'inactive'
    this.ondataavailable = null
    this.onerror = null
    this.onstart = null
    this.onstop = null
    this.onpause = null
    this.onresume = null
  }

  start(timeslice) {
    this.state = 'recording'
    if (this.onstart) this.onstart()
    this._interval = setInterval(() => {
      if (this.state === 'recording' && this.ondataavailable) {
        const dummyBlob = new Blob(['mock audio chunk bytes'], { type: this.mimeType })
        this.ondataavailable({ data: dummyBlob })
      }
    }, timeslice || 100)
  }

  pause() {
    this.state = 'paused'
    if (this.onpause) this.onpause()
  }

  resume() {
    this.state = 'recording'
    if (this.onresume) this.onresume()
  }

  stop() {
    this.state = 'inactive'
    if (this._interval) clearInterval(this._interval)
    if (this.ondataavailable) {
      const finalBlob = new Blob(['final chunk bytes'], { type: this.mimeType })
      this.ondataavailable({ data: finalBlob })
    }
    if (this.onstop) this.onstop()
  }

  static isTypeSupported(type) {
    return type.includes('audio/webm') || type.includes('audio/mp4') || type.includes('audio/ogg')
  }
}

window.MediaRecorder = window.MediaRecorder || MockMediaRecorder

// Mock MediaDevices
if (!navigator.mediaDevices) {
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: async () => ({
        getTracks: () => [
          {
            stop: () => {},
            kind: 'audio',
            enabled: true,
          },
        ],
      }),
      enumerateDevices: async () => [
        { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' },
        { deviceId: 'mic-2', kind: 'audioinput', label: 'Studio Microphone' },
      ],
    },
  })
}

