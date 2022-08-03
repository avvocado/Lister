// globals
var files;
var activefile = [-1, -1];

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
  }
  if (params.type) {
    elem.type = params.type;
  }
  if (params.title) {
    elem.title = params.title;
  }
  if (params.hide == true) {
    elem.style.display = "none";
  }

  return elem;
}

function deleteFile(p, c) {
  files.children[p].children.splice(c, 1);
  writeFiles(files);
  generateSidenav();
}

function deleteFolder(p) {
  files.children.splice(p, 1);
  writeFiles(files);
  generateSidenav();
}

function fileEdited(f) {
  d = new Date();
  console.log(l);
  files["children"][f]["lastEdited"] = d.getTime();

  files["children"].sort((a, b) => Number(b.lastEdited) - Number(a.lastEdited));

  writeFiles(files);
  generateSidenav();
}

function newFile(p) {
  let d = new Date();
  files.children[p].children.push({
    name: "New File",
    creationdate: d.getTime(),
    lastedited: d.getTime(),
    starred: false,
    locked: false,
  });

  writeFiles(files);
  generateSidenav();
}

function newFolder() {
  files.children.push({
    name: "New Folder",
    children: [],
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

// params: current time (ms), past/future time (ms)
// returns: how long ago the date was OR in how long the date is
// eg: "9 hours ago", "in 3 weeks"
function timeAgo(date) {
  var time = "";
  let d = new Date()
  let now = d.getTime()
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
