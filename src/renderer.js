// event listeners
document.getElementById("closebtn").addEventListener("click", function () {
  window.api.send("close", "");
});

document.getElementById("minimizebtn").addEventListener("click", function () {
  window.api.send("minimize", "");
});

function init() {
  // request files from main & create tray
  window.api.send("requestFiles", "");
  window.api.send("createTray", "");
}

function start() {
  // called after receiving files.json
  generateSidenav();
}

// generates menubar for the file
function generateMenubar(p, c) {
  // clear path & actions
  document.querySelector("#path").innerHTML = "";
  document.querySelector("#lastedited").innerHTML = "";
  document.querySelector("#actions").innerHTML = "";

  // actions
  // delete file button
  let deleteFileBtn = createElement("button", { class: "deletefilebtn", innerhtml: "delete" });
  deleteFileBtn.onclick = function () {
    deleteFile(p, c);
    // todo: go to the next file or none
  };

  // star file button
  let starBtn = createElement("button", { class: "starbtn", innerhtml: "star" });
  starBtn.onclick = function () {
    // star
  };

  // lock file button
  let lockBtn = createElement("button", { class: "starbtn", innerhtml: "lock" });
  lockBtn.onclick = function () {
    // lock
  };

  // last edited
  let lastEdited = createElement("p", { innerhtml: timeAgo(files.children[p].children[c].lastedited) });

  // path
  let pathFolder = createElement("p", { class: "path folder", innerhtml: files.children[p].name, contenteditable: true });
  pathFolder.oninput = function () {
    files.children[p].name = this.innerText;
    writeFiles(files);
    generateSidenav();
  };
  let pathSlash = createElement("p", { class: "path slash", innerhtml: "/" });
  let pathFile = createElement("p", { class: "path file", innerhtml: files.children[p].children[c].name == "" ? "..." : files.children[p].children[c].name, contenteditable: true });
  pathFile.oninput = function () {
    // get date
    let d = new Date();
    // edit file name
    files.children[p].children[c].name = this.innerText;
    // update last edited
    files.children[p].children[c].lastedited = d.getTime();
    lastEdited.innerHTML = timeAgo(files.children[p].children[c].lastedited);
    // write files.json
    writeFiles(files);
    // update sidenav button with new name
    generateSidenav();
    // update big file name with new name
    generateFile(p, c);
  };

  // path
  document.querySelector("#path").append(pathFolder);
  document.querySelector("#path").append(pathSlash);
  document.querySelector("#path").append(pathFile);

  // last edited
  document.querySelector("#lastedited").append(lastEdited);

  // actions
  document.querySelector("#actions").append(lockBtn);
  document.querySelector("#actions").append(starBtn);
  document.querySelector("#actions").append(deleteFileBtn);
}

// generates file content
function generateFile(p, c) {
  // clear curent file, path, and actions
  document.querySelector("#activefile").innerHTML = "";

  // generate the current active file
  // container
  let fileContainer = createElement("div", { class: "filecontainer" });
  let fileName = createElement("p", { class: "filename", innerhtml: files.children[p].children[c].name, contenteditable: true });
  fileName.oninput = function () {
    // get date
    let d = new Date();
    // update last edited
    files.children[p].children[c].name = this.innerText;
    files.children[p].children[c].lastedited = d.getTime();
    // write files.json
    writeFiles(files);
    // update sidenav button with new name
    generateSidenav();
    // update menubar path with new name
    generateMenubar(p, c);
  };

  fileContainer.append(fileName);
  document.querySelector("#activefile").append(fileContainer);
}

// goes to a certain file
function gotoFile(p, c) {
  // change the current active file
  activefile = [p, c];

  // handle sidenav button
  handleSidenavButton(p, c);

  // append the new file
  generateFile(p, c);
  generateMenubar(p, c);
}

// changes the active sidenav button
function handleSidenavButton(p, c) {
  // get the sidenav button
  let btn = document.querySelectorAll(".folderdiv")[p].children[c];

  if (document.querySelector(".sidenavbtn.active") !== null) document.querySelector(".sidenavbtn.active").classList.remove("active");
  btn.classList.add("active");
}

// generates all sidenav buttons
function generateSidenav() {
  // generate all the sidenav buttons
  document.querySelector("#filebtns").innerHTML = "";
  console.log("generating sidenav buttons");

  for (let p = 0; p < files.children.length; p++) {
    // for each folder
    let folderDiv = createElement("div", { class: "folderdiv" });
    // folder button container
    let folderBtnDiv = createElement("div", {class: 'folderbtn sidenavbtn'});
    // folder button
    let folderBtn = createElement("button", { class: "folder right", innerhtml: files.children[p].name });
    // new file button
    let newFileBtn = createElement("button", { class: "newfile", innerhtml: "" });
    newFileBtn.onclick = function () {
      newFile(p);
    };

    // collapse and show file buttons
    folderBtn.onclick = function () {
      folderDiv.style.display = folderDiv.style.display == "none" ? "flex" : "none";
      this.className = "folder " + (folderDiv.style.display == "none" ? "down" : "right");
    };
    for (let c = 0; c < files.children[p].children.length; c++) {
      // for each file
      // sidenav button
      let fileBtn = createElement("button", { class: "sidenavbtn file", innerhtml: files.children[p].children[c].name == "" ? "..." : files.children[p].children[c].name });

      // show that file
      fileBtn.onclick = function () {
        gotoFile(p, c, this);
      };
      folderDiv.append(fileBtn);
    }
    
    folderBtnDiv.append(folderBtn)
    folderBtnDiv.append(newFileBtn)
    document.querySelector("#filebtns").append(folderBtnDiv);
    document.querySelector("#filebtns").append(folderDiv);
  }
  let newFolderBtn = createElement("button", { class: "sidenavbtn newfolder", innerhtml: "New Folder" });
  newFolderBtn.onclick = function () {
    newFolder();
  };
  document.querySelector("#filebtns").append(newFolderBtn);
  handleSidenavButton(activefile[0], activefile[1]);
}
init();
