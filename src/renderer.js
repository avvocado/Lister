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

// init
function init() {
  // request files from main & create tray
  window.api.send("requestSettings", "");
  window.api.send("requestFiles", "");
  window.api.send("requestSystem", "");
  window.api.send("createTray", "");
}

function start() {
  // called after receiving files.json
  generateSidenav();
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

  // file name
  let fileName = createElement("p", {
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
  console.log(blockTypes);
  for (let t = 0; t < blockTypes.length; t++) {
    let btn = createElement("button", { class: "newblockbtn", innerhtml: blockTypes[t].name });
    if (currtheme == "dark") {
      btn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[t].icon}_d.svg)`;
    } else if (currtheme == "light") {
      btn.style.backgroundImage = `url(../assets/icons/blocks/${blockTypes[t].icon}_l.svg)`;
    }
    btn.onclick = function () {
      newBlock(index, index.blocks.length, blockTypes[t].type);
    };
    newBlockBtns.append(btn);
  }

  // append
  fileContent.append(fileName);
  fileContent.append(fileBlocks);
  fileContent.append(newBlockBtns);
  document.querySelector("#filecontainer").append(fileContent);
}

// goes to a certain file
function gotoFile(index) {
  document.querySelector("#settings").style.display = "none";

  generateFile(index);
  generateMenubar(index);
  hideBlockMenu()
  // handleSidenavBtn(index);
}

function handleSidenavBtn(index) {
  let sbtn = getSidenavBtn(index.path);

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
  let fileBtnDiv = createElement("div", { class: "filebtndiv" });
  let fileBtn = createElement("button", {
    class: "filebtn",
    innerhtml: index.name.replace(/ /g, "") == "" ? "Untitled File" : index.name,
  });
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
  fileBtnDiv.style.padding = `2px 1px 2px ${1 + filetreeindent * (index.path.length - 1)}px`;

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
  document.querySelector("#settings").style.display = "flex";

  // menubar
  document.querySelector("#path").innerHTML = "";

  let button = createElement("button", { class: "pathbtn", innerhtml: "Settings" });
  button.onclick = function () {
    showSettings();
  };

  document.querySelector("#path").append(button);
  document.querySelector("#lastedited").innerHTML = "";
  document.querySelector("#fileactions").innerHTML = "";
}
