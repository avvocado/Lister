// event listeners
document.getElementById("closeBtn").addEventListener("click", function () {
  window.api.send("close", "");
});

document
  .querySelectorAll(".checkedItemStyleBtn")[0]
  .addEventListener("click", function () {
    settings["checkedItemStyle"] = 0;
    document
      .querySelectorAll(".checkedItemStyleBtn")[1]
      .classList.remove("active");
    this.classList.add("active");
    writeSettings(settings);
    for (
      let i = 0;
      i < document.querySelectorAll(".checklistItem").length;
      i++
    ) {
      document
        .querySelectorAll(".checklistItem")
        [i].classList.add("strikethrough");
    }
  });

document
  .querySelectorAll(".checkedItemStyleBtn")[1]
  .addEventListener("click", function () {
    settings["checkedItemStyle"] = 1;
    document
      .querySelectorAll(".checkedItemStyleBtn")[0]
      .classList.remove("active");
    this.classList.add("active");
    writeSettings(settings);
    for (
      let i = 0;
      i < document.querySelectorAll(".checklistItem").length;
      i++
    ) {
      document
        .querySelectorAll(".checklistItem")
        [i].classList.remove("strikethrough");
    }
  });

document
  .getElementById("blockListItemMediaWidth")
  .addEventListener("input", function () {
    let wid = document.querySelector("#blockListItemMediaWidth").value * 10;
    document.querySelector("#mediaWidthTitle").innerHTML =
      "Media Width (" + wid + "%)";
    for (let i = 0; i < document.querySelectorAll(".blockItemMedia").length; i++) {
      document.querySelectorAll(".blockItemMedia")[i].style.width = wid + "%";
    }
    settings["blockListItemMediaWidth"] = wid;
    writeSettings(settings);
  });

document.getElementById("toggleSideBtn").addEventListener("click", function () {
  if (document.querySelector("#sidenav").style.padding == "8px 0px") {
    document.querySelector("#content").style.marginLeft = `${sidebarWidth + 20 /* 8px padding */}px`;
    document.querySelector("#sidenav").style.width = null;
    document.querySelector("#sidenav").style.padding = null;
    document.querySelector("#content").style.borderRadius = "16px 0 0 0";
  } else {
    document.querySelector("#content").style.margin = "0";
    document.querySelector("#sidenav").style.width = "0";
    document.querySelector("#sidenav").style.padding = "8px 0 8px 0";
    document.querySelector("#content").style.borderRadius = "0";
  }
});

document.getElementById("password").addEventListener("blur", function () {
  if (settings["password"] != this.value) {
    // if the password actually changed
    settings["password"] = this.value;

    writeSettings(settings);
  }
});

document.getElementById("password").addEventListener("keydown", function (e) {
  if (e.code == "Enter") {
    this.blur();
  }
});

document.getElementById("minimizeBtn").addEventListener("click", function () {
  window.api.send("minimize", "");
});


document.getElementById("newListBtn").addEventListener("click", function () {
  let type = document.getElementById("listType").value;
  showAlert("Created New List", 1000, "success");
  newList(type);
});

document
  .getElementById("resetSettingsBtn")
  .addEventListener("click", function () {
    writeSettings(defaultSettings);
    window.api.send("requestSettings", "");
    showAlert("Reset Settings", 1000, "success");
  });

document
  .getElementById("openResourcesFolderBtn")
  .addEventListener("click", function () {
    window.api.send("openPath", "list.json");
  });

document
  .getElementById("alwaysOnTopCheckbox")
  .addEventListener("input", function () {
    settings["alwaysOnTop"] = this.checked;
    window.api.send("alwaysOnTop", this.checked);
    writeSettings(settings);
  });
document
  .getElementById("bwtrayiconCheckbox")
  .addEventListener("input", function () {
    settings["bwTrayIcon"] = this.checked;
    window.api.send("trayIcon", this.checked);
    writeSettings(settings);
  });

document
  .getElementById("spellcheckToggle")
  .addEventListener("input", function () {
    settings["spellcheck"] = this.checked;
    writeSettings(settings);
    for (
      let e = 0;
      e <
      document.body.querySelectorAll(
        '[contentEditable="true"], input[type="text"]'
      ).length;
      e++
    ) {
      document.body.querySelectorAll(
        '[contentEditable="true"], input[type="text"]'
      )[e].spellcheck = this.checked;
    }
  });

document
  .getElementById("24hrtimeToggle")
  .addEventListener("input", function () {
    settings["24hrtime"] = this.checked;
    writeSettings(settings);
    generateList()
  });

document.getElementById("settingsBtn").addEventListener("click", function () {
  for (
    let p = 0;
    p < document.getElementsByClassName("sidenavBtn").length;
    p++
  ) {
    document.getElementsByClassName("sidenavBtn")[p].classList.remove("active");
  }
  this.classList.add("active");
  for (let k = 0; k < document.getElementsByClassName("listContainer").length; k++) {
    document.getElementsByClassName("listContainer")[k].style.display = "none";
  }
  document.getElementById("noListSelected").style.display = "none";

  document.getElementById("settings").style.display = null;

  selectedList = list["children"].length;
});

function init() {
  // request the json
  // uses toMain, which sends data to the main process
  window.api.send("requestList", "");
  window.api.send("requestSettings", "");
  window.api.send("requestSystem", "");
  window.api.send("requestDefaultSettings", "");
  // wait for main to send back the json
}

