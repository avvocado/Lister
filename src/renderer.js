// event listeners
document.getElementById("closebtn").addEventListener("click", function () {
  window.api.send("close", "");
});

document.getElementById("minimizebtn").addEventListener("click", function () {
  window.api.send("minimize", "");
});

document.getElementById("settingsbtn").addEventListener("click", function () {
  showSettings();
});

document.getElementById("draftsbtn").addEventListener("click", function () {
  showDrafts();
});

document.getElementById("togglesidenavbtn").addEventListener("click", function () {
  if (document.querySelector("#sidenav").style.display == "none") {
    // show
    document.querySelector("#sidenav").style.display = "flex";
    document.querySelector("#content").style.marginLeft = "var(--sidenavwidth)";
    document.querySelector("#leftbtns").style.marginLeft = "var(--sidenavwidth)";
  } else {
    // hide
    document.querySelector("#sidenav").style.display = "none";
    document.querySelector("#content").style.marginLeft = "0";
    if (system.os == "darwin") {
      document.querySelector("#leftbtns").style.marginLeft = "62px";
    } else {
      document.querySelector("#leftbtns").style.marginLeft = "2px";
    }
  }
});

document.getElementById("openresources").addEventListener("click", function () {
  window.api.send("openResources", "");
});

document.getElementById("filetreeindentslider").addEventListener("input", function () {
  settings.filetreeindentation = document.querySelector("#filetreeindentslider").value;
  document.querySelector("#filetreeindentdisplay").innerHTML = "(" + settings.filetreeindentation + "px)";
  writeSettings();
  generateSidenav();
});

// init
function init() {
  // request files from main & create tray
  try {
    window.api.send("requestSettings", "");
    window.api.send("requestDrafts", "");
    window.api.send("requestFiles", "");
    window.api.send("requestSystem", "");
    window.api.send("createTray", "");
  } catch (err) {
    console.warn(err);
  }
}

// generates menubar for the file
function generateMenubar(index) {
  // clear path & actions
  document.querySelector("#path").innerHTML = "";
  document.querySelector("#lastedited").innerHTML = "";
  document.querySelector("#fileactions").innerHTML = "";

  // last edited
  let lastEdited = createElement("p", { class: "lastedited", innerhtml: timeAgo(index.lastedited) });

  // file action buttons
  // edit button
  // lock button
  // delete file button
  let deleteFileBtn = createElement("button", {
    class: "deleteFileBtn",
    backgroundimage: "url(../assets/icons/menubar/trash_d.svg)",
  });
  deleteFileBtn.onclick = function () {
    deleteFile(index.path);
  };

  // path
  generatePath(index);

  // last edited
  document.querySelector("#lastedited").append(lastEdited);

  // file action buttons
  //document.querySelector("#fileactions").append(editBtn);
  //document.querySelector("#fileactions").append(lockBtn);
  document.querySelector("#fileactions").append(deleteFileBtn);
}

