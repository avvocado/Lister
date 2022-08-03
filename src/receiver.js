// receiving data from main.js

window.api.receive("files", (args) => {
  // receiving list.json
  files = args;
  start();
});
