//
// global variables
// main list of folders & files
var files = {};

// system and app info
var system = {};

var appstate = {
  // index of the file the user is looking at currently
  activefile: [-1, -1],
  // index of the file which has edit mode currently on
  currentlyediting: [-1, -1],
  // index of the block which currently has the block menu active
  activeblockmenu: -1,
  // index of the currently unlocked file
  unlockedfile: [-1, -1],
  // current theme
  currtheme: null,
};

// settings
var settings = {};

var filetreeindent = 10;

// keypress map
var keyMap = {};

// save which folders are collapsed
var collapseState = [false, false, false];

// new object defaults
var newFolderName = "Folder";
var newFileName = "File";
var newTextBlockText = "";
var newHeadingBlockText = "";
var newCodeBlockText = "";
var newInlineCodeBlockText = "&nbsp;&nbsp;";

var inlineBlockTypes = [
  {
    name: "Code",
    type: "inline_code",
    icon: "block_code",
    allowedparents: ["text", "heading"],
  },
];

var blockTypes = [
  {
    name: "Heading",
    type: "heading",
    icon: "block_heading",
  },
  {
    name: "Text",
    type: "text",
    icon: "block_text",
  },
  {
    name: "Divider",
    type: "divider",
    icon: "block_divider",
  },
  {
    name: "Code",
    type: "code",
    icon: "block_code",
  },
];

// return file based of a path, eg: [0, 0, 0]
function getIndex(path) {
  let obj = files;
  for (let i = 0; i < path.length; i++) {
    if (obj == files) {
      obj = obj[path[i]];
    } else {
      obj = obj.children[path[i]];
    }
  }
  return obj;
}

function blockMenu(index, b, activator) {
  try {
    document.querySelector(".blockmenubtn.active").classList.remove("active");
  } catch (err) {}
  activator.classList.add("active");
  let blockMenu = document.querySelector("#blockmenu");
  document.querySelector("#blockmenu #newblockbtns").innerHTML = "";
  document.querySelector("#blockmenu #newinlineblockbtns").innerHTML = "";
  document.querySelector(".inline-blocks").style.display = "none";

  // block buttons
  // new block buttons
  for (let t = 0; t < blockTypes.length; t++) {
    let btn = createElement("button", { class: "newblockbtn", innerhtml: blockTypes[t].name });
    if (currtheme == "dark") {
      btn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[t].icon}_d.svg)`;
    } else if (currtheme == "light") {
      btn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[t].icon}_l.svg)`;
    }
    btn.onclick = function () {
      newBlock(index, appstate.activeblockmenu, blockTypes[t].type);
      generateMenubar(index);
      // hide block menu
      hideBlockMenu();
    };
    document.querySelector("#blockmenu #newblockbtns").append(btn);
  }

  // new inline block buttons
  for (let t = 0; t < inlineBlockTypes.length; t++) {
    if (inlineBlockTypes[t].allowedparents.includes(index.blocks[b].type)) {
      // if inline block is allowed in this parent block
      document.querySelector("#blockmenu .header.inline-blocks").style.display = "block";
      let btn = createElement("button", { class: "newblockbtn", innerhtml: inlineBlockTypes[t].name });
      if (currtheme == "dark") {
        btn.style.backgroundImage = `url(../assets/icons/blocks/${inlineBlockTypes[t].icon}_d.svg)`;
      } else if (currtheme == "light") {
        btn.style.backgroundImage = `url(../assets/icons/blocks/${inlineBlockTypes[t].icon}_l.svg)`;
      }
      btn.onclick = function () {
        newBlock(index, appstate.activeblockmenu, inlineBlockTypes[t].type);
        generateMenubar(index);
        // hide block menu
        hideBlockMenu();
      };
      document.querySelector("#blockmenu #newinlineblockbtns").append(btn);
    }
  }

  // toggle displaying the div
  blockMenu.style.display = blockMenu.style.display == "flex" ? "none" : "flex";
  if (blockMenu.style.display == "none") {
    document.querySelector(".blockmenubtn.active").classList.remove("active");
  }

  // change active block menu
  if (b != appstate.activeblockmenu) {
    // if it's a different block, dont hide it,
    blockMenu.style.display = blockMenu.style.display = "flex";
  }
  appstate.activeblockmenu = b;

  // change position
  let activatorRect = activator.getBoundingClientRect();
  blockMenu.style.top = window.scrollY + activatorRect.top + 28 + "px";
  blockMenu.style.left = window.scrollX + activatorRect.left + "px";

  // delete block btn
  document.querySelector("#blockmenu #deleteblockbtn").onclick = function () {
    deleteBlock(index, b);
    hideBlockMenu();
  };
  document.querySelector("#blockmenu #deleteblockbtn").style.backgroundImage = `url(../assets/icons/trash_${
    currtheme == "dark" ? "d" : "l"
  }.svg)`;
}

