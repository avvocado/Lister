// event listeners
document.getElementById("closebtn").addEventListener("click", function () {
  window.api.send("close", "");
});

document.getElementById("minimizebtn").addEventListener("click", function () {
  window.api.send("minimize", "");
});

// password submit button
document.getElementById("pswdsubmit").addEventListener("click", function () {
  if (document.querySelector("#pswdinput").value == settings.password) {
    // correct password
    appstate.unlockedfile = appstate.activefile;

    // clear password input
    document.querySelector("#pswdinput").value = "";

    // generate everything, now unlocked
    gotoFile(appstate.unlockedfile[0], appstate.unlockedfile[1]);
  } else {
    // incorrect
    document.querySelector("#pswdinput").select();
  }
});

// clicking enter inside of password input
document.getElementById("pswdinput").addEventListener("keydown", function (e) {
  if (e.code == "Enter") {
    document.querySelector("#pswdsubmit").click();
  }
});

// init
function init() {
  // request files from main & create tray
  window.api.send("requestFiles", "");
  window.api.send("requestSystem", "");
  window.api.send("createTray", "");
}

function start() {
  // called after receiving files.json
  generateSidenav();

  console.log(system)
}

// generates menubar for the file
function generateMenubar(p, c) {
  // clear path & actions
  document.querySelector("#path").innerHTML = "";
  document.querySelector("#lastedited").innerHTML = "";
  document.querySelector("#fileactions").innerHTML = "";

  // actions
  // delete file button
  let deleteFileBtn = createElement("button", {});

  deleteFileBtn.style.backgroundImage = "url(../assets/icons/navbars/trash1.svg)";
  deleteFileBtn.onclick = function () {
    deleteFile(p, c);
    // update sidenav
    generateSidenav();
  };
  // lock file button
  let lockBtn = createElement("button", {});
  

  lockBtn.style.backgroundImage = files[p].files[c].locked
    ? "url(../assets/icons/navbars/unlock.svg)"
    : "url(../assets/icons/navbars/lock.svg)";
  lockBtn.onclick = function () {
    // lock
    files[p].files[c].locked = !files[p].files[c].locked;
    this.style.backgroundImage = files[p].files[c].locked
      ? "url(../assets/icons/navbars/unlock.svg)"
      : "url(../assets/icons/navbars/lock.svg)";

    writeFiles(files);
    // update sidenav
    generateSidenav();
  };
  // edit file btn

  let editBtn = createElement("button", { class: "editbtn" });
  
  editBtn.style.backgroundImage =
    JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c])
      ? "url(../assets/icons/navbars/pen_edit.svg)"
      : "url(../assets/icons/navbars/pen.svg)";
  editBtn.onclick = function () {
    if (JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c])) {
      // editing off
      editingFile(false, -1, -1);
    } else {
      // editing on
      editingFile(true, p, c);
    }
    generateMenubar(p, c);
    generateFile(p, c);
  };

  // last edited
  let lastEdited = createElement("p", { innerhtml: timeAgo(files[p].files[c].lastedited) });

  // path
  let pathFolder = createElement("p", {
    class: "path folder",
    innerhtml: files[p].name,
    contenteditable: JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]),
  });
  pathFolder.oninput = function () {
    files[p].name = this.innerHTML;
    writeFiles(files);
    generateSidenav();
  };
  let pathSlash = createElement("p", { class: "path slash", innerhtml: "/" });
  let pathFile = createElement("p", {
    class: "path file editableonedit",
    innerhtml:
      /*
      if locked
        if unlocked
          if name is empty
            untitled file
          else
            file name
        else
          locked file
      else
        if name is empty
          untitled file
        else
          name
      */
      files[p].files[c].locked == true
        ? JSON.stringify(appstate.unlockedfile) == JSON.stringify(appstate.activefile)
          ? files[p].files[c].name == ""
            ? "Untitled File"
            : files[p].files[c].name
          : "Locked File"
        : files[p].files[c].name == ""
        ? "Untitled File"
        : files[p].files[c].name,
    contenteditable: JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]),
  });
  pathFile.oninput = function () {
    // get date
    let d = new Date();
    // edit file name
    files[p].files[c].name = this.innerText;
    // update last edited
    files[p].files[c].lastedited = d.getTime();
    lastEdited.innerHTML = timeAgo(files[p].files[c].lastedited);
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

  // file action buttons
  document.querySelector("#fileactions").append(editBtn);
  document.querySelector("#fileactions").append(lockBtn);
  document.querySelector("#fileactions").append(deleteFileBtn);

  // open file with edit mode on, will be an option in settings in the future
  //if (!(JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]))) {
    //editBtn.click();
  //}
}

