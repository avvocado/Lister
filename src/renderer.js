
// event listeners
document.getElementById("closeBtn").addEventListener("click", function () {
  window.api.send('close', '');
});

document.getElementById("password").addEventListener("blur", function () {
  if (settings['password'] != this.value) {
    // if the password actually changed
    writeSettings(settings)
    settings['password'] = this.value
  }
});

document.getElementById("password").addEventListener("keydown", function (e) {
  if (e.code == 'Enter') {
    this.blur()
  }
});

document.getElementById("minimizeBtn").addEventListener("click", function () {
  window.api.send('minimize', '');
});

document.getElementById("newListBtn").addEventListener("click", function () {
  let type = document.getElementById('listType').value
  showAlert('Created New List', + 2000, "success")
  newList(type)
});

document.getElementById("openResourcesFolderBtn").addEventListener("click", function () {
  window.api.send('openPath', 'list.json');
});

document.getElementById('alwaysOnTopCheckbox').addEventListener('input', function () {
  settings['alwaysOnTop'] = this.checked
  window.api.send('alwaysOnTop', this.checked);
  writeSettings(settings)
});
document.getElementById('bwtrayiconCheckbox').addEventListener('input', function () {
  settings['bwTrayIcon'] = this.checked
  window.api.send('trayIcon', this.checked);
  writeSettings(settings)
});

document.getElementById("settingsBtn").addEventListener("click", function () {

  for (let p = 0; p < document.getElementsByClassName('sideListBtn').length; p++) {
    document.getElementsByClassName('sideListBtn')[p].classList.remove('active')
  }
  this.classList.add('active')
  for (let k = 0; k < document.getElementsByClassName('listDiv').length; k++) {
    document.getElementsByClassName('listDiv')[k].style.display = 'none'
  }
  document.getElementById('noListSelected').style.display = 'none'

  document.getElementById('settings').style.display = null

  selectedList = -1

});

// globals

