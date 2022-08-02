// receiving data from main.js

window.api.receive("lists", (args) => {
  // receiving list.json
  lists = args;
  generateList();
});