// generates file content
function generateFile(p, c) {
  // clear curent file
  document.querySelector("#filecontainer").innerHTML = "";

  let fileContent = createElement("div", { class: "filecontent" });
  // generate the current active file
  // container
  let fileName = createElement("p", {
    class: "filename editableonedit",
    innerhtml: files[p].files[c].name,
    contenteditable: JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]),
  });
  fileName.oninput = function () {
    // get date
    let d = new Date();
    // update last edited
    files[p].files[c].name = this.innerText;
    files[p].files[c].lastedited = d.getTime();
    // write files.json
    writeFiles(files);
    // update sidenav button with new name
    generateSidenav();
    // update menubar path with new name
    generateMenubar(p, c);
  };

  let fileBlocks = createElement("div", { class: "fileblocks" });
  for (let b = 0; b < files[p].files[c].blocks.length; b++) {
    // for each block

    // block container
    let blockContainer = createElement("div", { class: `blockcontainer ${files[p].files[c].blocks[b].type}` });

    // block menu
    let blockMenuBtn = createElement("button", {
      class: "blockmenubtn showonedit",
      disabled: !(JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c])),
    });
    if (!(JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]))) {
      blockMenuBtn.style.opacity = "0";
    }
    blockMenuBtn.style.backgroundImage = "url(../assets/icons/dots.svg)";
    blockMenuBtn.onclick = function () {
      blockMenu(p, c, b, this);
    };
    blockContainer.append(blockMenuBtn);

    // block content div
    let block = createElement("pre", {
      class: `block ${files[p].files[c].blocks[b].type}`,
    });

    if (files[p].files[c].blocks[b].type == "divider") {
      // divider block
    } else if (
      files[p].files[c].blocks[b].type == "code" ||
      files[p].files[c].blocks[b].type == "heading" ||
      files[p].files[c].blocks[b].type == "text"
    ) {
      // text, heading, or code
      block.classList.add("editableonedit");
      block.innerHTML = files[p].files[c].blocks[b].text;
      block.contentEditable = JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]);
      block.spellcheck = false;
      block.oninput = function () {
        // edit file object
        files[p].files[c].blocks[b].text = this.innerHTML.replace(/<br>/g, '');
        // get date
        let d = new Date();
        // update last edited
        files[p].files[c].lastedited = d.getTime();
        // generate menu bar (with new edited time)
        generateMenubar(p, c);
        // write files.json
        writeFiles(files);
      };
      block.onkeydown = function (e) {
        // exit on enter key with no shift
        // user can use lshift+enter to make a new line and not exit
        if (e.code == "Enter" && keyMap.ShiftLeft != true) {
          this.blur();
        }
      };
    } else if (files[p].files[c].blocks[b].type == "inline_code") {
      // inline code block
      block.classList.add("editableonedit");
      block.classList.add("inline");
      block.innerHTML = files[p].files[c].blocks[b].text;
      block.contentEditable = JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]);
      block.spellcheck = false;
    }

    blockContainer.append(block);
    fileBlocks.append(blockContainer);
  }

  // new block area
  let newBlockDiv = createElement("div", { class: "newblockbtns showonedit" });
  newBlockDiv.style.display = JSON.stringify(appstate.currentlyediting) == JSON.stringify([p, c]) ? "block" : "none";

  for (let bt = 0; bt < blockTypes.length; bt++) {
    let newBlockBtn = createElement("button", {
      innerhtml: blockTypes[bt].name,
      class: "newblockbtn " + blockTypes[bt].type,
    });
    newBlockBtn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[bt].icon}.svg)`;
    newBlockBtn.onclick = function () {
      newBlock(p, c, files[p].files[c].blocks.length, blockTypes[bt].type, blockTypes[bt].layout);
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
  appstate.activefile = [p, c];

  // update sidenav buttons
  generateSidenav();

  if (
    files[p].files[c].locked == false ||
    JSON.stringify(appstate.unlockedfile) == JSON.stringify(appstate.activefile)
  ) {
    // generate the new file
    document.querySelector("#lockedfile").style.display = "none";
    appstate.unlockedfile = appstate.activefile;
    generateFile(p, c);
    generateMenubar(p, c);
  } else {
    appstate.unlockedfile = [-1, -1];
    // generate locked file
    // clear current file
    document.querySelector("#filecontainer").innerHTML = "";

    // show locked screen
    document.querySelector("#lockedfile").style.display = "flex";
    document.querySelector("#pswdinput").focus();

    // path
    document.querySelector("#path").innerHTML = "";
    document.querySelector("#lastedited").innerHTML = "";
    document.querySelector("#fileactions").innerHTML = "";
    let pathFolder = createElement("p", {
      class: "path folder",
      innerhtml: files[p].name,
    });
    pathFolder.oninput = function () {
      files[p].name = this.innerText;
      writeFiles(files);
      generateSidenav();
    };
    let pathSlash = createElement("p", { class: "path slash", innerhtml: "/" });
    let pathFile = createElement("p", {
      class: "path file editableonedit",
      innerhtml: "Locked File",
    });

    // path
    document.querySelector("#path").append(pathFolder);
    document.querySelector("#path").append(pathSlash);
    document.querySelector("#path").append(pathFile);
  }
}

// generates all sidenav buttons
function generateSidenav() {
  // generate all the sidenav buttons
  document.querySelector("#filebtns").innerHTML = "";

  for (let p = 0; p < files.length; p++) {
    // for each folder
    let folderDiv = createElement("div", { class: "folderdiv" });
    // folder button container
    let folderBtnDiv = createElement("div", { class: "folderbtn sidenavbtn" });
    // folder button
    let folderBtn = createElement("button", {
      class: "folder down",
      innerhtml: files[p].name == "" ? "Untitled Folder" : files[p].name,
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

    for (let c = 0; c < files[p].files.length; c++) {
      // for each file
      // sidenav button
      let fileBtn = createElement("button", {
        class: files[p].files[c].locked == true ? "sidenavbtn file locked" : "sidenavbtn file",
        innerhtml:
          /*
      if locked
        if unlocked
          if name is empty
            untitled file
          else
            file name
        else
          locked file
      else
        if name is empty
          untitled file
        else
          name
      */
          files[p].files[c].locked == true
            ? // if unlockedfile == active file && activefile == current sidenav button it's generating
              JSON.stringify(appstate.unlockedfile) == JSON.stringify(appstate.activefile) &&
              JSON.stringify(appstate.activefile) == JSON.stringify([p, c])
              ? files[p].files[c].name == ""
                ? "Untitled File"
                : files[p].files[c].name
              : "Locked File"
            : files[p].files[c].name == ""
            ? "Untitled File"
            : files[p].files[c].name,
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

  // if active file isn't -1
  if (JSON.stringify(appstate.activefile) != JSON.stringify([-1, -1])) {
    // get the sidenav button
    // error here because "p" is still -1
    let btn = document.querySelectorAll(".folderdiv")[appstate.activefile[0]].children[appstate.activefile[1]];

    if (document.querySelector(".sidenavbtn.active") !== null) {
      document.querySelector(".sidenavbtn.active").classList.remove("active");
    }

    try{
      btn.classList.add("active");

    }catch(err){
      console.log('created or deleted file, error handled')
    }
  }
}
init();