function tooltip(text, shortcut, activator, xoff) {
  let tooltip = document.querySelector("#tooltip");

  activator.onmouseover = function () {
    // toggle displaying the div
    tooltip.style.display = "flex";
    // change text
    document.querySelector("#tooltip #text").innerHTML = text;
    document.querySelector("#tooltip #shortcut").innerHTML = shortcut;
    // change position
    let activatorRect = activator.getBoundingClientRect();
    tooltip.style.top = window.scrollY + activatorRect.top + 28 + "px";
    tooltip.style.left = window.scrollX + activatorRect.left + xoff + "px";
  };
  activator.onmouseleave = function () {
    tooltip.style.display = "none";
  };
  return activator;
}

function refreshTooltip(text, shortcut, activator, xoff) {
  let tooltip = document.querySelector("#tooltip");

  // toggle displaying the div
  tooltip.style.display = "flex";
  // change text
  document.querySelector("#tooltip #text").innerHTML = text;
  document.querySelector("#tooltip #shortcut").innerHTML = shortcut;
  // change position
  let activatorRect = activator.getBoundingClientRect();
  tooltip.style.top = window.scrollY + activatorRect.top + 28 + "px";
  tooltip.style.left = window.scrollX + activatorRect.left + xoff + "px";
}

function editingFile(val, p, c) {
  if (val == false) {
    // editing off
    document.querySelector(".editbtn").style.backgroundImage = "url(../assets/icons/navbars/pen.svg)";
    appstate.currentlyediting = [-1, -1];
    hideBlockMenu();
  } else {
    // editing on
    document.querySelector(".editbtn").style.backgroundImage = "url(../assets/icons/navbars/pen_edit.svg)";
    appstate.currentlyediting = [p, c];
  }
}

function hideBlockMenu() {
  document.querySelector("#blockmenu").style.display = "none";
  document.querySelector(".blockmenubtn.active").classList.remove("active");
}

function deleteFile(path) {
  let temp = path.pop();
  let parent = getIndex(path);
  parent.children.splice(temp, 1);
  writeFiles();
  generateSidenav();
}

function getSidenavBtn(path) {
  let btn = "";
  btn = document.querySelectorAll("#filebtns .filebtndiv")[path[0]];
  if (path.length > 1) {
    for (let i = 0; i < path.length; i++) {
      if (i == path.length - 1) {
        btn = btn.children[path[i]];
      } else if (i == 0) {
        btn = document.querySelectorAll(".childfiles")[path[i]];
      } else {
        btn = btn.querySelectorAll(".childfiles")[path[i]];
      }
    }
  } else {
    // root parent file
    btn = document.querySelectorAll("#filebtns .filebtndiv")[path[0]];
  }
  return btn;
}

