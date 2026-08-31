import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Configuration and Onboarding
  configNeedsOnboarding: () => ipcRenderer.invoke('config:needs-onboarding'),
  configGet: () => ipcRenderer.invoke('config:get'),
  configCreateInitial: (configData) => ipcRenderer.invoke('config:create-initial', configData),
  configValidate: (configData) => ipcRenderer.invoke('config:validate', configData),

  // Generic message sending
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  onResponse: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
})