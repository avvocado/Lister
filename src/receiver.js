// receiving data from main.js

window.api.receive("files", (args) => {
  // receiving list.json
  console.log(args)
  files = args;
  start();
});
