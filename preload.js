

// on load
window.addEventListener('DOMContentLoaded', () => {
  console.log('Chromium ' + process.versions['chrome'])
  console.log('Node.js ' + process.versions['node'])
  console.log('Electron.js ' + process.versions['electron'])
})


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
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data, data1);
    }
  },
  receive: (channel, func) => {
    let validChannels = ["toRenderer"];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` 
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
}
);