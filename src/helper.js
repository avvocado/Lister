var blocktypes = [
  // Headings
  {
    name: "Heading 1",
    icon: "",
    shorthand: "h1",
    type: "heading1",
  },
  {
    name: "Heading 2",
    icon: "",
    shorthand: "h2",
    type: "heading2",
  },
  {
    name: "Heading 3",
    icon: "h",
    shorthand: "h3",
    type: "heading3",
  },
  // Text
  {
    name: "Text",
    icon: "",
    shorthand: "p",
    type: "text",
  },
  // Divider
  {
    name: "Divider",
    icon: "",
    shorthand: "d",
    type: "divider",
  },
  // Code Block
  {
    name: "Code Block",
    icon: "",
    shorthand: "code",
    type: "code_block",
  },
  // URL
  {
    name: "URL",
    icon: "",
    shorthand: "url",
    type: "url",
  },
  // Table
  {
    name: "Table",
    icon: "",
    shorthand: "table",
    type: "table",
  },
  // Cards
  {
    name: "Cards",
    icon: "",
    shorthand: "cards",
    type: "cards",
  },
];

// create element
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
  if (params.href) {
    elem.href = params.href;
    elem.target = "_blank";
  }
  if (params.disabled) {
    elem.disabled = params.disabled;
  }
  if (params.title) {
    elem.title = params.title;
  }
  if (params.backgroundimage) {
    elem.style.backgroundImage = params.backgroundimage;
  }

  if (params.id) {
    elem.id = params.id;
  }

  return elem;
}

// append array of html elements
function appendElements(parent, elems) {
  for (let i = 0; i < elems.length; i++) {
    parent.append(elems[i]);
  }
}

function pathToFile(path) {
  let file = files;
  for (let f = 0; f < path.length; f++) {
    // for each number in the path
    // go down the file strucutre using [path] and find the correct file
    if (file == files) {
      file = file[path[f]];
    } else {
      file = file.children[path[f]];
    }
  }
  return file;
}

function newBlock(path, type) {
  pathToFile(path).blocks.push({ type: type, data: "" });
}

function newFile(path) {
  let d = new Date();

  pathToFile(path).children.push({
    name: `File`,
    icon: "file",
    creationdate: d.getTime(),
    lastedited: d.getTime(),
    children: [],
    blocks: [],
    starred: false,
    locked: false,
    archived: false,
  });
  generateSidenav();
}

// block context menu with file path, block index, mouse x, mouse y
function openBlockContextMenu(path, b, x, y) {
  document.querySelector("#context-menu").style.display = "flex";

  // get context menu
  let cm = document.querySelector("#context-menu");
  // clear
  cm.innerHTML = "";
  // change position
  cm.style.top = window.scrollY + y + "px";
  cm.style.left = window.scrollX + x + "px";
  // create buttons
  // delete
  let delete_btn = createElement("button", { innerhtml: "Delete" });
  delete_btn.onclick = function () {
    deleteBlock(path, b);
    hideContextMenu();
  };
  // duplicate
  let duplicate_btn = createElement("button", { innerhtml: "Duplicate" });
  duplicate_btn.onclick = function () {
    duplicateBlock(path, b);
    hideContextMenu();
  };
  // append
  cm.append(delete_btn);
  cm.append(duplicate_btn);
}

function duplicateBlock(path, b) {
  let file = pathToFile(path);
  file.blocks.splice(b, 0, file.blocks[b]);
  showFile(path);
}

function deleteBlock(path, b) {
  pathToFile(path).blocks.splice(b, 1);
  showFile(path);
}

function hideContextMenu() {
  document.querySelector("#context-menu").style.display = "none";
}

onclick = (e) => {
  if (document.querySelector("#context-menu").style.display == "flex") {
    // if context menu is open
    if (document.elementFromPoint(e.clientX, e.clientY) != document.querySelector("#context-menu")) {
      // if you didn't click the context menu, hide it
      hideContextMenu();
    }
  }
};
