const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Ejemplo: Enviar mensajes al proceso principal
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  
  // Ejemplo: Recibir respuestas
  onResponse: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },

  // Aquí puedes exponer funciones para consultar Prisma vía IPC
  // (Prisma debe ejecutarse en el proceso Main, nunca en el Renderer)
});