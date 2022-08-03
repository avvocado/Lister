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
  let deleteFileBtn = createElement("button", {});
  deleteFileBtn.style.backgroundImage = "url(../assets/icons/trash1.svg)";
  deleteFileBtn.onclick = function () {
    deleteFile(p, c);
    // update sidenav
    generateSidenav();
  };
  // lock file button
  let lockBtn = createElement("button", {});
  lockBtn.style.backgroundImage = files.folders[p].files[c].locked
    ? "url(../assets/icons/unlock.svg)"
    : "url(../assets/icons/lock.svg)";
  lockBtn.onclick = function () {
    // lock
    files.folders[p].files[c].locked = !files.folders[p].files[c].locked;
    this.style.backgroundImage = files.folders[p].files[c].locked
      ? "url(../assets/icons/unlock.svg)"
      : "url(../assets/icons/lock.svg)";
    writeFiles(files);
    // update sidenav
    generateSidenav();
  };

  // star file button
  let starBtn = createElement("button", { class: "starbtn", innerhtml: "star" });
  starBtn.onclick = function () {
    // star
    files.folders[p].files[c].starred = !files.folders[p].files[c].starred;
    writeFiles(files);
    // update sidenav
    generateSidenav();
  };

  // last edited
  let lastEdited = createElement("p", { innerhtml: timeAgo(files.folders[p].files[c].lastedited) });

  // path
  let pathFolder = createElement("p", {
    class: "path folder",
    innerhtml: files.folders[p].name,
    contenteditable: true,
  });
  pathFolder.oninput = function () {
    files.folders[p].name = this.innerText;
    writeFiles(files);
    generateSidenav();
  };
  let pathSlash = createElement("p", { class: "path slash", innerhtml: "/" });
  let pathFile = createElement("p", {
    class: "path file",
    innerhtml: files.folders[p].files[c].name == "" ? "Untitled File" : files.folders[p].files[c].name,
    contenteditable: true,
  });
  pathFile.oninput = function () {
    // get date
    let d = new Date();
    // edit file name
    files.folders[p].files[c].name = this.innerText;
    // update last edited
    files.folders[p].files[c].lastedited = d.getTime();
    lastEdited.innerHTML = timeAgo(files.folders[p].files[c].lastedited);
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
  document.querySelector("#actions").append(starBtn);
  document.querySelector("#actions").append(lockBtn);
  document.querySelector("#actions").append(deleteFileBtn);
}

