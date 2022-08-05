//
// global variables
// main list of folders & files
var files = {};

var appstate = {
  // index of the file the user is looking at currently
  activefile: [-1, -1],
  // index of the file which has edit mode currently on
  currentlyediting: [-1, -1],
  // index of the block which currently has the block menu active
  activeblockmenu: -1,
  // index of the currently unlocked file
  unlockedfile: [-1, -1],
};

// settings
var settings = { password: "123" };

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

var blockTypes = [
  {
    name: "Text",
    type: "text",
    icon: "block_text",
  },
  {
    name: "Heading",
    type: "heading",
    icon: "block_heading",
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

function blockMenu(p, c, b, activator) {
  // toggle displaying the div
  let blockMenu = document.querySelector("#blockmenu");
  blockMenu.style.display = blockMenu.style.display == "flex" ? "none" : "flex";

  // change active block menu
  appstate.activeblockmenu = b;

  // change position
  let activatorRect = activator.getBoundingClientRect();
  blockMenu.style.top = window.scrollY + activatorRect.top + 28 + "px";
  blockMenu.style.left = window.scrollX + activatorRect.left + "px";

  // delete block btn
  document.querySelector("#blockmenu #deleteblockbtn").onclick = function () {
    deleteBlock(p, c, b);
    hideBlockMenu();
  };
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
}

function deleteFile(p, c) {
  files.folders[p].files.splice(c, 1);
  writeFiles(files);
}

function deleteFolder(p) {
  files.folders.splice(p, 1);
  writeFiles(files);
}

function newBlock(p, c, index, type) {
  let d = new Date();
  if (type == "text" || type == "heading" || type == "code") {
    files.folders[p].files[c].blocks.splice(index, 0, {
      creationdate: d.getTime(),
      type: type,
      text: newTextBlockText,
    });
  } else if (type == "divider") {
    files.folders[p].files[c].blocks.splice(index, 0, {
      creationdate: d.getTime(),
      type: type,
    });
  }

  // update last edited
  files.folders[p].files[c].lastedited = d.getTime();

  writeFiles(files);
  generateFile(p, c);
}

function deleteBlock(p, c, b) {
  files.folders[p].files[c].blocks.splice(b, 1);
  writeFiles(files);
  generateFile(p, c);
}

function newFile(p) {
  let d = new Date();
  files.folders[p].files.push({
    name: newFileName,
    creationdate: d.getTime(),
    lastedited: d.getTime(),
    starred: false,
    locked: false,
    blocks: [],
  });

  writeFiles(files);
  generateSidenav();
}

function newFolder() {
  files.folders.push({
    name: newFolderName,
    files: [],
  });

  writeFiles(files);
  generateSidenav();
}

// writing files.json
function writeFiles(data) {
  window.api.send("writeFiles", JSON.stringify(data));
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