function generateList() {
  try {
    let d = new Date();

    document.getElementById("listBtns").innerHTML = "";

    let lists = document.getElementById("lists");
    lists.innerHTML = "";

    for (let l = 0; l < list["children"].length; l++) {
      let tdate = new Date(list["children"][l]["creationDate"]);
      let edate = new Date(list["children"][l]["lastEdited"]);

      // for each list
      let lockedDiv;
      let sidenavBtn;
      let sidenavBtnText;
      let sidenavBtnDate;
      // list content div
      let listContainer = create("div", "listContainer");
      let listWrapper = create("div", "listWrapper");

      let pswd;
      if (list["children"][l]["locked"] == true) {
        let lockedTitle = create("p", "");
        let touchIdBtn = create("button", "touchidbtn");
        touchIdBtn.onclick = function () {
          awaitUnlock = l;
          window.api.send("touchID", "");
        };
        lockedTitle.innerHTML = "This List is Locked";
        listContainer.classList.add("locked");
        listWrapper.style.display = "none";
        lockedDiv = create("div", "lockedDiv");
        pswd = createElement("input", {
          class: "pswdInput",
          type: "password",
          placeholder: "Password",
        });
        let pswdSubmit = create("button", "pswdSubmit");
        pswdSubmit.onclick = function () {
          if (pswd.value == settings["password"]) {
            // correct password
            pswd.value = "";
            lockedDiv.style.display = "none";
            listWrapper.style.display = "";
            listWrapper.style.animation = "fadein 1000ms";
            sidenavBtnText.innerHTML = list["children"][l]["name"];
            sidenavBtnDate.innerHTML = timeAgo(d.getTime(), edate);
            sidenavBtn.classList.remove("locked");
            sidenavBtn.classList.add(list["children"][l]["type"]);
            showAlert(
              'Unlocked "' + list["children"][l]["name"] + '"',
              1000,
              "success"
            );
          } else {
            // incorrect password
            pswd.select();
            showAlert("Incorrect Password", 1000, "error");
          }
        };
        pswd.onkeydown = function (e) {
          if (e.code == "Enter") {
            pswdSubmit.click();
          }
        };
        lockedDiv.append(lockedTitle);

        if (system["touchID"] == true) {
          lockedDiv.append(touchIdBtn);
        }
        lockedDiv.append(pswd);
        lockedDiv.append(pswdSubmit);
        listContainer.append(lockedDiv);
      }

      // list title
      let listTitle = createElement("input", {
        class: "listTitle",
        type: "text",
        value: list["children"][l]["name"],
      });
      listTitle.spellcheck = settings.spellcheck;
      let ltTemp = "";
      listTitle.onkeydown = function (e) {
        if (e.code == "Enter") {
          this.blur();
        }
      };
      listTitle.onfocus = function () {
        ltTemp = this.value;
      };
      listTitle.onblur = function () {
        if (this.value != ltTemp) {
          list["children"][l]["name"] = this.value;
          listEdited(l);
        }
      };

      sidenavBtn = create("div", "sidenavBtn ");
      sidenavBtnText = create("p", "title");
      sidenavBtnDate = create("p", "date");
      sidenavBtn.append(sidenavBtnText);
      sidenavBtn.append(sidenavBtnDate);

      if (list["children"][l]["locked"] == true) {
        sidenavBtn.classList.add("locked");
        sidenavBtnText.innerHTML = "Locked List";
        sidenavBtnDate.innerHTML = "...";
      } else {
        sidenavBtnText.innerHTML = list["children"][l]["name"];
        sidenavBtnDate.innerHTML = timeAgo(d.getTime(), edate);
      }
      sidenavBtn.classList.add(list["children"][l]["type"]);
      let lastEdited;
      sidenavBtn.onclick = function () {
        console.log(selectedList + " > " + l);
        this.classList.add("active");

        if (selectedList != -1) {
          // if you arent coming from nolistselected
          if (l != selectedList) {
            try{
              document
              .getElementsByClassName("sidenavBtn")
              [selectedList].classList.remove("active");
            }catch(err){
              
            }
            
          }
          document.querySelector("#settingsBtn").classList.remove("active");

          // update last edited
          let d = new Date();
          lastEdited.innerHTML =
            "Edited " + timeAgo(d.getTime(), list["children"][l]["lastEdited"]);

          if (list["children"][l]["locked"] == false) {
            sidenavBtnDate.innerHTML = timeAgo(d.getTime(), edate);
          }

          for (
            let h = 0;
            h < document.querySelectorAll(".listContainer").length;
            h++
          ) {
            document.querySelectorAll(".listContainer")[h].style.display = "none";
          }
        }

        // hide settings and nolistselected pages
        document.getElementById("settings").style.display = "none";
        document.getElementById("noListSelected").style.display = "none";

        // show list div
        document.querySelectorAll(".listContainer")[l].style.display = null;

        if (list["children"][l]["locked"] == true) {
          // if you're entering a locked list, relock it
          if (selectedList != l) {
            sidenavBtn.classList.remove(list["children"][l]["type"]);
            sidenavBtn.classList.add("locked");
            lockedDiv.style.display = "block";
            listWrapper.style.display = "none";
            pswd.focus();
          }
          // you're going to the same list & its unlocked, bypass the lock
          if (l == selectedList && lockedDiv.style.display != "block") {
            lockedDiv.style.display = "none";
            listWrapper.style.display = null;
            sidenavBtnText.innerHTML = list["children"][l]["name"];
            sidenavBtnDate.innerHTML = timeAgo(d.getTime(), edate);
            sidenavBtn.classList.remove("locked");
            sidenavBtn.classList.add(list["children"][l]["type"]);
          }
        }
        if (
          selectedList != -1 &&
          selectedList != list["children"].length &&
          list["children"][selectedList]["locked"] == true &&
          selectedList != l
        ) {
          // leaving a locked list, just change the title of sidelist btn to locked list
          document.querySelectorAll(".sidenavBtn .title")[
            selectedList
          ].innerHTML = "Locked List";
          document.querySelectorAll(".sidenavBtn .date")[
            selectedList
          ].innerHTML = "...";
          document
            .querySelectorAll(".sidenavBtn")
            [selectedList].classList.remove(list["children"][l]["type"]);
          document
            .querySelectorAll(".sidenavBtn")
            [selectedList].classList.add("locked");
          document.querySelectorAll(".listContainer")[
            selectedList
          ].children[0].children[1].value = "";
          //                         .listContainer                .lockedDiv  .pswdInput
        }
        selectedList = l;
      };

      // list settings, creation date, last edit + buttons
      let listSettingsDiv = create("div", "listSettingsDiv");
      let listCreationDate = createElement("p", {
        class: "listDate",
        title: settings["24hrtime"]
          ? months[tdate.getMonth()] +
            " " +
            tdate.getDate() +
            ", " +
            tdate.getHours() +
            ":" +
            tdate.getMinutes().toString().padStart(2, "0")
          : months[tdate.getMonth()] +
            " " +
            tdate.getDate() +
            ", " +
            (tdate.getHours() % 12 || 12) +
            ":" +
            tdate.getMinutes().toString().padStart(2, "0") +
            " " +
            getAmPm(tdate),
        innerhtml:
          "•&nbsp;&nbsp;&nbsp;Created " +
          timeAgo(d.getTime(), list["children"][l]["creationDate"]),
      });

      lastEdited = create("p", "listDate");

      if (list["children"][l]["lastEdited"] != 0) {
        lastEdited.title = settings["24hrtime"]
          ? months[edate.getMonth()] +
            " " +
            edate.getDate() +
            ", " +
            edate.getHours() +
            ":" +
            edate.getMinutes().toString().padStart(2, "0")
          : months[edate.getMonth()] +
            " " +
            edate.getDate() +
            ", " +
            (edate.getHours() % 12 || 12) +
            ":" +
            edate.getMinutes().toString().padStart(2, "0") +
            " " +
            getAmPm(edate);
        lastEdited.innerHTML =
          "Edited " + timeAgo(d.getTime(), list["children"][l]["lastEdited"]);
        lastEdited.style.marginRight = "10px";
        listSettingsDiv.append(lastEdited);
      }

      let deleteListBtn = createElement("button", {
        class: "deleteListBtn right",
      });
      deleteListBtn.onclick = function () {
        showAlert(
          'Deleted "' + list["children"][l]["name"] + '"',
          +1000,
          "success"
        );
        removeList(l);
        writeJSON(list);
        generateList();
      };

      listSettingsDiv.append(listCreationDate);
      listSettingsDiv.append(deleteListBtn);

      if (list["children"][l]["locked"] == false) {
        // not locked yet

        let lockListBtn = create("button", "lockListBtn right");
        lockListBtn.onclick = function () {
          list["children"][l]["locked"] = true;
          writeJSON(list);
          generateList();
        };
        listSettingsDiv.append(lockListBtn);
      } else {
        // already locked

        let unlockListBtn = create("button", "unlockListBtn right");
        unlockListBtn.onclick = function () {
          list["children"][l]["locked"] = false;
          writeJSON(list);
          generateList();
        };
        listSettingsDiv.append(unlockListBtn);
      }
      listWrapper.append(listSettingsDiv);

      document.getElementById("listBtns").append(sidenavBtn);
      listWrapper.append(listTitle);

      if (list["children"][l]["type"] == "block") {
        listContainer.classList.add("block");
        listWrapper.classList.add("block");

        // NEW SUBLIST BUTTON
        let newSublistBtn = create("button", "newBtn right");
        newSublistBtn.onclick = function () {
          newSublist(l);
          listEdited(l);
        };
        listSettingsDiv.append(newSublistBtn);

        let sublists = create("div", "listContent block");
        for (let i = 0; i < list["children"][l]["children"].length; i++) {
          // FOR_EACH_SUBLIST

          let sublistContainer = create("div", "sublistContainer");
          let sublistWrapperDiv = create("div", "content");

          let sublistTitleDiv = create("div", "sublistTitleDiv");
          let collapseSublistBtn = create("button", "collapseSublistBtn down");
          collapseSublistBtn.onclick = function () {
            if (sublistWrapperDiv.style.display == "none") {
              sublistWrapperDiv.style.display = null;
              this.classList.remove("up");
              this.classList.add("down");
            } else {
              sublistWrapperDiv.style.display = "none";
              this.classList.remove("down");
              this.classList.add("up");
            }
          };

          let deleteSublistBtn = create("button", "delSublistBtn");
          deleteSublistBtn.onclick = function () {
            deleteSublist(l, i);
            listEdited(l);
          };

          let newItemToTopBtn = create("button", "newItemToTopBtn");
          newItemToTopBtn.onclick = function () {
            // newItemToTop(l, i)
            newBlockItem(l, i);
            listEdited(l);
          };
          let sublistTitleP = createElement("input", {
            value: list["children"][l]["children"][i]["name"],
            type: "text",
          });

          sublistTitleP.onkeydown = function (e) {
            if (e.code == "Enter") {
              this.blur();
            }
          };
          // only update list and writejson if it actually changed
          let stpTemp = "";
          sublistTitleP.onfocus = function () {
            stpTemp = this.value;
          };
          sublistTitleP.onblur = function () {
            if (this.value != stpTemp) {
              list["children"][l]["children"][i]["name"] = this.value;
              listEdited(l);
            }
          };
          sublistTitleDiv.append(deleteSublistBtn);

          sublistTitleDiv.append(newItemToTopBtn);
          sublistTitleDiv.append(collapseSublistBtn);
          sublistTitleDiv.append(sublistTitleP);

          sublistContainer.append(sublistTitleDiv);
          sublistContainer.append(sublistWrapperDiv);
          sublists.append(sublistContainer);

          // FOR_EVERY_ITEM
          for (
            let e = 0;
            e < list["children"][l]["children"][i]["children"].length;
            e++
          ) {
            // -1 because "name" is a key
            let itemSettingsDiv = document.createElement("div");

            let blockItem = document.createElement("div");
            blockItem.className = "blockItem";

            // status button
            button = document.createElement("button");
            button.classList = "statusBtn";

            button.onclick = function (event) {
              // left click, cycle up
              if (
                list["children"][l]["children"][i]["children"][e]["status"] < 3
              ) {
                list["children"][l]["children"][i]["children"][e][
                  "status"
                ] += 1;
                writeJSON(list);
              } else {
                list["children"][l]["children"][i]["children"][e]["status"] = 0;
              }
              this.className = "statusBtn";
              this.classList.add(
                "s" +
                  list["children"][l]["children"][i]["children"][e][
                    "status"
                  ].toString()
              );
              listEdited(l);
            };
            button.classList.add(
              "s" +
                list["children"][l]["children"][i]["children"][e][
                  "status"
                ].toString()
            );
            blockItem.append(button);

            // ITEM_TITLE
            let itemTitle = createElement("p", {
              contenteditable: true,
              innerhtml:
                list["children"][l]["children"][i]["children"][e]["title"],
              class: "title",
            });
            itemTitle.addEventListener("paste", function (e) {
              e.preventDefault();
              var text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            });
            itemTitle.spellcheck = settings.spellcheck;
            let itTemp = "";
            itemTitle.onfocus = function () {
              itTemp = this.innerText;
            };
            itemTitle.onblur = function () {
              if (this.innerText != itTemp) {
                console.log("item title");
                list["children"][l]["children"][i]["children"][e]["title"] =
                  this.innerText;
                listEdited(l);
              }
            };
            itemTitle.onkeydown = function (e) {
              if (e.code == "Enter") {
                this.blur();
              }
            };
            blockItem.append(itemTitle);

            // ITEM_SETTINGS_BUTTON
            let moreBtn = document.createElement("button");
            moreBtn.className = "moreBtn";
            moreBtn.onclick = function () {
              if (itemSettingsDiv.style.display == "none") {
                itemSettingsDiv.style.display = "block";
                blockItem.style.paddingBottom = "2px";
              } else {
                itemSettingsDiv.style.display = "none";
                blockItem.style.paddingBottom = null;
              }
            };
            blockItem.append(moreBtn);

            // ITEM_MEDIA
            if (
              list["children"][l]["children"][i]["children"][e]["media"] !=
                null &&
              list["children"][l]["children"][i]["children"][e]["media"] !=
                "" &&
              list["children"][l]["children"][i]["children"][e]["media"] != []
            ) {
              // if there is an media media specified
              for (
                let p = 0;
                p <
                list["children"][l]["children"][i]["children"][e]["media"]
                  .length;
                p++
              ) {
                // for every piece of media
                if (
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith("png") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith("jpg") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith("jpeg") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith("gif") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith("webp")
                ) {
                  // if is .png .jpg .jpeg .gif .webp
                  // make image
                  let img = document.createElement("img");
                  img.className = "itemMedia";
                  img.src =
                    "../resources/media/" +
                    list["children"][l]["children"][i]["children"][e]["media"][
                      p
                    ];

                  img.addEventListener("dblclick", function () {
                    window.api.send(
                      "openFile",
                      list["children"][l]["children"][i]["children"][e][
                        "media"
                      ][p]
                    );
                  });
                  img.style.cursor = "pointer";
                  blockItem.append(img);
                } else if (
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith(".mp4") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith(".webm")
                ) {
                  // if is .mp4 .webm
                  // make video
                  let vid = document.createElement("video");
                  vid.className = "itemMedia";
                  vid.controls = true;
                  vid.disablePictureInPicture = true;
                  vid.controlsList =
                    "nodownload noremoteplayback noplaybackrate";
                  vid.src =
                    "../resources/media/" +
                    list["children"][l]["children"][i]["children"][e]["media"][
                      p
                    ];
                  vid.alt =
                    "Error loading " +
                    list["children"][l]["children"][i]["children"][e]["media"][
                      p
                    ];
                  vid.title =
                    list["children"][l]["children"][i]["children"][e]["media"][
                      p
                    ];
                  blockItem.append(vid);
                } else if (
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith(".ogg") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith(".wav") ||
                  list["children"][l]["children"][i]["children"][e]["media"][
                    p
                  ].endsWith(".mp3")
                ) {
                  // if is .ogg .wav .mp3
                  // make audio
                  let aud = document.createElement("audio");
                  aud.controls = true;
                  aud.className = "itemMedia";
                  aud.src =
                    "../resources/media/" +
                    list["children"][l]["children"][i]["children"][e]["media"][
                      p
                    ];
                  blockItem.append(aud);
                }
              }

              // DELETE_MEDIA_BUTTON
              let delMediaBtn = createElement("button", {
                class: "delMediaBtn",
              });
              delMediaBtn.onclick = function () {
                list["children"][l]["children"][i]["children"][e]["media"] = [];
                listEdited(l);
              };
            }

            // ITEM_CREATION_DATE
            let cdate = new Date(
              list["children"][l]["children"][i]["children"][e]["creationDate"]
            );
            let creationDateP = create("p", "creationDateText");
            creationDateP.title = settings["24hrtime"]
              ? months[cdate.getMonth()] +
                " " +
                cdate.getDate() +
                ", " +
                cdate.getHours() +
                ":" +
                cdate.getMinutes().toString().padStart(2, "0")
              : months[cdate.getMonth()] +
                " " +
                cdate.getDate() +
                ", " +
                (cdate.getHours() % 12 || 12) +
                ":" +
                cdate.getMinutes().toString().padStart(2, "0") +
                " " +
                getAmPm(cdate);

            creationDateP.innerHTML =
              "• " +
              timeAgo(
                d.getTime(),
                list["children"][l]["children"][i]["children"][e][
                  "creationDate"
                ]
              );

            // ITEM_SETTINGS_DIV
            itemSettingsDiv.style.display = "none";
            itemSettingsDiv.className = "itemSettingsDiv";

            // DUPLICATE_ITEM_BUTTON_
            let duplicateItemBtn = create("button", "duplicateItemBtn");
            duplicateItemBtn.onclick = function () {
              list["children"][l]["children"][i]["children"].splice(
                e,
                0,
                list["children"][l]["children"][i]["children"][e]
              );
              listEdited(l);
            };

            // ADD MEDIA BUTTON
            let mediaBtnDiv = document.createElement("div");
            let mediaBtn = create("button", "uploadMediaBtn");

            mediaBtn.onclick = function () {
              currImgIndex = [l, i, e];
              // wait for main to send back the media name
              window.api.send("uploadMedia", "");
            };

            // DELETE ITEM BUTTON
            let delItemBtn = document.createElement("button");
            delItemBtn.className = "deleteItemBtn";

            delItemBtn.onclick = function () {
              removeItem(l, i, e);
              listEdited(l);
            };

            // add buttons to item settings
            itemSettingsDiv.append(mediaBtn);

            if (
              list["children"][l]["children"][i]["children"][e]["media"] !=
                null &&
              list["children"][l]["children"][i]["children"][e]["media"] !=
                "" &&
              list["children"][l]["children"][i]["children"][e]["media"] != []
            ) {
              // if no media
              itemSettingsDiv.append(delMediaBtn);
            }
            itemSettingsDiv.append(duplicateItemBtn);
            itemSettingsDiv.append(delItemBtn);
            // creation date
            blockItem.append(creationDateP);
            blockItem.append(itemSettingsDiv);
            sublistWrapperDiv.append(blockItem);
          }
        }

        listWrapper.append(sublists);
        listContainer.append(listWrapper);
        lists.append(listContainer);
      } else if (list["children"][l]["type"] == "text") {
        listContainer.classList.add("text");
        listWrapper.classList.add("text");
        let textDiv = create("div", "listContent text");

        for (let a = 0; a < list["children"][l]["children"].length; a++) {
          // all "blocks"
          let blockDiv = create("div", "block");
          if (list["children"][l]["children"][a]["type"] == "text") {
            blockDiv.classList.add("text");
            let textBlockP = create("p", "text");
            textBlockP.spellcheck = settings["spellcheck"];
            let temp = "";
            textBlockP.onfocus = function () {
              temp = this.innerHTML;
            };
            textBlockP.onblur = function () {
              if (this.innerHTML != temp) {
                list["children"][l]["children"][a]["data"] = this.innerHTML;
                listEdited(l);
              }
            };
            textBlockP.addEventListener("paste", function (e) {
              e.preventDefault();
              var text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            });
            textBlockP.innerHTML = list["children"][l]["children"][a]["data"];
            textBlockP.contentEditable = true;
            blockDiv.append(textBlockP);
          } else if (list["children"][l]["children"][a]["type"] == "code") {
            blockDiv.classList.add("code");
            let copyBtnDiv = create("div", "copyBtnDiv");
            let codeBlockP = create("p", "text");
            codeBlockP.spellcheck = settings["spellcheck"];
            codeBlockP.onmouseenter = function () {
              copyBtnDiv.style.display = "block";
            };
            blockDiv.onmouseleave = function () {
              copyBtnDiv.style.display = "none";
            };
            let temp = "";
            codeBlockP.onfocus = function () {
              temp = this.innerHTML;
            };
            codeBlockP.onblur = function () {
              if (this.innerHTML != temp) {
                list["children"][l]["children"][a]["data"] = this.innerHTML;
                listEdited(l);
              }
            };
            codeBlockP.addEventListener("paste", function (e) {
              e.preventDefault();
              var text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            });
            codeBlockP.innerHTML = list["children"][l]["children"][a]["data"];
            codeBlockP.contentEditable = true;

            let deleteBlockBtn = create("button", "delBlockBtn");
            deleteBlockBtn.onclick = function () {
              deleteBlock(l, a);
              listEdited(l);
            };

            let copyBtn = create("button", "copyBtn");
            copyBtnDiv.style.display = "none";

            copyBtn.onclick = function () {
              codeBlockP.style.animation = "flash 500ms";
              navigator.clipboard
                .writeText(list["children"][l]["children"][a]["data"])
                .then(
                  function () {
                    // success
                  },
                  function (err) {
                    console.error("Async: Could not copy text: ", err);
                  }
                );
              setTimeout(function () {
                codeBlockP.style.animation = "";
              }, 500);
            };

            let blockSettingsDiv = create("div", "blockSettingsDiv");
            blockSettingsDiv.append(deleteBlockBtn);
            blockDiv.append(copyBtn);
            blockDiv.append(blockSettingsDiv);
            blockDiv.append(codeBlockP);
          } else if (list["children"][l]["children"][a]["tyoe"] == "media") {
          }
          textDiv.append(blockDiv);
        }

        let newCodeBlockBtn = create("button", "newCodeBlockBtn", "");

        newCodeBlockBtn.onclick = function () {
          /*list['children'][l]['children'].push({
            "data": "New Code Block",
            "type": "code"
          })
          list['children'][l]['children'].push({
            "data": "",
            "type": "text"
          })
          writeJSON(list)
          generateList()*/
          showAlert("Code blocks are currently disabled", 1250, "warning");
        };

        listSettingsDiv.append(newCodeBlockBtn);

        listWrapper.append(textDiv);

        listContainer.append(listWrapper);
        lists.append(listContainer);
      } else if (list["children"][l]["type"] == "checklist") {
        listContainer.classList.add("checklist");
        listWrapper.classList.add("checklist");

        // NEW SUBLIST BUTTON
        let newSublistBtn = create("button", "newBtn right");
        newSublistBtn.onclick = function () {
          newChecklistSublist(l);
          listEdited(l);
        };
        listSettingsDiv.append(newSublistBtn);

        let sublists = create("div", "listContent checklist");
        for (let i = 0; i < list["children"][l]["children"].length; i++) {
          // FOR_EACH_SUBLIST

          let sublistContainer = create("div", "sublistContainer");
          let sublistWrapperDiv = create("div", "checklistSublistContainer");

          let sublistTitleDiv = create("div", "sublistTitleDiv");
          let collapseSublistBtn = create("button", "collapseSublistBtn down");
          collapseSublistBtn.onclick = function () {
            if (sublistWrapperDiv.style.display == "none") {
              sublistWrapperDiv.style.display = null;
              this.classList.remove("up");
              this.classList.add("down");
            } else {
              sublistWrapperDiv.style.display = "none";
              this.classList.remove("down");
              this.classList.add("up");
            }
          };

          let deleteSublistBtn = create("button", "delSublistBtn");
          deleteSublistBtn.onclick = function () {
            deleteSublist(l, i);
            listEdited(l);
          };

          let sublistTitleP = createElement("input", {
            value: list["children"][l]["children"][i]["name"],
            type: "text",
          });

          sublistTitleP.spellcheck = settings["spellcheck"];
          sublistTitleP.onkeydown = function (e) {
            if (e.code == "Enter") {
              this.blur();
            }
          };
          // only update list and writejson if it actually changed
          let stpTemp = "";
          sublistTitleP.onfocus = function () {
            stpTemp = this.value;
          };

          sublistTitleP.onblur = function () {
            if (this.value != stpTemp) {
              list["children"][l]["children"][i]["name"] = this.value;
              listEdited(l);
            }
          };
          sublistTitleDiv.append(deleteSublistBtn);

          sublistTitleDiv.append(collapseSublistBtn);
          sublistTitleDiv.append(sublistTitleP);

          sublistContainer.append(sublistTitleDiv);
          sublistContainer.append(sublistWrapperDiv);
          sublists.append(sublistContainer);

          for (
            let e = 0;
            e < list["children"][l]["children"][i]["children"].length;
            e++
          ) {
            let blockItem = create(
              "div",
              "checklistItem " +
                list["children"][l]["children"][i]["children"][e]["checked"]
            );
            let itemText = create("p", "checklistItemText");

            if (settings["checkedItemStyle"] == 0) {
              blockItem.classList.add("strikethrough");
            }
            let checkbox = create(
              "button",
              "checkBoxBtn " +
                list["children"][l]["children"][i]["children"][e]["checked"]
            );
            checkbox.onclick = function () {
              list["children"][l]["children"][i]["children"][e]["checked"] =
                !list["children"][l]["children"][i]["children"][e]["checked"];
              this.className =
                "checkBoxBtn " +
                list["children"][l]["children"][i]["children"][e]["checked"];
              blockItem.classList.remove("true");
              blockItem.classList.remove("false");
              blockItem.classList.add(
                list["children"][l]["children"][i]["children"][e]["checked"]
              );
              listEdited(l);
            };
            itemText.contentEditable = true;
            itemText.spellcheck = settings["spellcheck"];

            itemText.addEventListener("paste", function (e) {
              e.preventDefault();
              var text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            });

            let ctTemp = "";
            itemText.onkeydown = function (e) {
              if (e.code == "Enter") {
                this.blur();
              }
            };

            itemText.onfocus = function () {
              ctTemp = this.innerText;
            };
            itemText.onblur = function () {
              if (this.innerText != ctTemp) {
                list["children"][l]["children"][i]["children"][e]["text"] =
                  this.innerText;
                listEdited(l);
              }
              if (
                this.innerText.replaceAll(" ", "") == "" &&
                e != list["children"][l]["children"][i]["children"].length - 1
              ) {
                // if empty and not last element
                deleteChecklistItem(l, i, e);
                listEdited(l);
              }
              if (
                this.innerText.replaceAll(" ", "") != "" &&
                (list["children"][l]["children"][i]["children"].length == 0 ||
                  e ==
                    list["children"][l]["children"][i]["children"].length - 1)
              ) {
                // not empty and is last element
                newChecklistItemToBottom(l, i);
                listEdited(l);
              }
            };
            itemText.innerText =
              list["children"][l]["children"][i]["children"][e]["text"];

            // dont give last element a checkbox
            if (
              e !=
              list["children"][l]["children"][i]["children"].length - 1
            ) {
              blockItem.append(checkbox);
            } else {
              // is the last element
              itemText.style.marginLeft = "22px";
            }
            blockItem.append(itemText);
            sublistWrapperDiv.append(blockItem);
          }
        }
        listWrapper.append(sublists);
        listContainer.append(listWrapper);
        lists.append(listContainer);
      } else if (list["children"][l]["type"] == "accounts") {
        // ! LIST TYPE ACCOUNTS
        listContainer.classList.add("accounts");
        listWrapper.classList.add("accounts");
        // NEW SUBLIST BUTTON
        let newAccountBtn = create("button", "newBtn right");
        newAccountBtn.onclick = function () {
          newAccount(l);
          writeJSON(list);
          generateList();
        };

        searchBox = create("input", "accountSearchBox");
        searchBox.type = "text";
        searchBox.placeholder = "Search...";
        searchBox.spellcheck = settings.spellcheck;

        listSettingsDiv.append(newAccountBtn);
        listWrapper.append(searchBox);

        let accountsDiv = create("div", "listContent accounts");

        for (let i = 0; i < list["children"][l]["children"].length; i++) {
          // for each account
          // for_each_account

          let editableOnEdit = [];
          let accountFields = createElement("table", {});

          let accountDiv = create("div", "accountDiv");
          let accountTitle = create("p", "accountTitle");
          let collapseIcon = createElement("button", {
            class: "collapseAccountBtn up",
          });

          accountTitle.contentEditable = false;
          accountTitle.style.cursor = "default";
          editableOnEdit.push(accountTitle);
          accountTitle.onclick = function () {
            if (this.contentEditable == "false") {
              if (accountFields.style.display == "none") {
                accountFields.style.display = null;
                collapseIcon.classList.remove("up");
                collapseIcon.classList.add("down");
              } else {
                accountFields.style.display = "none";
                collapseIcon.classList.remove("down");
                collapseIcon.classList.add("up");
              }
            }
          };

          collapseIcon.onclick = function () {
            if (accountTitle.contentEditable == "false") {
              if (accountFields.style.display == "none") {
                accountFields.style.display = null;
                collapseIcon.classList.remove("up");
                collapseIcon.classList.add("down");
              } else {
                accountFields.style.display = "none";
                collapseIcon.classList.remove("down");
                collapseIcon.classList.add("up");
              }
            }
          };

          collapseIcon.click();
          accountTitle.spellcheck = settings["spellcheck"];

          let showOnEdit = [];

          let atTemp = "";
          accountTitle.onfocus = function () {
            atTemp = this.innerHTML;
          };
          accountTitle.onblur = function () {
            if (this.innerHTML != atTemp) {
              list["children"][l]["children"][i]["name"] = this.innerHTML;
              listEdited(l);
            }
          };
          accountTitle.onkeydown = function (e) {
            if (e.code == "Enter") {
              this.blur();
            }
          };
          accountTitle.innerHTML = list["children"][l]["children"][i]["name"];

          let openAccountSettingsBtn = create(
            "button",
            "openAccountSettingsBtn"
          );

          let deleteAccountBtn = createElement("button", {
            class: "right text-red border-red margin4",
            innerhtml: "Delete",
          });
          deleteAccountBtn.style.padding = "0 12px";
          deleteAccountBtn.style.borderRadius = "3px";
          deleteAccountBtn.onclick = function () {
            deleteAccount(l, i);
            listEdited(l);
          };

          let accountSettingsDiv = createElement("div", {
            class: "accountSettingsDiv",
            hide: true,
          });

          let saveAccountChangesBtn = createElement("button", {
            class: "right bg-green border-green margin4",
            innerhtml: "Done",
          });
          saveAccountChangesBtn.style.padding = "0 12px";
          saveAccountChangesBtn.style.borderRadius = "3px";
          saveAccountChangesBtn.onclick = function () {
            accountSettingsDiv.style.display = "none";
            openAccountSettingsBtn.style.display = null;

            // hide all tagged items
            for (let k = 0; k < showOnEdit.length; k++) {
              showOnEdit[k].style.display = "none";
            }

            // make elements not editable
            for (let k = 0; k < editableOnEdit.length; k++) {
              editableOnEdit[k].contentEditable = false;
              editableOnEdit[k].style.filter = null;
            }
            accountTitle.style.cursor = "default";
          };

          let fieldType = create("select", "fieldType");
          fieldType.innerHTML = `
            <option value='Email'>Email</option>
            <option value='ID'>ID</option>
            <option value='Name'>Name</option>
            <option value='Password'>Password</option>
            <option value='Phone'>Phone</option>
            <option value='Token'>Token</option>
            <option value='Username'>Username</option>
            <option value='Website'>Website</option>
          `;

          let newFieldText = createElement("input", {
            type: "text",
            placeholder: "Field Value...",
          });
          newFieldText.addEventListener("paste", function (e) {
            e.preventDefault();
            var text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          });
          newFieldText.onkeydown = function (e) {
            if (e.code == "Enter") {
              newAccountField(l, i, fieldType.value, newFieldText.value);
              console.log(l);
              listEdited(l);
            }
          };
          newFieldText.spellcheck = settings.spellcheck;

          let accountType = create("select", "account");
          accountType.innerHTML = `
          <option value=''>None</option>
          <option value='education'>Education</option>
          <option value='email'>Email</option>
          <option value='entertainment'>Entertainment</option>
          <option value='game'>Game</option>
          <option value='music'>Music</option>
          <option value='shopping'>Shopping</option>
          <option value='socialmedia'>Social Media</option>
          `;

          accountType.oninput = function () {
            list["children"][l]["children"][i]["type"] = this.value;
            if (list["children"][l]["children"][i]["type"] != "") {
              // not none
              accountIcon.style.display = null;
              accountIcon.src =
                accountTypeIconMap[list["children"][l]["children"][i]["type"]];
            } else {
              accountIcon.style.display = "none";
            }
            writeJSON(list);
          };

          accountType.value = list["children"][l]["children"][i]["type"];

          let accountTypeIconMap = {
            education: "../assets/accountTypeIcons/book.svg",
            shopping: "../assets/accountTypeIcons/shopping.svg",
            music: "../assets/accountTypeIcons/music.svg",
            socialmedia: "../assets/accountTypeIcons/message.svg",
            entertainment: "../assets/accountTypeIcons/film.svg",
            game: "../assets/accountTypeIcons/controller.svg",
            email: "../assets/accountTypeIcons/mail.svg",
          };

          accountType.style.marginTop = "4px";
          fieldType.style.transform = "translateY(-6px)";
          accountSettingsDiv.append(fieldType);
          accountSettingsDiv.append(newFieldText);
          accountSettingsDiv.append(saveAccountChangesBtn);
          accountSettingsDiv.append(deleteAccountBtn);

          let accountIcon = create("img", "");
          if (list["children"][l]["children"][i]["type"] != "") {
            // not none
            accountIcon.src =
              accountTypeIconMap[list["children"][l]["children"][i]["type"]];
          } else {
            accountIcon.style.display = "none";
          }

          accountDiv.append(accountIcon);
          accountDiv.append(accountTitle);
          accountDiv.append(collapseIcon);
          accountDiv.append(openAccountSettingsBtn);

          for (
            let e = 0;
            e < list["children"][l]["children"][i]["fields"].length;
            e++
          ) {
            // each field
            let fieldIcon = create("img", "");

            fieldIcon.src =
              "../assets/accountFieldIcons/" +
              fieldIcons[
                list["children"][l]["children"][i]["fields"][e]["title"]
              ];

            let fieldText = createElement("p", {
              class: "text",
              spellcheck: "false",
            });

            let fieldTitle = create("p", "title");
            fieldTitle.innerHTML =
              list["children"][l]["children"][i]["fields"][e]["title"] +
              ":&nbsp;";

            editableOnEdit.push(fieldText);
            if (
              list["children"][l]["children"][i]["fields"][e].title ==
                "Password" ||
              list["children"][l]["children"][i]["fields"][e].title == "Token"
            ) {
              // if is password or token, blur it
              fieldText.classList.add("blur");
            }
            fieldText.innerHTML =
              list["children"][l]["children"][i]["fields"][e]["value"];
            let fteTemp = "";
            fieldText.onfocus = function () {
              fteTemp = this.innerHTML;
            };
            fieldText.onblur = function () {
              if (this.innerHTML != fteTemp) {
                list["children"][l]["children"][i]["fields"][e]["value"] =
                  this.innerHTML;
                listEdited(l);
              }
            };
            fieldText.onkeydown = function (e) {
              if (e.code == "Enter") {
                this.blur();
              }
            };

            let deleteFieldRowBtn = createElement("button", {
              hide: false,
              class: "deleteFieldBtn",
            });
            deleteFieldRowBtn.onclick = function () {
              deleteAccountField(l, i, e);
              listEdited(l);
            };

            // appends

            let accountFieldRow = createElement("tr", {});

            let iconTd = createElement("td", {});
            iconTd.append(fieldIcon);

            let textTd = createElement("td", {});
            textTd.append(fieldText);

            let titleTd = createElement("td", { class: "titleTD" });
            titleTd.append(fieldTitle);

            let deleteFieldRowTd = createElement("td", {
              class: "deleteFieldTd",
              hide: true,
            });
            showOnEdit.push(deleteFieldRowTd);
            deleteFieldRowTd.append(deleteFieldRowBtn);

            accountFieldRow.append(iconTd);
            accountFieldRow.append(titleTd);
            accountFieldRow.append(textTd);
            accountFieldRow.append(deleteFieldRowTd);

            accountFields.append(accountFieldRow);
          }

          openAccountSettingsBtn.onclick = function () {
            // show settings
            accountSettingsDiv.style.display = null;
            this.style.display = "none";

            // set open account settings variable [list, account]
            openedAccountSettings = [l, i];

            // show fields
            accountFields.style.display = null;

            collapseIcon.classList.remove("up");
            collapseIcon.classList.add("down");

            // show all tagged items
            for (let k = 0; k < showOnEdit.length; k++) {
              showOnEdit[k].style.display = null;
            }

            // make elements editable
            for (let k = 0; k < editableOnEdit.length; k++) {
              editableOnEdit[k].contentEditable = true;
              editableOnEdit[k].style.filter = "none";
            }
            accountTitle.style.cursor = "text";
          };

          if (openedAccountSettings[0] == l && openedAccountSettings[1] == i) {
            openAccountSettingsBtn.click();
          }
          accountDiv.append(accountFields);
          accountDiv.append(accountSettingsDiv);
          accountsDiv.append(accountDiv);
        }
        let accountCount = create("p", "bottomCounter");

        searchBox.oninput = function () {
          // do search
          let accts = 0;
          for (let k = 0; k < list["children"][l]["children"].length; k++) {
            listWrapper.querySelectorAll(".accountDiv")[k].style.display =
              "none";
            if (
              list["children"][l]["children"][k]["name"]
                .toLowerCase()
                .includes(this.value.toLowerCase())
            ) {
              listWrapper.querySelectorAll(".accountDiv")[k].style.display =
                null;
              accts += 1;
            }
          }
          if (this.value == "") {
            accountCount.innerHTML =
              list["children"][l]["children"].length +
              (list["children"][l]["children"].length == 1
                ? " Account"
                : " Accounts");
          } else {
            accountCount.innerHTML =
              accts +
              (accts == 1 ? " Matching Account" : " Matching Accounts") +
              "<br>" +
              list["children"][l]["children"].length +
              (list["children"][l]["children"].length == 1
                ? " Account Total"
                : " Accounts Total");
          }
        };

        accountCount.innerHTML =
          list["children"][l]["children"].length +
          (list["children"][l]["children"].length == 1
            ? " Account"
            : " Accounts");
        listWrapper.append(accountsDiv);
        listWrapper.append(accountCount);
        listContainer.append(listWrapper);
        lists.append(listContainer);
      }
    }

    if (selectedList == -1) {
      // no list selected page
      // will show when you delete a list and when you first open the app
      document.getElementById("settings").style.display = "none";
      document.getElementById("noListSelected").style.display = null;
      for (
        let p = 0;
        p < document.getElementsByClassName("sidenavBtn").length;
        p++
      ) {
        document
          .getElementsByClassName("sidenavBtn")
          [p].classList.remove("active");
      }
      for (
        let k = 0;
        k < document.getElementsByClassName("listContainer").length;
        k++
      ) {
        document.getElementsByClassName("listContainer")[k].style.display = "none";
      }
      document.getElementById("app").style.display = "block";
    } else {
      document.getElementById("noListSelected").style.display = "none";
      try {
        document.getElementsByClassName("sidenavBtn")[selectedList].click();
      } catch (err) {
        console.warn(err);
      }
    }
  } catch (err) {
    // this will throw an error because it receives settings and list asynchronously
  }
}

init();
