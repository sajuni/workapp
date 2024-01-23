const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  attendance: (param) => {
    ipcRenderer.send("attendance", param);
  },
  inspection: (param) => {
    ipcRenderer.send("inspection", param);
  },
  getUserInfo: async () => {
    await ipcRenderer.send("getUserInfo");
  },
  changeInfo: (param) => {
    ipcRenderer.send("changeInfo", param);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  getSelectBoxOption: () => {
    ipcRenderer.send("getSelectBoxOption");
  },
});
