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

function generateFile(p, c) {
  // generate the current active file
  // container
  let fileContainer = createElement("div", { class: "filecontainer" });
  let fileName = createElement("div", { class: "filename", innerhtml: files.children[p].children[c].name });

  // file actions
  let deleteFileBtn = createElement('button', {class: 'deletefilebtn', innerhtml: 'delete file'})
  deleteFileBtn.onclick = function(){
    deleteFile(p,c)
    // todo: go to the next file or none
  }
  document.querySelector('#fileactions').append(deleteFileBtn)

  fileContainer.append(fileName);
  return fileContainer;
}

function gotoFile(p, c) {
  // change the active file
  activefile = [p, c];

  let btn = document.querySelectorAll(".folderdiv")[p].children[c];

  if (document.querySelector(".sidenavbtn.active") !== null) document.querySelector(".sidenavbtn.active").classList.remove("active");
  btn.classList.add("active");

  // clear curent file & file actions
  document.querySelector("#activefile").innerHTML = "";
  document.querySelector("#fileactions").innerHTML = "";


  // append the new file
  document.querySelector("#activefile").append(generateFile(p, c));
}

function generateSidenav() {
  // generate all the sidenav buttons
  document.querySelector("#filebtns").innerHTML = "";
  console.log("generating sidenav buttons");

  for (let p = 0; p < files.children.length; p++) {
    // for each folder
    let folderDiv = createElement("div", { class: "folderdiv" });
    let folderBtn = createElement("button", { class: "sidenavbtn folder down", innerhtml: files.children[p].name });

    // collapse and show file buttons
    folderBtn.onclick = function () {
      folderDiv.style.display = folderDiv.style.display == "none" ? "flex" : "none";
      this.className = "sidenavbtn folder " + (folderDiv.style.display == "none" ? "right" : "down");
    };
    for (let c = 0; c < files.children[p].children.length; c++) {
      // for each file
      // sidenav button
      let fileBtn = createElement("button", { class: "sidenavbtn file", innerhtml: files.children[p].children[c].name });

      // show that file
      fileBtn.onclick = function () {
        gotoFile(p, c, this);
      };
      folderDiv.append(fileBtn);
    }
    // new file button
    let newFileBtn = createElement("button", { class: "sidenavbtn newfile", innerhtml: "New File" });
    newFileBtn.onclick = function () {
      newFile(p);
    };
    folderDiv.append(newFileBtn);
    document.querySelector("#filebtns").append(folderBtn);
    document.querySelector("#filebtns").append(folderDiv);
  }
}
init();