function theme(t) {
  try {
    document.querySelector(".themebtn.active").classList.remove("active");
  } catch (err) {}

  document.querySelector("." + t + ".themebtn").classList.add("active");

  settings.theme = t;
  writeSettings();
  if (t == "dark") {
    // dark
    document.querySelector(":root").setAttribute("theme", "dark");
    currtheme = "dark";
  } else if (t == "light") {
    // light
    document.querySelector(":root").setAttribute("theme", "light");
    currtheme = "light";
  } else if (t == "default") {
    // use os
    if (system.darktheme == true) {
      // dark
      document.querySelector(":root").setAttribute("theme", "dark");
      currtheme = "dark";
    } else {
      // light
      document.querySelector(":root").setAttribute("theme", "light");
      currtheme = "light";
    }
  } else if (t == "auto") {
    // time based
    let d = new Date();
    if (d.getHours() > 16 || d.getHours() < 9) {
      // dark, 5:00pm - 8:59am
      document.querySelector(":root").setAttribute("theme", "dark");
      currtheme = "dark";
    } else {
      // light 9:00am - 4:59pm
      document.querySelector(":root").setAttribute("theme", "light");
      currtheme = "light";
    }
  }
}

function generatePath(index) {
  let container = document.querySelector("#path");
  let obj = files;
  let store = [];

  for (let i = 0; i < index.path.length; i++) {
    if (obj == files) {
      obj = obj[index.path[i]];
    } else {
      obj = obj.children[index.path[i]];
    }
    store.push(obj);
  }

  // store is now an array of the hierarchy
  // create the buttons
  for (let b = 0; b < store.length; b++) {
    let button = createElement("button", {
      class: "pathbtn",
      innerhtml: store[b].name.replace(/ /g, "") == "" ? "Untitled File" : store[b].name,
    });

    button.onclick = function () {
      gotoFile(store[b]);
    };
    container.append(button);

    if (b != store.length - 1) {
      let slash = createElement("p", { class: "slash", innerhtml: "/" });
      container.append(slash);
    }
  }
}

function deleteFolder(p) {
  files.splice(p, 1);
  writeFiles();
}

function newBlock(index, b, type) {
  let d = new Date();
  if (type == "text" || type == "heading" || type == "code") {
    index.blocks.splice(b, 0, {
      type: type,
      text: newTextBlockText,
    });
  } else if (type == "divider") {
    index.blocks.splice(b, 0, {
      type: type,
    });
  } else if (type == "inline_code") {
    console.log(" new inlnien coe edelbock");
    index.blocks[b].text += `&nbsp;<div class="inline block ${type}">${newInlineCodeBlockText}</div>&nbsp;`;
  }

  // update last edited
  index.lastedited = d.getTime();

  writeFiles();
  generateFile(index);
  generateMenubar(index);
}

function deleteBlock(index, b) {
  index.blocks.splice(b, 1);
  writeFiles();
  generateFile(index);
}

function newFile(index) {
  let d = new Date();
  if (index.children == null) {
    index.children = [];
  }
  index.children.push({
    name: newFileName,
    creationdate: d.getTime(),
    lastedited: d.getTime(),
    path: index.path.concat(index.children.length),
    starred: false,
    locked: false,
    blocks: [],
    children: [],
  });

  writeFiles();
  generateSidenav();
}

function newFolder() {
  files.push({
    name: newFolderName,
    children: [],
  });

  writeFiles();
  generateSidenav();
}

// writing files.json
function writeFiles() {
  window.api.send("writeFiles", JSON.stringify(files));
}

// writing settings.json
function writeSettings() {
  window.api.send("writeSettings", JSON.stringify(settings));
}

// takes in an hour 0-24 and returns if that's am or pm in 12 hour time
function getAmPm(time) {
  let mod = "";
  if (time.getHours() > 11) {
    mod = "PM";
  } else {
    mod = "AM";
  }
  return mod;
}

function appendElements(parent, elems) {
  for (let i = 0; i < elems.length; i++) {
    parent.append(elems[i]);
  }
}