// generates file content
function generateFile(p, c) {
  // clear curent file, path, and actions
  document.querySelector("#filecontainer").innerHTML = "";

  let fileContent = createElement("div", { class: "filecontent" });
  // generate the current active file
  // container
  let fileContainer = createElement("div", { class: "filecontainer" });
  let fileName = createElement("p", {
    class: "filename",
    innerhtml: files.folders[p].files[c].name,
    contenteditable: true,
  });
  fileName.oninput = function () {
    // get date
    let d = new Date();
    // update last edited
    files.folders[p].files[c].name = this.innerText;
    files.folders[p].files[c].lastedited = d.getTime();
    // write files.json
    writeFiles(files);
    // update sidenav button with new name
    generateSidenav();
    // update menubar path with new name
    generateMenubar(p, c);
  };

  let fileBlocks = createElement("div", { class: "fileblocks" });
  for (let b = 0; b < files.folders[p].files[c].blocks.length; b++) {
    // for each block
    let blockDiv = createElement("div", { class: `blockdiv ${files.folders[p].files[c].blocks[b].type}` });
    let deleteBlockBtn = createElement("button", { class: "deleteblockbtn" });
    deleteBlockBtn.style.backgroundImage = "url(../assets/icons/trash.svg)";
    deleteBlockBtn.onclick = function () {
      deleteBlock(p, c, b);
    };
    blockDiv.append(deleteBlockBtn);
    let blockContent = createElement("pre", {
      class: `blockcontent ${files.folders[p].files[c].blocks[b].type}`,
    });
    if (files.folders[p].files[c].blocks[b].type == "text") {
      // text block
      blockContent.innerHTML = files.folders[p].files[c].blocks[b].text;
      blockContent.contentEditable = true;
      blockContent.spellcheck = false;
      blockContent.oninput = function () {
        files.folders[p].files[c].blocks[b].text = this.innerText;
        // get date
        let d = new Date();
        // update last edited
        files.folders[p].files[c].lastedited = d.getTime();
        generateMenubar(p, c);
        writeFiles(files);
      };
    } else if (files.folders[p].files[c].blocks[b].type == "divider") {
      // divider block
    } else if (files.folders[p].files[c].blocks[b].type == "heading") {
      // heading block
      blockContent.innerHTML = files.folders[p].files[c].blocks[b].text;
      blockContent.contentEditable = true;
      blockContent.spellcheck = false;
      blockContent.oninput = function () {
        files.folders[p].files[c].blocks[b].text = this.innerText;
        // get date
        let d = new Date();
        // update last edited
        files.folders[p].files[c].lastedited = d.getTime();
        generateMenubar(p, c);
        writeFiles(files);
      };
    }
    blockDiv.append(blockContent);
    fileBlocks.append(blockDiv);
  }

  // new block area
  let newBlockDiv = createElement("div", { class: "newblockbtns" });

  for (let bt = 0; bt < blockTypes.length; bt++) {
    let newBlockBtn = createElement("button", {
      innerhtml: blockTypes[bt].name,
      class: "newblockbtn " + blockTypes[bt].type,
    });
    newBlockBtn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[bt].icon}.svg)`;
    newBlockBtn.onclick = function () {
      newBlock(p, c, blockTypes[bt].type);
      // get date
      let d = new Date();
      // update last edited
      files.folders[p].files[c].lastedited = d.getTime();
      generateMenubar(p, c);
    };
    newBlockDiv.append(newBlockBtn);
  }

  fileContent.append(fileName);
  fileContent.append(fileBlocks);
  fileContent.append(newBlockDiv);
  document.querySelector("#filecontainer").append(fileContent);
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
  // error here because "p" is still -1
  let btn = document.querySelectorAll(".folderdiv")[p].children[c];

  if (document.querySelector(".sidenavbtn.active") !== null) {
    document.querySelector(".sidenavbtn.active").classList.remove("active");
  }

  btn.classList.add("active");
}

// generates all sidenav buttons
function generateSidenav() {
  // generate all the sidenav buttons
  document.querySelector("#filebtns").innerHTML = "";

  for (let p = 0; p < files.folders.length; p++) {
    // for each folder
    let folderDiv = createElement("div", { class: "folderdiv" });
    // folder button container
    let folderBtnDiv = createElement("div", { class: "folderbtn sidenavbtn" });
    // folder button
    let folderBtn = createElement("button", {
      class: "folder down",
      innerhtml: files.folders[p].name == "" ? "Untitled Folder" : files.folders[p].name,
    });
    // new file button
    let newFileBtn = createElement("button", { class: "newfile", innerhtml: "" });
    newFileBtn.onclick = function () {
      newFile(p);
    };

    // collapse and show file buttons
    folderBtn.onclick = function () {
      // hide or show the folderdiv
      folderDiv.style.display = folderDiv.style.display == "none" ? "block" : "none";
      // change icon
      this.className = "folder " + (folderDiv.style.display == "none" ? "right" : "down");
      // change collapse state variable
      collapseState[p] = folderDiv.style.display == "none";
    };

    if (collapseState[p] == true) folderBtn.click();

    for (let c = 0; c < files.folders[p].files.length; c++) {
      // for each file
      // sidenav button
      let fileBtn = createElement("button", {
        class: "sidenavbtn file",
        innerhtml: files.folders[p].files[c].name == "" ? "Untitled File" : files.folders[p].files[c].name,
      });

      // show that file
      fileBtn.onclick = function () {
        gotoFile(p, c, this);
      };
      folderDiv.append(fileBtn);
    }

    folderBtnDiv.append(folderBtn);
    folderBtnDiv.append(newFileBtn);
    document.querySelector("#filebtns").append(folderBtnDiv);
    document.querySelector("#filebtns").append(folderDiv);
  }

  let newFolderBtn = createElement("button", { class: "sidenavbtn newfolder", innerhtml: "New Folder" });
  newFolderBtn.onclick = function () {
    newFolder();
  };

  document.querySelector("#filebtns").append(newFolderBtn);

  // if active file isn't -1 (not first load)
  if (activefile[0] != -1 && activefile[1] != -1) {
    handleSidenavButton(activefile[0], activefile[1]);
  }
}
init();
