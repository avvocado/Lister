// receiving data from main.js

window.api.receive("error", (args) => {
  // error in one of the json files
  document.querySelector("#error").style.display = "flex";
  document.querySelector("#error").innerHTML = args;
  let openresourcesbtn = createElement("button", { innerhtml: "Open Resources Folder" });
  openresourcesbtn.onclick = function () {
    window.api.send("openResources", "");
  };
  document.querySelector("#error").append(openresourcesbtn);
  document.querySelector("#app").style.opacity = "0";
});

window.api.receive("media", (args) => {
  // finished copying media

  let index = getIndex(args.path);

  index.blocks.splice(args.b, 0, {
    type: "embed_file",
    src: args.filename,
  });

  writeFiles();
  generateFile(index);
  generateMenubar(index);
});

window.api.receive("files", (args) => {
  // receiving files.json
  files = args;
  console.log(files);
  generateSidenav();
});

window.api.receive("drafts", (args) => {
  // receiving drafts.json
  drafts = args;
  console.log(drafts);
  doDraftCount();
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