function createElement(type, params) {
  let elem = document.createElement(type);

  if (params.innerhtml) {
    elem.innerHTML = params.innerhtml;
  }
  if (params.value) {
    elem.value = params.value;
  }
  if (params.placeholder) {
    elem.placeholder = params.placeholder;
  }
  if (params.src) {
    elem.src = params.src;
  }
  if (params.class) {
    elem.className = params.class;
  }
  if (params.contenteditable) {
    elem.contentEditable = params.contenteditable;

    elem.spellcheck = false;
  }
  if (params.type) {
    elem.type = params.type;
  }
  if (params.disabled) {
    elem.disabled = params.disabled;
  }
  if (params.title) {
    elem.title = params.title;
  }
  if (params.hide == true) {
    elem.style.display = "none";
  }
  if (params.backgroundimage) {
    elem.style.backgroundImage = params.backgroundimage;
  }

  if (params.id) {
    elem.id = params.id;
  }

  return elem;
}

// params: current time (ms), past/future time (ms)
// returns: how long ago the date was OR in how long the date is
// eg: "9 hours ago", "in 3 weeks"
function timeAgo(date) {
  var time = "";
  let d = new Date();
  let now = d.getTime();
  if (now - date > -1000 && now - date < 1000) {
    // within 1 second
    time = "Now";
  }
  if (now - date > 1000 * 60 * 60 * 24 * 30) {
    // months ago, uses 30 days per month
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30));
    if (time1 == 1) {
      time = time1 + " month ago";
    } else {
      time = time1 + " months ago";
    }
  } else if (now - date > 1000 * 60 * 60 * 24 * 7) {
    // weeks ago
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 7));
    if (time1 == 1) {
      time = time1 + " week ago";
    } else {
      time = time1 + " weeks ago";
    }
  } else if (now - date > 1000 * 60 * 60 * 24) {
    // days ago
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (time1 == 1) {
      time = time1 + " day ago";
    } else {
      time = time1 + " days ago";
    }
  } else if (now - date > 1000 * 60 * 60) {
    // hours ago
    let time1 = Math.floor((now - date) / (1000 * 60 * 60));
    if (time1 == 1) {
      time = time1 + " hour ago";
    } else {
      time = time1 + " hours ago";
    }
  } else if (now - date > 1000 * 60) {
    // minutes ago
    let time1 = Math.floor((now - date) / (1000 * 60));
    if (time1 == 1) {
      time = time1 + " minute ago";
    } else {
      time = time1 + " minutes ago";
    }
  } else if (now - date > 1000) {
    // seconds ago
    let time1 = Math.floor((now - date) / 1000);
    if (time1 == 1) {
      time = time1 + " second ago";
    } else {
      time = time1 + " seconds ago";
    }
  } else if (now - date < -(1000 * 60 * 60 * 24 * 30)) {
    // in months, uses 30 days per month
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60 * 24 * 30));
    if (time1 == 1) {
      time = "in " + time1 + " month";
    } else {
      time = "in " + time1 + " months";
    }
  } else if (now - date < -(1000 * 60 * 60 * 24 * 7)) {
    // in weeks
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60 * 24 * 7));
    if (time1 == 1) {
      time = "in " + time1 + " week";
    } else {
      time = "in " + time1 + " weeks";
    }
  } else if (now - date < -(1000 * 60 * 60 * 24)) {
    // in days
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60 * 24));
    if (time1 == 1) {
      time = "in " + time1 + " day";
    } else {
      time = "in " + time1 + " days";
    }
  } else if (now - date < -(1000 * 60 * 60)) {
    // in hours
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60));
    if (time1 == 1) {
      time = "in " + time1 + " hour";
    } else {
      time = "in " + time1 + " hours";
    }
  } else if (now - date < -(1000 * 60)) {
    // in minutes
    let time1 = Math.floor((now - date) / -(1000 * 60));
    if (time1 == 1) {
      time = "in " + time1 + " minute";
    } else {
      time = "in " + time1 + " minutes";
    }
  } else if (now - date < -1000) {
    // in seconds
    let time1 = Math.floor((now - date) / -1000);
    if (time1 == 1) {
      time = "in " + time1 + " second";
    } else {
      time = "in " + time1 + " seconds";
    }
  }

  return time;
}

// keypresses
onkeydown = onkeyup = function (e) {
  keyMap[e.code] = e.type == "keydown";
};