// generates file content
function generateFile(index) {
  // generate the current active file

  // clear curent file
  document.querySelector("#filecontainer").innerHTML = "";

  // file content container
  let fileContent = createElement("div", { class: "filecontent" });

  let fileNameDiv = createElement("div", {});

  // file icon
  let fileIcon;
  if (index.icon == null) {
    // broken files
    index.icon = "";
  }
  if (index.icon == "") {
    // no icon
    fileIcon = createElement("button", {
      class: "fileicon none",
    });
  } else {
    // icon
    fileIcon = createElement("button", {
      class: "fileicon",
      backgroundimage: `url(../assets/icons/fileicons/${index.icon}_${appstate.currthemeshort}.svg)`,
    });
  }

  fileIcon.onclick = function () {
    fileIconMenu(index, this);
    writeFiles();
  };

  fileNameDiv.append(fileIcon);

  // file name
  let fileName = createElement("h1", {
    class: "filename",
    innerhtml: index.name,
    contenteditable: true,
  });
  fileName.onkeydown = function (e) {
    if (e.code == "Enter") {
      this.blur();
    }
  };
  fileName.oninput = function () {
    index.name = this.innerHTML.replace(/<br>/g, "");
    // get date
    let d = new Date();
    // update last edited
    index.lastedited = d.getTime();
    // generate menu bar (with new edited time)
    generateMenubar(index);
    // generate sidenav with new name
    generateSidenav();
    // save
    writeFiles();
  };

  // blocks
  let fileBlocks = createElement("div", { class: "fileblocks" });
  for (let b = 0; b < index.blocks.length; b++) {
    // for each block

    // block container
    let blockContainer = createElement("div", { class: `blockcontainer ${index.blocks[b].type}` });

    // block menu
    let blockMenuBtn = createElement("button", {
      class: "blockmenubtn showonedit",
    });
    blockMenuBtn.onclick = function () {
      blockMenu(index, b, this);
    };
    blockContainer.append(blockMenuBtn);

    // block content div
    let block = createElement("pre", {
      class: `block ${index.blocks[b].type}`,
    });

    if (index.blocks[b].type == "divider") {
      // divider block
    } else if (index.blocks[b].type == "code" || index.blocks[b].type == "heading" || index.blocks[b].type == "text") {
      // text, heading, or code
      block.classList.add("editableonedit");
      block.innerHTML = index.blocks[b].text;
      block.contentEditable = true;
      block.spellcheck = false;
      block.oninput = function () {
        // edit file object
        index.blocks[b].text = this.innerHTML.replace(/<br>/g, "");
        // get date
        let d = new Date();
        // update last edited
        index.lastedited = d.getTime();
        // generate menu bar (with new edited time)
        generateMenubar(index);
        // write files.json
        writeFiles();
      };
      block.onkeydown = function (e) {
        if (e.code == "Enter") {
          if (index.blocks[b].type == "heading") {
            // heading & enter key, blur
            this.blur();
          } else {
            // is not a heading, do nothing
          }
        }
      };
    } else if (index.blocks[b].type == "inline_code") {
      // inline code block
      block.classList.add("editableonedit");
      block.classList.add("inline");
      block.innerHTML = index.blocks[b].text;
      block.contentEditable = true;
      block.spellcheck = false;
    }

    blockContainer.append(block);
    fileBlocks.append(blockContainer);
  }

  // new block buttons
  let newBlockBtns = createElement("div", { id: "newblockbtns" });
  for (let t = 0; t < blockTypes.length; t++) {
    let btn = createElement("button", { class: "newblockbtn", innerhtml: blockTypes[t].name });
    btn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[t].icon}_${appstate.currthemeshort}.svg)`;

    btn.onclick = function () {
      newBlock(index, index.blocks.length, blockTypes[t].type);
    };
    newBlockBtns.append(btn);
  }

  // append
  fileNameDiv.append(fileName);
  fileContent.append(fileNameDiv);
  fileContent.append(fileBlocks);
  fileContent.append(newBlockBtns);
  document.querySelector("#filecontainer").append(fileContent);
}

// goes to a certain file
function gotoFile(index, btn = null) {
  // hide settings
  document.querySelector("#settings").style.display = "none";
  document.querySelector("#drafts").style.display = "none";

  hideBlockMenu();
  hideFileIconMenu();
  handleSidenavBtn(btn);

  if (index.locked == false) {
    // not locked
    generateFile(index);
    generateMenubar(index);
  } else {
    // locked
  }
}

function handleSidenavBtn(sbtn) {
  try {
    document.querySelector(".filebtndiv.active").classList.remove("active");
  } catch (err) {
    // no active button
  }
  sbtn.classList.add("active");
}

// generates all sidenav buttons
function generateSidenav() {
  // generate all the sidenav buttons
  document.querySelector("#filebtns").innerHTML = "";

  for (let p = 0; p < files.length; p++) {
    // for each root file
    // recursively generate all children files
    appendElements(document.querySelector("#filebtns"), generateSidenavBtn(files[p], [p]));
  }
}

// recursive function to generate all sidenav buttons
function generateSidenavBtn(index, path) {
  // fix & update path
  getIndex(path).path = path;

  // main button
  let fileBtnDiv = createElement("div", { class: path.length == 1 ? "filebtndiv root" : "filebtndiv" });
  let fileBtn = createElement("button", {
    class: "filebtn",
    innerhtml: index.name.replace(/ /g, "") == "" ? "Untitled File" : index.name,
  });
  if (index.icon != null && index.icon != "") {
    fileBtn.style.backgroundImage =
      "url(../assets/icons/fileicons/" + index.icon + "_" + (appstate.currthemeshort == "l" ? "d" : "l") + ".svg)";
    fileBtn.style.paddingLeft = "18px";
  }
  fileBtnDiv.onclick = function () {
    // go to file
    gotoFile(index, fileBtnDiv);
  };
  let childrenContainer = createElement("div", { class: "childfiles" });

  let fileCollapseBtn = createElement("button", {
    class: (index.children != null && index.children.length) > 0 ? "collapsebtn down" : "collapsebtn off",
  });
  fileCollapseBtn.onclick = function (e) {
    if (index.children != null && index.children.length) {
      // override clicking container
      e.stopPropagation();
      // change collapsed file

      // show/hide child files
      let cc = childrenContainer.style.display;
      childrenContainer.style.display = cc == "none" ? (cc = "flex") : (cc = "none");
      fileCollapseBtn.className = fileCollapseBtn.className = cc == "none" ? "collapsebtn right" : "collapsebtn down";
    } else {
      // no children
    }
  };

  let newFileBtn = createElement("button", { class: "newfilebtn" });
  newFileBtn.onclick = function () {
    // new file
    newFile(index);
  };

  fileBtnDiv.append(fileCollapseBtn);
  fileBtnDiv.append(fileBtn);
  fileBtnDiv.append(newFileBtn);

  // indenting child files
  fileBtnDiv.style.padding = `3px 1px 3px ${1 + settings.filetreeindentation * (index.path.length - 1)}px`;

  if (index.children != null && index.children.length > 0) {
    // has children
    // for each child, recurse
    for (let i = 0; i < index.children.length; i++) {
      appendElements(childrenContainer, generateSidenavBtn(index.children[i], path.concat(i)));
    }
    return [fileBtnDiv, childrenContainer];
  } else {
    // this file has no children
    return [fileBtnDiv];
  }
}

init();

function showSettings() {
  document.querySelector("#filecontainer").innerHTML = "";
  document.querySelector("#drafts").style.display = "none";
  document.querySelector("#settings").style.display = "flex";

  // menubar
  document.querySelector("#path").innerHTML = "";

  let button = createElement("button", { class: "pathbtn", innerhtml: "Settings" });
  button.onclick = function () {
    showSettings();
  };

  hideFileIconMenu();
  hideBlockMenu();

  document.querySelector("#path").append(button);
  document.querySelector("#lastedited").innerHTML = "";
  document.querySelector("#fileactions").innerHTML = "";
}

function showDrafts() {
  document.querySelector("#filecontainer").innerHTML = "";
  document.querySelector("#drafts").style.display = "flex";
  document.querySelector("#settings").style.display = "none";

  // menubar
  document.querySelector("#path").innerHTML = "";

  let button = createElement("button", { class: "pathbtn", innerhtml: "Drafts" });
  button.onclick = function () {
    showDrafts();
  };

  button.style.backgroundImage = "url(../assets/icons/sidenav/" + "drafts" + "_" + appstate.currthemeshort + ".svg)";
  button.style.paddingLeft = "15px";

  hideFileIconMenu();
  hideBlockMenu();

  document.querySelector("#path").append(button);
  document.querySelector("#lastedited").innerHTML = "";
  document.querySelector("#fileactions").innerHTML = "";

  generateDrafts();
}

function generateDrafts() {
  document.querySelector("#draftscontainer").innerHTML = "";
  for (let i = 0; i < drafts.length; i++) {
    // for each draft
    let container = createElement("div", { class: "draft-container" });
    let name = createElement("h3", { class: "draft-name", innerhtml: drafts[i].name, contenteditable: "true" });
    name.oninput = function () {
      drafts[i].name = this.innerHTML.replace(/<br>/g, "");
      // get date
      let d = new Date();
      // update last edited
      drafts[i].lastedited = d.getTime();
      writeDrafts();
    };
    name.onblur = function () {
      generateDrafts();
    };
    let text = createElement("p", { class: "draft-text", innerhtml: drafts[i].text, contenteditable: "true" });
    text.oninput = function () {
      drafts[i].text = this.innerHTML.replace(/<br>/g, "");
      // get date
      let d = new Date();
      // update last edited
      drafts[i].lastedited = d.getTime();
      writeDrafts();
    };
    text.onblur = function () {
      generateDrafts();
    };
    let dates = createElement("p", {
      class: "draft-footer-text",
      innerhtml: timeAgo(drafts[i].lastedited) + " - " + timeAgo(drafts[i].creationdate),
    });

    let deletebtn = createElement("button", {
      backgroundimage: "url(../assets/icons/menubar/trash_" + appstate.currthemeshort + ".svg)",
    });
    deletebtn.onclick = function () {
      deleteDraft(i);
    };
    let div = createElement("div", {});
    div.style.display = "flex";
    div.append(name);
    div.append(deletebtn);
    container.append(div);

    container.append(text);
    // edited and creation date is useless info ???
    // container.append(dates);
    document.querySelector("#draftscontainer").append(container);
  }
}
