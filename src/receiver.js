// receiving data from main.js

window.api.receive("files", (args) => {
  // receiving list.json
  files = args;
  start();
});

window.api.receive("system", (args) => {
  // receiving system & app info
  system = args;
  if (system.os == "win32") {
    // show the buttons
    document.querySelector("#osbtns").style.display = "flex";
  } else if (system.os == "darwin") {
    // macos, use the default traffic light buttons
    document.querySelector("#fileactions").style.marginRight = "6px";
  }
});
