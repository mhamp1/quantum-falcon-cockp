// QUANTUM FALCON — Electron Preload Script
// Secure bridge between renderer and main process

const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  platform: process.platform,
  isElectron: true,
  
  // Safe IPC methods (if needed later)
  send: (channel, data) => {
    const validChannels = ['toMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})

// Notify when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('[Quantum Falcon] Desktop app loaded')
})

