// receiving data from main.js

window.api.receive("error", (args) => {
  document.querySelector("#error").style.display = "flex";
  document.querySelector("#error").innerHTML = args;
  document.querySelector("#app").style.opacity = "0";
});

window.api.receive("files", (args) => {
  // receiving list.json
  files = args;
  console.log(files);
  start();
});

window.api.receive("settings", (args) => {
  // receiving settings.json
  settings = args;
  console.log(settings);

  // theme
  theme(settings.theme);

  // file tree indentation
  document.querySelector("#filetreeindentslider").value = settings.filetreeindentation;
  document.querySelector("#filetreeindentdisplay").innerHTML = "(" + settings.filetreeindentation + "px)";

  setTimeout(() => {
    // allow time for theme to load
    document.querySelector("#app").style.display = "block";
  }, 100);
  generateSidenav();
});

window.api.receive("system", (args) => {
  // receiving system & app info
  system = args;
  if (system.os == "win32") {
    // show the buttons
    document.querySelector("#winbtns").style.display = "flex";
  } else if (system.os == "darwin") {
    // macos, use the default traffic light buttons
    document.querySelector("#fileactions").style.marginRight = "6px";
  }

  console.log(system);
});

window.api.receive("settingspage", (args) => {
  // go to settings page
  showSettings();
});