var selectedList = -2
const months = ['January', "February", 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
var currImgIndex = [0, 0, 0]
var list
var settings


function init() {

  // request the json
  // uses toMain, which sends data to the main process
  window.api.send('requestList', '');
  window.api.send('requestSettings', '');
  window.api.send('requestDirname', '');
  // wait for main to send back the json
}

// receiving info from main process
window.api.receive("toRenderer", (args, data) => {
  if (args == 'list') {
    // list json
    list = data
    generateList()
  }

  if (args == 'settings') {
    // settings json
    settings = data

    // load settings
    document.getElementById('alwaysOnTopCheckbox').checked = settings['alwaysOnTop']
    window.api.send('alwaysOnTop', settings['alwaysOnTop']);

    document.getElementById('bwtrayiconCheckbox').checked = settings['bwTrayIcon']
    window.api.send('trayIcon', settings['bwTrayIcon']);

    document.getElementById('password').value = settings['password']

  }
  if (args == 'media') {
    // data is an array of media names
    list[currImgIndex[0]][currImgIndex[1]][currImgIndex[2]]['media'].push(data)
    writeJSON(list)
    generateList()
  }
  if (args == 'dirname') {
    dirname = data
  }
  console.log('Received [' + data + '] from main process');

});

function writeJSON(data) {
  window.api.send('writeJSON', JSON.stringify(data))
  console.log('wrote list.json file')
}

function generateList() {
  let d = new Date()

  document.getElementById('listBtns').innerHTML = ''

  let lists = document.getElementById('lists')
  lists.innerHTML = ''

  for (let l = 0; l < Object.keys(list).length; l++) {
    let tdate = new Date(list[l]['creationDate'])
    let edate = new Date(list[l]['lastEdited'])

    // for each list
    let lockedDiv
    let sideListBtn
    // list content div
    let listDiv = create('div', 'listDiv')
    let listContent = create('div', 'listContent')

    let pswd
    if (list[l]['locked'] == true) {
      let lockedTitle = create('p', 'lockedTitle')
      lockedTitle.innerHTML = 'This List is Locked.'
      listDiv.classList.add('locked')
      listContent.style.display = 'none'
      lockedDiv = create('div', 'lockedDiv')
      pswd = create('input', 'pswdInput')
      pswd.type = 'password'
      let pswdSubmit = create('button', 'pswdSubmit')
      pswdSubmit.onclick = function () {
        if (pswd.value == settings['password']) {
          // correct password
          pswd.value = ''
          lockedDiv.style.display = 'none'
          listContent.style.display = ''
          listContent.style.animation = 'fadein 1000ms'
          sideListBtn.innerHTML = list[l]['name']
          sideListBtn.classList.remove('locked')
          sideListBtn.classList.add('unlocked')
        } else {
          // incorrect password
          pswd.select()
          showAlert('Incorrect Password', 2000, 'error')
        }
      }
      pswd.onkeydown = function (e) {
        if (e.code == 'Enter') {
          pswdSubmit.click()
        }
      }
      pswd.placeholder = 'Password'
      lockedDiv.append(lockedTitle)

      lockedDiv.append(pswd)
      lockedDiv.append(pswdSubmit)
      listDiv.append(lockedDiv)
    }


    // list title
    let listTitle = create('input', 'listTitle')
    listTitle.type = 'text'
    let ltTemp = ''
    listTitle.onkeydown = function (e) {
      if (e.code == 'Enter') {
        this.blur()
      }
    }
    listTitle.onfocus = function () {
      ltTemp = this.value
    }
    listTitle.onblur = function () {
      if (this.value != ltTemp) {
        d = new Date()
        list[l]['lastEdited'] = d.getTime()
        list[l]['name'] = this.value
        writeJSON(list)
        generateList()
      }
    }
    listTitle.value = list[l]['name']

    sideListBtn = create('button', 'sideListBtn ')
    if (list[l]['locked'] == true) {
      sideListBtn.classList.add('locked')
      sideListBtn.innerHTML = "Locked List"
    } else {
      sideListBtn.innerHTML = list[l]['name']
    }
    sideListBtn.classList.add(list[l]['type'])
    let lastEdited
    sideListBtn.onclick = function () {

      console.log('going to list: ' + l + ', coming from: ' + selectedList)

      this.classList.add('active')

      if (selectedList != -2) {
        // if you arent coming from nolistselected
        // because settings is a sidelistbtn, +1
        if (l != selectedList) {
          document.getElementsByClassName('sideListBtn')[selectedList + 1].classList.remove('active')
        }

        // update last edited
        let d = new Date()
        lastEdited.innerHTML = "Edited: " + (timeAgo(d.getTime(), list[l]['lastEdited']))

        // settings does not have a list div, no +1
        for (let h = 0; h < document.querySelectorAll('.listDiv').length; h++) {
          document.querySelectorAll('.listDiv')[h].style.display = 'none'
        }
      }

      // hide settings and nolistselected pages
      document.getElementById('settings').style.display = 'none'
      document.getElementById('noListSelected').style.display = 'none'


      // show list div
      document.querySelectorAll('.listDiv')[l].style.display = null

      if (list[l]['locked'] == true) {
        // if you're entering a locked list, relock it
        if (selectedList != l) {
          lockedDiv.style.display = 'block'
          listContent.style.display = 'none'
          pswd.focus()
        }
        // you're going to the same list & its unlocked, bypass the lock
        console.log(lockedDiv.style.display)
        if (l == selectedList && lockedDiv.style.display != 'block') {
          console.log('bypassed lock')
          lockedDiv.style.display = 'none'
          listContent.style.display = null
          sideListBtn.innerHTML = list[l]['name']
          sideListBtn.classList.remove('locked')
          sideListBtn.classList.add('unlocked')
        }

      }
      try {
        if (selectedList >= 0 && list[selectedList]['locked'] == true && selectedList != l) {
          // leaving a locked list, just change the title of sidelist btn to locked list
          document.querySelectorAll('.sideListBtn')[selectedList + 1].innerHTML = 'Locked List'
          document.querySelectorAll('.sideListBtn')[selectedList + 1].classList.remove('unlocked')
          document.querySelectorAll('.sideListBtn')[selectedList + 1].classList.add('locked')
          document.querySelectorAll('.listDiv')[selectedList].children[0].children[1].value = ''
          //                         .listDiv                .lockedDiv  .pswdInput
        }
      } catch {
        // catch the err when you delete a list
        console.log('deleted a list')
      }

      selectedList = l
    }

    // list settings, creation date, last edit + buttons
    let listSettingsDiv = create('div', 'listSettingsDiv')
    let listCreationDate = create('p', 'listDate')
    listCreationDate.title = months[tdate.getMonth()] + ' ' + tdate.getDate() + ", " + (tdate.getHours() % 12 || 12) + ":" + tdate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(tdate)
    listCreationDate.innerHTML = "Created: " + (timeAgo(d.getTime(), list[l]['creationDate']))
    lastEdited = create('p', 'listDate')

    if (list[l]['lastEdited'] != 0) {
      lastEdited.title = months[edate.getMonth()] + ' ' + edate.getDate() + ", " + (edate.getHours() % 12 || 12) + ":" + edate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(edate)
      lastEdited.innerHTML = "Edited: " + (timeAgo(d.getTime(), list[l]['lastEdited']))
      lastEdited.style.marginRight = '16px'
      lastEdited.onclick = function () {
        let d = new Date()
        lastEdited.title = months[edate.getMonth()] + ' ' + edate.getDate() + ", " + (edate.getHours() % 12 || 12) + ":" + edate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(edate)
        lastEdited.innerHTML = "Edited: " + (timeAgo(d.getTime(), list[l]['lastEdited']))
      }
      listSettingsDiv.append(lastEdited)
    }

    let deleteListBtnDiv = create('div', '')
    let deleteListBtnTooltip = createTooltip('Delete List', 38, false)

    let deleteListBtn = create('button', 'deleteListBtn')
    deleteListBtn.onclick = function () {
      showAlert('Deleted "' + list[l]['name'] + '"', + 2000, "success")
      removeList(l)
    }
    deleteListBtn = handleTooltip(deleteListBtn, deleteListBtnTooltip)
    deleteListBtnDiv.append(deleteListBtnTooltip)
    deleteListBtnDiv.append(deleteListBtn)

    listSettingsDiv.append(listCreationDate)
    listSettingsDiv.append(deleteListBtnDiv)

    if (list[l]['locked'] == false) {
      // not locked yet
      let lockListBtnDiv = create('div', '')
      let lockListBtnTooltip = createTooltip('Lock List', 16, false)

      let lockListBtn = create('button', 'lockListBtn')
      lockListBtn.onclick = function () {
        list[l]['locked'] = true
        writeJSON(list)
        generateList()
      }
      lockListBtn = handleTooltip(lockListBtn, lockListBtnTooltip)
      lockListBtnDiv.append(lockListBtnTooltip)
      lockListBtnDiv.append(lockListBtn)
      listSettingsDiv.append(lockListBtnDiv)
    } else {
      // already locked
      let unlockListBtnDiv = create('div', '')
      let unlockListBtnTooltip = createTooltip('Unlock List', 18, false)

      let unlockListBtn = create('button', 'unlockListBtn')
      unlockListBtn.onclick = function () {
        list[l]['locked'] = false
        writeJSON(list)
        generateList()
      }
      unlockListBtn = handleTooltip(unlockListBtn, unlockListBtnTooltip)
      unlockListBtnDiv.append(unlockListBtnTooltip)
      unlockListBtnDiv.append(unlockListBtn)
      listSettingsDiv.append(unlockListBtnDiv)
    }
    listContent.append(listSettingsDiv)


    document.getElementById('listBtns').append(sideListBtn)
    listContent.append(listTitle)

    if (list[l]['type'] == 'block') {
      listDiv.classList.add('block')
      listContent.classList.add('block')

      // NEW SUBLIST BUTTON
      let newSublistBtnDiv = create('div', '')
      let newSublistBtnTooltip = createTooltip('New Sublist', 22, false)

      let newSublistBtn = create('button', 'newSublistBtn')
      newSublistBtn.onclick = function () {
        newSublist(l)
        writeJSON(list)
        generateList()
      }
      newSublistBtn = handleTooltip(newSublistBtn, newSublistBtnTooltip)
      newSublistBtnDiv.append(newSublistBtnTooltip)
      newSublistBtnDiv.append(newSublistBtn)
      listSettingsDiv.append(newSublistBtnDiv)

      let sublists = create('div', 'mainListContent block')
      for (let i = 0; i < list[l]['children'].length; i++) {
        // FOR_EACH_SUBLIST

        let sublistDiv = create('div', 'sublistDiv')
        let sublistContentDiv = document.createElement('div')

        let sublistTitleDiv = create('div', 'sublistTitleDiv')
        let collapseSublistBtn = create('button', 'collapseSublistBtn down')
        collapseSublistBtn.onclick = function () {
          if (sublistContentDiv.style.display == 'none') {
            sublistContentDiv.style.display = null
            this.classList.remove('up')
            this.classList.add('down')
          } else {
            sublistContentDiv.style.display = 'none'
            this.classList.remove('down')
            this.classList.add('up')
          }
        }

        let deleteSublistBtn = create('button', 'delSublistBtn')
        deleteSublistBtn.onclick = function () {
          deleteSublist(l, i)
        }

        let newItemToTopBtn = create('button', 'newItemToTopBtn')
        newItemToTopBtn.onclick = function () {
          d = new Date()
          list[l]['lastEdited'] = d.getTime()
          newItemToTop(l, i)
        }
        let sublistTitleP = document.createElement('input')

        sublistTitleP.value = list[l]['children'][i]['name']
        sublistTitleP.type = 'text'
        sublistTitleP.spellcheck = false
        sublistTitleP.onkeydown = function (e) {
          if (e.code == 'Enter') {
            this.blur()
          }
        }
        sublistTitleP.oninput = function () {
          this.value = this.value.toUpperCase()
        }
        // only update list and writejson if it actually changed
        let stpTemp = ''
        sublistTitleP.onfocus = function () {
          stpTemp = this.value
        }
        sublistTitleP.onblur = function () {
          if (this.value != stpTemp) {
            d = new Date()
            list[l]['lastEdited'] = d.getTime()
            list[l]['children'][i]['name'] = this.value
            writeJSON(list)
          }

        }
        sublistTitleDiv.append(deleteSublistBtn)

        sublistTitleDiv.append(collapseSublistBtn)
        sublistTitleDiv.append(newItemToTopBtn)
        sublistTitleDiv.append(sublistTitleP)


        sublistDiv.append(sublistTitleDiv)
        sublistDiv.append(sublistContentDiv)
        sublists.append(sublistDiv)
        listContent.append(sublists)
        listDiv.append(listContent)

        // FOR_EVERY_ITEM
        for (let e = 0; e < list[l]['children'][i]['children'].length; e++) {
          console.log(list[l]['children'][i]['children'][e])
          // -1 because "name" is a key
          let itemSettingsDiv = document.createElement('div')

          let itemDiv = document.createElement('div')
          itemDiv.className = 'item'
          if (list[l]['children'][i]['children'][e]['starred'] == true) {
            itemDiv.classList.add('starred')
          }
          // status button
          button = document.createElement('button')
          button.classList = 'statusBtn'

          button.onmouseup = function (event) {
            if (event.button == 2) {
              // right click
              // if is complete, skip down to incomplete,
              // otherwise just cycle down like normal
              if (list[l]['children'][i]['children'][e]['status'] == 3) {
                list[l]['children'][i]['children'][e]['status'] = 1
                writeJSON(list)
              } else if (list[l]['children'][i]['children'][e]['status'] > 0) {
                list[l]['children'][i]['children'][e]['status'] -= 1
                writeJSON(list)
              }

            } else if (event.button == 0) {
              // left click, cycle up
              if (list[l]['children'][i]['children'][e]['status'] < 3) {
                list[l]['children'][i]['children'][e]['status'] += 1
                writeJSON(list)
                if (list[l]['children'][i]['children'][e]['status'] == 3 && list[l]['children'][i]['children'][e]['starred'] == false) {
                  // completed
                  let temp = list[l]['children'][i]['children'][e]
                  removeItem(l, i, e)
                  currentKeys = Object.keys(list[l]['children'][i]).length - 1
                  list[l]['children'][i][currentKeys] = temp// + 1 to add next index
                  writeJSON(list)
                  generateList()

                }
              }

            }
            this.className = 'statusBtn'


            this.classList.add("s" + (list[l]['children'][i]['children'][e]['status']).toString())
            this.parentElement.className = 'item'
            this.parentElement.classList.add(("s" + (list[l]['children'][i]['children'][e]['status']).toString()))
          }

          button.classList.add("s" + (list[l]['children'][i]['children'][e]['status']).toString());
          itemDiv.classList.add(("s" + (list[l]['children'][i]['children'][e]['status']).toString()));
          // ! itemDiv.append(button)

          // ITEM_TITLE
          let itemTitle = document.createElement('p')
          itemTitle.contentEditable = true
          itemTitle.innerHTML = list[l]['children'][i]['children'][e]['title']
          itemTitle.className = 'title'
          itemTitle.spellcheck = false
          let itTemp = ''
          itemTitle.onfocus = function () {
            itTemp = this.innerHTML
          }
          itemTitle.onblur = function () {
            if (this.innerHTML != itTemp) {
              d = new Date()
              list[l]['lastEdited'] = d.getTime()
              list[l]['children'][i]['children'][e]['title'] = this.innerHTML
              writeJSON(list)
            }
          }
          itemDiv.append(itemTitle)

          // ITEM_SETTINGS_BUTTON
          let moreBtn = document.createElement('button')
          moreBtn.className = 'moreBtn'
          moreBtn.onclick = function () {
            if (itemSettingsDiv.style.display == 'none') {
              itemSettingsDiv.style.display = 'block'
              itemDiv.style.paddingBottom = '2px'
            } else {
              itemSettingsDiv.style.display = 'none'
              itemDiv.style.paddingBottom = null
            }
          }
          itemDiv.append(moreBtn)

          let delMediaBtnDiv

          // ITEM_MEDIA
          if (list[l]['children'][i]['children'][e]['media'] != null && list[l]['children'][i]['children'][e]['media'] != '' && list[l]['children'][i]['children'][e]['media'] != []) {
            // if there is an media media specified
            for (let p = 0; p < list[l]['children'][i]['children'][e]['media'].length; p++) {
              // for every piece of media
              if (list[l]['children'][i]['children'][e]['media'][p].endsWith("png") || list[l]['children'][i]['children'][e]['media'][p].endsWith("jpg") || list[l]['children'][i]['children'][e]['media'][p].endsWith("jpeg") || list[l]['children'][i]['children'][e]['media'][p].endsWith("gif") || list[l]['children'][i]['children'][e]['media'][p].endsWith("webp")) {
                // if is .png .jpg .jpeg .gif .webp
                // make image
                let img = document.createElement('img')
                img.className = 'itemMedia'
                img.src = "../resources/media/" + list[l]['children'][i]['children'][e]['media'][p]
                img.alt = 'Error loading ' + list[l]['children'][i]['children'][e]['media'][p]
                if (typeof dirname === 'undefined') {
                  dirname = ''
                  console.log('dirname error')
                }
                img.title = dirname + 'resources/media/' + list[l]['children'][i]['children'][e]['media']
                img.addEventListener("dblclick", function () {
                  window.api.send('openFile', list[l]['children'][i]['children'][e]['media'][p]);
                });
                img.style.cursor = 'pointer'
                itemDiv.append(img)
              } else if (list[l]['children'][i]['children'][e]['media'][p].endsWith(".mp4") || list[l]['children'][i]['children'][e]['media'][p].endsWith(".webm")) {
                // if is .mp4 .webm 
                // make video
                let vid = document.createElement('video')
                vid.className = 'itemMedia'
                vid.controls = true
                vid.disablePictureInPicture = true
                vid.controlsList = "nodownload noremoteplayback noplaybackrate"
                vid.src = "../resources/media/" + list[l]['children'][i]['children'][e]['media'][p]
                vid.alt = 'Error loading ' + list[l]['children'][i]['children'][e]['media'][p]
                vid.title = list[l]['children'][i]['children'][e]['media'][p]
                itemDiv.append(vid)
              } else if (list[l]['children'][i]['children'][e]['media'][p].endsWith(".ogg") || list[l]['children'][i]['children'][e]['media'][p].endsWith(".wav") || list[l]['children'][i]['children'][e]['media'][p].endsWith(".mp3")) {
                // if is .ogg .wav .mp3
                // make audio 
                let aud = document.createElement('audio')
                aud.controls = true
                aud.className = 'itemMedia'
                aud.src = "../resources/media/" + list[l]['children'][i]['children'][e]['media'][p]
                itemDiv.append(aud)
              }
            }

            // DELETE_MEDIA_BUTTON
            delMediaBtnDiv = document.createElement('div')
            let delMediaBtnTooltip = createTooltip('Delete All Media', 36, true)
            let delMediaBtn = document.createElement('button')
            delMediaBtn.className = 'delMediaBtn'
            delMediaBtn = handleTooltip(delMediaBtn, delMediaBtnTooltip)
            delMediaBtn.onclick = function () {
              list[l]['children'][i]['children'][e]['media'] = []
              writeJSON(list)
              generateList()
            }
            delMediaBtnDiv.append(delMediaBtnTooltip)
            delMediaBtnDiv.append(delMediaBtn)
          }

          // ITEM DESCRIPTION
          // ADD_ITEM_DESCRIPTION_BUTTON
          let addDescBtnDiv = document.createElement('div')
          let addDescBtn = document.createElement('button')
          addDescBtn.className = 'addDescBtn'
          addDescBtnDiv.style.display = 'none'
          let addDescBtnTooltip = createTooltip('Add Description', 36, true)
          addDescBtn.onclick = function () {
            itemDescription.style.display = 'block'
            addDescBtnDiv.style.display = 'none'
            itemDescription.focus()
          }
          addDescBtn = handleTooltip(addDescBtn, addDescBtnTooltip)
          addDescBtnDiv.append(addDescBtnTooltip)
          addDescBtnDiv.append(addDescBtn)

          // ITEM_starred_BUTTON
          let setStarredBtnDiv = document.createElement('div')
          let setStarredBtn = document.createElement('button')
          let setStarredBtnTooltip

          if (list[l]['children'][i]['children'][e]['starred'] == true) {
            setStarredBtn.className = 'setStarredBtn active'
            setStarredBtnTooltip = createTooltip('Unstar', 14, true)
          } else {
            setStarredBtn.className = 'setStarredBtn'
            setStarredBtnTooltip = createTooltip('Star', 8, true)
          }
          setStarredBtn.onclick = function () {
            // edit list
            list[l]['children'][i]['children'][e].starred = !list[l]['children'][i]['children'][e].starred
            if (list[l]['children'][i]['children'][e].starred == true) {
              sendItemToTop(l, i, e)
            }
            writeJSON(list)
            generateList()

          }
          setStarredBtn = handleTooltip(setStarredBtn, setStarredBtnTooltip)
          setStarredBtnDiv.append(setStarredBtnTooltip)
          setStarredBtnDiv.append(setStarredBtn)

          // ITEM_DESCRIPTION
          let itemDescription = document.createElement('p')
          itemDescription.placeholder = 'Description...'
          itemDescription.contentEditable = true
          itemDescription.innerHTML = list[l]['children'][i]['children'][e]['description']
          itemDescription.className = 'description'
          itemDescription.spellcheck = false
          let idTemp = ''
          itemDescription.onfocus = function () {
            idTemp = this.innerHTML
          }
          itemDescription.onblur = function () {
            if (this.innerHTML != idTemp) {
              d = new Date()
              list[l]['lastEdited'] = d.getTime()
              list[l]['children'][i]['children'][e]['description'] = this.innerHTML
              writeJSON(list)
              if (this.innerHTML.replaceAll(" ", '').replaceAll("\\n", '').replaceAll('<br>', '') == '') {
                this.style.display = 'none'
                addDescBtnDiv.style.display = 'inline-block'
              }
            }
          }

          if (itemDescription.innerHTML.replaceAll(" ", '').replaceAll("\n", '').replaceAll('<br>', '') == '') {
            itemDescription.style.display = 'none'
            addDescBtnDiv.style.display = 'inline-block'
          }
          itemDiv.append(itemDescription)

          // ITEM_LINK
          if (list[l]['children'][i]['children'][e]['link'] != '' && list[l]['children'][i]['children'][e]['link'] != null) {
            let linkDiv = create('div', '')
            linkDiv.style.marginTop = '-8px'
            let openLinkBtn = create('button', 'openLinkBtn')
            openLinkBtn.title = ('https://' + list[l]['children'][i]['children'][e]['link'])
            openLinkBtn.onclick = function () {
              window.open(list[l]['children'][i]['children'][e]['link'], '_blank')
            }
            let link = create('a', 'itemLink')
            link.title = ('https://' + list[l]['children'][i]['children'][e]['link'])
            link.href = 'https://' + list[l]['children'][i]['children'][e]['link']
            link.target = '_blank'
            link.innerHTML = list[l]['children'][i]['children'][e]['link']
            linkDiv.append(link)
            linkDiv.append(openLinkBtn)
            itemDiv.append(linkDiv)
          }

          // ITEM_CREATION_DATE
          let cdate = new Date(list[l]['children'][i]['children'][e]['creationDate'])
          let creationDateP = create('p', 'creationDateText')
          creationDateP.title = months[cdate.getMonth()] + ' ' + cdate.getDate() + ", " + (cdate.getHours() % 12 || 12) + ":" + cdate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(cdate)

          creationDateP.innerHTML = (timeAgo(d.getTime(), list[l]['children'][i]['children'][e]['creationDate']))

          // ITEM_SETTINGS_DIV
          itemSettingsDiv.style.display = 'none'
          itemSettingsDiv.className = 'itemSettingsDiv'

          // DUPLICATE_ITEM_BUTTON_
          let duplicateItemBtnDiv = create('div', '')
          let duplicateItemBtn = create('button', 'duplicateItemBtn')
          let duplicateItemBtnTooltip = createTooltip('Duplicate Item', 32, true)
          duplicateItemBtn = handleTooltip(duplicateItemBtn, duplicateItemBtnTooltip)
          duplicateItemBtn.onclick = function () {
            list[l]['children'][i]['children'].splice(e, 0, list[l]['children'][i]['children'][e])
            writeJSON(list)
            generateList()
          }
          duplicateItemBtnDiv.append(duplicateItemBtnTooltip)
          duplicateItemBtnDiv.append(duplicateItemBtn)

          // ADD_LINK_BUTTON_
          let addLinkBtnDiv = create('div', '')
          let addLinkBtn = create('button', 'addLinkBtn')
          let addLinkBtnTooltip = createTooltip('Add Link', 17, true)
          addLinkBtn = handleTooltip(addLinkBtn, addLinkBtnTooltip)
          let addLinkInput = create('input', 'addLinkInput')
          addLinkInput.placeholder = 'Link'
          addLinkInput.value = list[l]['children'][i]['children'][e]['link']
          addLinkInput.style.display = 'none'
          addLinkInput.onblur = function () {
            d = new Date()
            list[l]['lastEdited'] = d.getTime()
            this.value = (this.value).replaceAll(' ', '')
            list[l]['children'][i]['children'][e]['link'] = this.value.replaceAll('https://', '')
            writeJSON(list)
            generateList()
          }
          addLinkBtn.onclick = function () {
            if (addLinkInput.style.display == 'none') {
              addLinkInput.style.display = 'block'

            } else {
              addLinkInput.style.display = 'none'
            }
          }
          addLinkBtnDiv.append(addLinkBtnTooltip)
          addLinkBtnDiv.append(addLinkBtn)

          // ADD MEDIA BUTTON
          let mediaBtnDiv = document.createElement('div')
          let mediaBtn = create('button', 'uploadMediaBtn')
          let mediaBtnTooltip
          mediaBtnTooltip = createTooltip('Upload Media', 28, true)

          mediaBtn.onclick = function () {
            window.api.send("uploadMedia", '');
            // wait for main to send back the media name
            currImgIndex = [l, i, e]
          }
          mediaBtn = handleTooltip(mediaBtn, mediaBtnTooltip)
          mediaBtnDiv.append(mediaBtnTooltip)
          mediaBtnDiv.append(mediaBtn)

          // DELETE ITEM BUTTON
          let delItemBtn = document.createElement('button')
          delItemBtn.className = 'deleteItemBtn'
          let delItemBtnDiv = document.createElement('div')
          delItemBtnDiv.style.float = 'right'
          delItemBtnDiv.style.marginRight = '8px'
          let delItemBtnTooltip
          if (i == 2) {
            delItemBtnTooltip = createTooltip('Delete Item', 40, true)
            delItemBtnTooltip.style.whiteSpace = 'nowrap'
          } else {
            delItemBtnTooltip = createTooltip('Delete Item', 28, true)
          }
          delItemBtn.onclick = function () {
            d = new Date()
            list[l]['lastEdited'] = d.getTime()
            removeItem(l, i, e)
          }
          delItemBtn = handleTooltip(delItemBtn, delItemBtnTooltip)
          delItemBtnDiv.append(delItemBtnTooltip)
          delItemBtnDiv.append(delItemBtn)
          // add buttons to item settings
          itemSettingsDiv.append(mediaBtnDiv)

          if (list[l]['children'][i]['children'][e]['media'] != null && list[l]['children'][i]['children'][e]['media'] != '' && list[l]['children'][i]['children'][e]['media'] != []) {
            // if no media
            itemSettingsDiv.append(delMediaBtnDiv)
          }
          itemSettingsDiv.append(addLinkBtnDiv)
          itemSettingsDiv.append(addDescBtnDiv)
          itemSettingsDiv.append(setStarredBtnDiv)
          itemSettingsDiv.append(duplicateItemBtnDiv)
          itemSettingsDiv.append(delItemBtnDiv)
          // link input
          itemSettingsDiv.append(addLinkInput)
          // creation date
          itemSettingsDiv.append(creationDateP)
          itemDiv.append(itemSettingsDiv)
          sublistContentDiv.append(itemDiv)

        }
      }
      lists.append(listDiv)
    } else if (list[l]['type'] == 'text') {
      listDiv.classList.add('text')
      listContent.classList.add('text')
      let textDiv = create('div', 'mainListContent text')

      for (let a = 0; a < list[l]['children'].length; a++) {
        // all "blocks"
        let blockDiv = create('div', 'block')
        if (list[l]['children'][a]['type'] == 'text') {
          blockDiv.classList.add('text')
          let textBlockP = create('p', 'text')
          textBlockP.spellcheck = false
          let temp = ''
          textBlockP.onfocus = function () {
            temp = this.innerHTML
          }
          textBlockP.onblur = function () {
            if (this.innerHTML != temp) {
              d = new Date()
              list[l]['lastEdited'] = d.getTime()

              list[l]['children'][a]['data'] = this.innerHTML
              writeJSON(list)
            }
          }
          textBlockP.innerHTML = list[l]['children'][a]['data']
          textBlockP.contentEditable = true
          blockDiv.append(textBlockP)

        } else if (list[l]['children'][a]['type'] == 'code') {
          blockDiv.classList.add('code')
          let copyBtnDiv = create('div', 'copyBtnDiv')
          let codeBlockP = create('p', 'text')
          codeBlockP.spellcheck = false
          codeBlockP.onmouseenter = function () {
            copyBtnDiv.style.display = 'block'
          }
          blockDiv.onmouseleave = function () {
            copyBtnDiv.style.display = 'none'
          }
          let temp = ''
          codeBlockP.onfocus = function () {
            temp = this.innerHTML
          }
          codeBlockP.onblur = function () {
            if (this.innerHTML != temp) {
              d = new Date()
              list[l]['lastEdited'] = d.getTime()
              list[l]['children'][a]['data'] = this.innerHTML
              writeJSON(list)
            }
          }
          codeBlockP.innerHTML = list[l]['children'][a]['data']
          codeBlockP.contentEditable = true

          let deleteBlockBtnDiv = create('div', 'delBlockBtnDiv')
          let deleteBlockBtn = create('button', 'delBlockBtn')
          deleteBlockBtn.onclick = function () {
            deleteBlock(l, a)
          }
          let deleteBlockBtnTooltip = createTooltip('Delete Block', 54, true)
          deleteBlockBtn = handleTooltip(deleteBlockBtn, deleteBlockBtnTooltip)
          deleteBlockBtnDiv.append(deleteBlockBtnTooltip)
          deleteBlockBtnDiv.append(deleteBlockBtn)

          let copyBtn = create('button', 'copyBtn')
          copyBtnDiv.style.display = 'none'

          let copyBtnTooltip = createTooltip('Copy', 10, true)
          copyBtn = handleTooltip(copyBtn, copyBtnTooltip)
          copyBtn.onclick = function () {
            codeBlockP.style.animation = 'flash 500ms'
            navigator.clipboard.writeText(list[l]['children'][a]['data']).then(function () {
              // success
            }, function (err) {
              console.error('Async: Could not copy text: ', err);
            });
            setTimeout(function () {
              codeBlockP.style.animation = ''

            }, 500);
          }
          copyBtnDiv.append(copyBtnTooltip)
          copyBtnDiv.append(copyBtn)

          let blockSettingsDiv = create('div', 'blockSettingsDiv')
          blockSettingsDiv.append(deleteBlockBtnDiv)
          blockDiv.append(copyBtnDiv)
          blockDiv.append(blockSettingsDiv)
          blockDiv.append(codeBlockP)
        } else if (list[l]['children'][a]['tyoe'] == 'media') {

        }
        textDiv.append(blockDiv)

      }


      let newCodeBlockBtnDiv = create('div', '', '')
      let newCodeBlockBtn = create('button', 'newCodeBlockBtn', '')
      newCodeBlockBtnTooltip = createTooltip('New Code Block', 32, false)
      newCodeBlockBtn = handleTooltip(newCodeBlockBtn, newCodeBlockBtnTooltip)

      newCodeBlockBtn.onclick = function () {
        list[l]['children'].push({
          "data": "New Code Block",
          "type": "code"
        })
        list[l]['children'].push({
          "data": "",
          "type": "text"
        })
        writeJSON(list)
        generateList()
      }
      newCodeBlockBtnDiv.append(newCodeBlockBtnTooltip)
      newCodeBlockBtnDiv.append(newCodeBlockBtn)

      listSettingsDiv.append(newCodeBlockBtnDiv)

      listContent.append(textDiv)

      listDiv.append(listContent)
      lists.append(listDiv)
    }
  }

  if (selectedList == -2) {
    // no list selected page
    // will show when you delete a list and when you first open the app
    document.getElementById('settings').style.display = 'none'
    document.getElementById('noListSelected').style.display = null
    for (let p = 0; p < document.getElementsByClassName('sideListBtn').length; p++) {
      document.getElementsByClassName('sideListBtn')[p].classList.remove('active')
    }
    for (let k = 0; k < document.getElementsByClassName('listDiv').length; k++) {
      document.getElementsByClassName('listDiv')[k].style.display = 'none'
    }
    document.getElementById('app').style.display = 'block'
  } else {
    document.getElementById('noListSelected').style.display = 'none'
    document.getElementsByClassName('sideListBtn')[selectedList + 1].click()
  }
}

init()
