
const {
  contextBridge,
  ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
  send: (channel, data, data1) => {
    // whitelist channels
    ipcRenderer.send(channel, data, data1);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
}
);