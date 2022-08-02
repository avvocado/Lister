// event listeners
document.getElementById("closeBtn").addEventListener("click", function () {
  window.api.send("close", "");
});

document.getElementById("minimizeBtn").addEventListener("click", function () {
  window.api.send("minimize", "");
});

function init() {
  // request the list from json
  window.api.send("requestLists", "");
  window.api.send("createTray", "");
}

function generateList() {
  for (let l = 0; l < lists.children.length; l++) {
    // for each list
  }
}
init();
