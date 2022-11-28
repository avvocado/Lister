var files = [
  {
    name: "File Name 1",
    icon: "file",
    creationdate: 1,
    lastedited: 1,
    children: [
      {
        name: "Child File 1",
        icon: "file",
        creationdate: 1,
        lastedited: 1,
        children: [],
        blocks: [],
        starred: false,
        locked: false,
        archived: false,
      },
    ],
    blocks: [
      { type: "heading1", data: "Heading 1" },
      { type: "heading3", data: "Heading 3" },
      { type: "text", data: "Text block is here<br>new line goes here" },

      { type: "heading2", data: "Heading 2" },
      { type: "text", data: "Text block is here<br>new line goes here" },

      { type: "heading3", data: "Heading 3" },
      { type: "divider", data: "" },
      { type: "text", data: "Text block is here<br>new line goes here" },
      { type: "url", data: "https://www.youtube.com/" },
      { type: "code", data: "// code block" },
      { type: "cards", data: [] },
    ],
    starred: false,
    locked: false,
  },
];

function init() {
  // once, on load
  generateSidenav();
}

function generateTopnav(path) {
  let file = files;
  pathNames = [];
  for (let f = 0; f < path.length; f++) {
    // for each number in the path
    // go down the file strucutre using [path] and find the correct file
    if (file == files) {
      file = file[path[f]];
    } else {
      file = file.children[path[f]];
    }
    pathNames.push(file.name);
  }
  // file path
  document.querySelector("#file-path-container").innerHTML = "";

  for (let p = 0; p < pathNames.length; p++) {
    // for each file in the path
    let pathbtn = createElement("button", { innerhtml: pathNames[p], class: "topnav-btn" });
    if (pathNames[p] == "") {
      pathbtn.innerHTML = "Untitled File";
    }
    pathbtn.onclick = function () {
      showFile(path.slice(0, p + 1));
    };
    document.querySelector("#file-path-container").append(pathbtn);
  }
}

function showFile(path) {
  // render a file from the path
  console.log("showing file: [" + path + "]");
  let file = pathToFile(path);
  generateTopnav(path);

  // file name
  let filename = createElement("h1", { id: "file-name", innerhtml: file.name, contenteditable: true });
  filename.oninput = function () {
    file.name = this.innerHTML;
    generateSidenav();
    generateTopnav(path);
  };
  blockcontainer = createElement("div", { id: "file-block-container" });

  // blocks
  for (let b = 0; b < file.blocks.length; b++) {
    // for each block
    let blockdiv;

    if (
      file.blocks[b].type == "heading1" ||
      file.blocks[b].type == "heading2" ||
      file.blocks[b].type == "heading3" ||
      file.blocks[b].type == "text" ||
      file.blocks[b].type == "code"
    ) {
      // heading1, heading2, heading3, text, code block
      blockdiv = createElement("div", {
        class: `file-block ${file.blocks[b].type}`,
        contenteditable: true,
        innerhtml: file.blocks[b].data,
      });
      blockdiv.oninput = function () {
        file.blocks[b].data = this.innerHTML;
      };
      blockdiv.innerHTML = file.blocks[b].data;
    } else if (file.blocks[b].type == "url") {
      // url
      blockdiv = createElement("div", {
        class: `file-block url`,
      });

      // link element
      let link = createElement("a", {
        href: file.blocks[b].data,
      });

      // link text
      let linktext = createElement("p", {
        //contenteditable: true,
        innerhtml: file.blocks[b].data,
      });

      // link image
      let img = createElement("img", {
        // extract base url & try to find a favicon from it
        src: `http://${file.blocks[b].data.replace(/(http(s)?:\/\/)|(\/.*){1}/g, "")}/favicon.ico`,
      });
      img.onerror = function () {
        this.style.display = "none";
      };

      linktext.oninput = function () {
        // update block
        file.blocks[b].data = this.innerHTML;
        // update link
        link.href = this.innerHTML;
        // update image
        img.src = `http://${file.blocks[b].data.replace(/(http(s)?:\/\/)|(\/.*){1}/g, "")}/favicon.ico`;
      };

      link.append(img);
      link.append(linktext);
      blockdiv.append(link);
    } else if (file.blocks[b].type == "divider") {
      // divider
      divider = createElement("div", {});
      blockdiv = createElement("div", {
        class: `file-block divider`,
      });
      blockdiv.append(divider);
    } else if (file.blocks[b].type == "cards") {
      // divider
      blockdiv = createElement("div", {
        class: `file-block cards`,
      });

      for (let c = 0; c < file.blocks[b].data.length; c++) {
        // for each card
        let carddiv = createElement("div", { class: "card-item" });
        let cardtitle = createElement("div", {
          class: "title",
          innerhtml: file.blocks[b].data[c].title,
          contenteditable: true,
        });
        cardtitle.oninput = function(){
          file.blocks[b].data[c].title = this.innerHTML
        }
        let carddescription = createElement("div", {
          innerhtml: file.blocks[b].data[c].description,
          class: "description",
          contenteditable: true,
        });

        carddescription.oninput = function(){
          file.blocks[b].data[c].description = this.innerHTML
        }

        carddiv.append(cardtitle);
        carddiv.append(carddescription);
        blockdiv.append(carddiv);
      }

      newcardbtn = createElement("button", {
        class: `card-item newcard`,
        innerhtml: "New Card",
      });
      newcardbtn.onclick = function () {
        // add new card
        file.blocks[b].data.push({ title: "card", description: "description text" });
        showFile(path);
      };

      blockdiv.append(newcardbtn);
    }

    blockdiv.addEventListener(
      "contextmenu",
      function (e) {
        e.preventDefault();
        console.log(`context menu on [${file.blocks[b].type}], file: ${path}, block: ${b}`);
        openBlockContextMenu(path, b, e.clientX, e.clientY);
        return false;
      },
      false
    );

    blockcontainer.append(blockdiv);
  }

  document.querySelector("#file-container").innerHTML = "";
  document.querySelector("#file-container").append(filename);
  document.querySelector("#file-container").append(blockcontainer);
}

function generateSidenav() {
  // clear current sidenav buttons
  document.querySelector("#sidenav-file-btn-container").innerHTML = "";
  for (let r = 0; r < files.length; r++) {
    // for each root file
    appendElements(document.querySelector("#sidenav-file-btn-container"), generateSidenavBtn(files[r], [r]));
  }
}

function generateSidenavBtn(index, path) {
  let btn_container = createElement("button", { class: "sidenav-btn sidenav-file-btn-container" });
  let btn_new = createElement("button", { class: "new" });
  let btn = createElement("button", { class: "name", innerhtml: index.name });
  if (index.name == "") {
    btn.innerHTML = "Untitled File";
  }

  btn_container.append(btn);
  btn_container.append(btn_new);
  btn_new.onclick = function (e) {
    // override clicking parent
    e.stopPropagation();
    newFile(path);
  };

  // 8px default padding, 8px for each parent
  btn.style.paddingLeft = 8 + 8 * (path.length - 2) + "px";
  btn_container.onclick = function () {
    showFile(path);
  };
  let childrendiv = createElement("div", { class: "childfilesdiv" });
  if (index.children.length > 0) {
    for (let c = 0; c < index.children.length; c++) {
      // for each child file
      appendElements(childrendiv, generateSidenavBtn(index.children[c], path.concat(c)));
    }
  }
  return [btn_container, childrendiv];
}

init();
