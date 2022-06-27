
// event listeners
document.getElementById("closeBtn").addEventListener("click", function () {
  window.api.send('close', '');
});

document.getElementById("toggleSideBtn").addEventListener("click", function () {
  if (document.querySelector('#side').style.display == 'none') {
    document.querySelector('#side').style.display = null
    document.querySelector('#menuBar').style.width = 'calc(100vw - 180px)'
    document.querySelector('#menuBar').style.marginLeft = '180px'
    document.querySelector('#content').style.marginLeft = '180px'
  } else {
    document.querySelector('#side').style.display = 'none'
    document.querySelector('#menuBar').style.width = '100vw'
    document.querySelector('#menuBar').style.margin = '0'
    document.querySelector('#content').style.margin = '0'
  }
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

document.getElementById("maximizeBtn").addEventListener("click", function () {
  window.api.send('maximize', '');
  console.log('maximize')
  this.className = !(this.className === 'true')
});

document.getElementById("newListBtn").addEventListener("click", function () {
  let type = document.getElementById('listType').value
  showAlert('Created New List', 1000, "success")
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
  if (args == 'openSettings') {
    document.querySelector('#settingsBtn').click()
  }
  console.log('Received [' + data + '] from main process');

});

function generateList() {
  let d = new Date()

  document.getElementById('listBtns').innerHTML = ''

  let lists = document.getElementById('lists')
  lists.innerHTML = ''

  for (let l = 0; l < list['children'].length; l++) {
    let tdate = new Date(list['children'][l]['creationDate'])
    let edate = new Date(list['children'][l]['lastEdited'])

    // for each list
    let lockedDiv
    let sideListBtn
    let sideListBtnText
    let sideListBtnDate
    // list content div
    let listDiv = create('div', 'listDiv')
    let listContent = create('div', 'listContent')

    let pswd
    if (list['children'][l]['locked'] == true) {
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
          sideListBtnText.innerHTML = list['children'][l]['name']
          sideListBtnDate.innerHTML = timeAgo(d.getTime(), edate)
          sideListBtn.classList.remove('locked')
          sideListBtn.classList.add('unlocked')
          showAlert('Correct Password!', 1000, 'success')
        } else {
          // incorrect password
          pswd.select()
          showAlert('Incorrect Password', 1000, 'error')
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
        list['children'][l]['name'] = this.value
        writeJSON(list)
        generateList()
        listEdited(l)
      }
    }
    listTitle.value = list['children'][l]['name']

    sideListBtn = create('div', 'sideListBtn ')
    sideListBtnText = create('p', 'title')
    sideListBtnDate = create('p', 'date')
    sideListBtn.append(sideListBtnText)
    sideListBtn.append(sideListBtnDate)


    if (list['children'][l]['locked'] == true) {
      sideListBtn.classList.add('locked')
      sideListBtnText.innerHTML = "Locked List"
      sideListBtnDate.innerHTML = '...'
    } else {
      sideListBtnText.innerHTML = list['children'][l]['name']
      sideListBtnDate.innerHTML = timeAgo(d.getTime(), edate)
    }
    sideListBtn.classList.add(list['children'][l]['type'])
    let lastEdited
    sideListBtn.onclick = function () {

      // console.log('going to list: ' + l + ', coming from: ' + selectedList)

      this.classList.add('active')

      if (selectedList != -2) {
        // if you arent coming from nolistselected
        // because settings is a sidelistbtn, +1
        if (l != selectedList) {
          document.getElementsByClassName('sideListBtn')[selectedList + 1].classList.remove('active')
        }
        document.querySelector('#settingsBtn').classList.remove('active')

        // update last edited
        let d = new Date()
        lastEdited.innerHTML = "Edited: " + (timeAgo(d.getTime(), list['children'][l]['lastEdited']))

        if (list['children'][l]['locked'] == false) {
          sideListBtnDate.innerHTML = timeAgo(d.getTime(), edate)
        }

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

      if (list['children'][l]['locked'] == true) {
        // if you're entering a locked list, relock it
        if (selectedList != l) {
          sideListBtn.classList.remove('unlocked')
          sideListBtn.classList.add('locked')
          lockedDiv.style.display = 'block'
          listContent.style.display = 'none'
          pswd.focus()
        }
        // you're going to the same list & its unlocked, bypass the lock
        if (l == selectedList && lockedDiv.style.display != 'block') {
          lockedDiv.style.display = 'none'
          listContent.style.display = null
          sideListBtnText.innerHTML = list['children'][l]['name']
          sideListBtnDate.innerHTML = timeAgo(d.getTime(), edate)
          sideListBtn.classList.remove('locked')
          sideListBtn.classList.add('unlocked')
        }
      }
      if (selectedList >= 0 && list['children'][selectedList]['locked'] == true && selectedList != l) {
        // leaving a locked list, just change the title of sidelist btn to locked list
        document.querySelectorAll('.sideListBtn .title')[selectedList].innerHTML = 'Locked List'
        document.querySelectorAll('.sideListBtn .date')[selectedList].innerHTML = '...'
        document.querySelectorAll('.sideListBtn')[selectedList + 1].classList.remove('unlocked')
        document.querySelectorAll('.sideListBtn')[selectedList + 1].classList.add('locked')
        document.querySelectorAll('.listDiv')[selectedList].children[0].children[1].value = ''
        //                         .listDiv                .lockedDiv  .pswdInput
      }
      selectedList = l
    }

    // list settings, creation date, last edit + buttons
    let listSettingsDiv = create('div', 'listSettingsDiv')
    let listCreationDate = create('p', 'listDate')
    listCreationDate.title = months[tdate.getMonth()] + ' ' + tdate.getDate() + ", " + (tdate.getHours() % 12 || 12) + ":" + tdate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(tdate)
    listCreationDate.innerHTML = "Created: " + (timeAgo(d.getTime(), list['children'][l]['creationDate']))
    lastEdited = create('p', 'listDate')

    if (list['children'][l]['lastEdited'] != 0) {
      lastEdited.title = months[edate.getMonth()] + ' ' + edate.getDate() + ", " + (edate.getHours() % 12 || 12) + ":" + edate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(edate)
      lastEdited.innerHTML = "Edited: " + (timeAgo(d.getTime(), list['children'][l]['lastEdited']))
      lastEdited.style.marginRight = '16px'
      listSettingsDiv.append(lastEdited)
    }

    let deleteListBtnDiv = create('div', '')
    let deleteListBtnTooltip = createTooltip('Delete List', 38, false)

    let deleteListBtn = create('button', 'deleteListBtn')
    deleteListBtn.onclick = function () {
      showAlert('Deleted "' + list['children'][l]['name'] + '"', + 1000, "success")
      removeList(l)
    }
    deleteListBtn = handleTooltip(deleteListBtn, deleteListBtnTooltip)
    deleteListBtnDiv.append(deleteListBtnTooltip)
    deleteListBtnDiv.append(deleteListBtn)

    listSettingsDiv.append(listCreationDate)
    listSettingsDiv.append(deleteListBtnDiv)

    if (list['children'][l]['locked'] == false) {
      // not locked yet
      let lockListBtnDiv = create('div', '')
      let lockListBtnTooltip = createTooltip('Lock List', 16, false)

      let lockListBtn = create('button', 'lockListBtn')
      lockListBtn.onclick = function () {
        list['children'][l]['locked'] = true
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
      let unlockListBtnTooltip = createTooltip('Remove Lock', 26, false)

      let unlockListBtn = create('button', 'unlockListBtn')
      unlockListBtn.onclick = function () {
        list['children'][l]['locked'] = false
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

    if (list['children'][l]['type'] == 'block') {
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
      for (let i = 0; i < list['children'][l]['children'].length; i++) {
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
          newItemToTop(l, i)
          listEdited(l)
        }
        let sublistTitleP = document.createElement('input')

        sublistTitleP.value = list['children'][l]['children'][i]['name']
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
            list['children'][l]['children'][i]['name'] = this.value
            writeJSON(list)
            listEdited(l)
          }

        }
        sublistTitleDiv.append(deleteSublistBtn)

        sublistTitleDiv.append(collapseSublistBtn)
        sublistTitleDiv.append(newItemToTopBtn)
        sublistTitleDiv.append(sublistTitleP)


        sublistDiv.append(sublistTitleDiv)
        sublistDiv.append(sublistContentDiv)
        sublists.append(sublistDiv)


        // FOR_EVERY_ITEM
        for (let e = 0; e < list['children'][l]['children'][i]['children'].length; e++) {
          // -1 because "name" is a key
          let itemSettingsDiv = document.createElement('div')

          let itemDiv = document.createElement('div')
          itemDiv.className = 'item'
          if (list['children'][l]['children'][i]['children'][e]['starred'] == true) {
            itemDiv.classList.add('starred')
          }

          itemDiv.classList.add(("s" + (list['children'][l]['children'][i]['children'][e]['color']).toString()));

          // ITEM_TITLE
          let itemTitle = document.createElement('p')
          itemTitle.contentEditable = true
          itemTitle.innerHTML = list['children'][l]['children'][i]['children'][e]['title']
          itemTitle.className = 'title'
          itemTitle.spellcheck = false
          let itTemp = ''
          itemTitle.onfocus = function () {
            itTemp = this.innerHTML
          }
          itemTitle.onblur = function () {
            if (this.innerHTML != itTemp) {
              list['children'][l]['children'][i]['children'][e]['title'] = this.innerHTML
              writeJSON(list)
              listEdited(l)
            }
          }
          itemTitle.onkeydown = function (e) {
            if (e.code == 'Enter') {
              this.blur()
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
          if (list['children'][l]['children'][i]['children'][e]['media'] != null && list['children'][l]['children'][i]['children'][e]['media'] != '' && list['children'][l]['children'][i]['children'][e]['media'] != []) {
            // if there is an media media specified
            for (let p = 0; p < list['children'][l]['children'][i]['children'][e]['media'].length; p++) {
              // for every piece of media
              if (list['children'][l]['children'][i]['children'][e]['media'][p].endsWith("png") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith("jpg") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith("jpeg") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith("gif") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith("webp")) {
                // if is .png .jpg .jpeg .gif .webp
                // make image
                let img = document.createElement('img')
                img.className = 'itemMedia'
                img.src = "../resources/media/" + list['children'][l]['children'][i]['children'][e]['media'][p]
                img.alt = 'Error loading ' + list['children'][l]['children'][i]['children'][e]['media'][p]
                img.title = dirname + 'resources/media/' + list['children'][l]['children'][i]['children'][e]['media']
                img.addEventListener("dblclick", function () {
                  window.api.send('openFile', list['children'][l]['children'][i]['children'][e]['media'][p]);
                });
                img.style.cursor = 'pointer'
                itemDiv.append(img)
              } else if (list['children'][l]['children'][i]['children'][e]['media'][p].endsWith(".mp4") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith(".webm")) {
                // if is .mp4 .webm 
                // make video
                let vid = document.createElement('video')
                vid.className = 'itemMedia'
                vid.controls = true
                vid.disablePictureInPicture = true
                vid.controlsList = "nodownload noremoteplayback noplaybackrate"
                vid.src = "../resources/media/" + list['children'][l]['children'][i]['children'][e]['media'][p]
                vid.alt = 'Error loading ' + list['children'][l]['children'][i]['children'][e]['media'][p]
                vid.title = list['children'][l]['children'][i]['children'][e]['media'][p]
                itemDiv.append(vid)
              } else if (list['children'][l]['children'][i]['children'][e]['media'][p].endsWith(".ogg") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith(".wav") || list['children'][l]['children'][i]['children'][e]['media'][p].endsWith(".mp3")) {
                // if is .ogg .wav .mp3
                // make audio 
                let aud = document.createElement('audio')
                aud.controls = true
                aud.className = 'itemMedia'
                aud.src = "../resources/media/" + list['children'][l]['children'][i]['children'][e]['media'][p]
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
              list['children'][l]['children'][i]['children'][e]['media'] = []
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

          if (list['children'][l]['children'][i]['children'][e]['starred'] == true) {
            setStarredBtn.className = 'setStarredBtn active'
            setStarredBtnTooltip = createTooltip('Unstar', 14, true)
          } else {
            setStarredBtn.className = 'setStarredBtn'
            setStarredBtnTooltip = createTooltip('Star', 8, true)
          }
          setStarredBtn.onclick = function () {
            // edit list
            list['children'][l]['children'][i]['children'][e].starred = !list['children'][l]['children'][i]['children'][e].starred
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
          itemDescription.innerHTML = list['children'][l]['children'][i]['children'][e]['description']
          itemDescription.className = 'description'
          itemDescription.spellcheck = false
          let idTemp = ''
          itemDescription.onfocus = function () {
            idTemp = this.innerHTML
          }
          itemDescription.onblur = function () {
            if (this.innerHTML != idTemp) {

              list['children'][l]['children'][i]['children'][e]['description'] = this.innerHTML
              writeJSON(list)
              if (this.innerHTML.replaceAll(" ", '').replaceAll("\\n", '').replaceAll('<br>', '') == '') {
                this.style.display = 'none'
                addDescBtnDiv.style.display = 'inline-block'
                listEdited(l)
              }
            }
          }

          if (itemDescription.innerHTML.replaceAll(" ", '').replaceAll("\n", '').replaceAll('<br>', '') == '') {
            itemDescription.style.display = 'none'
            addDescBtnDiv.style.display = 'inline-block'
          }
          itemDiv.append(itemDescription)

          // ITEM_LINK
          if (list['children'][l]['children'][i]['children'][e]['link'] != '' && list['children'][l]['children'][i]['children'][e]['link'] != null) {
            let linkDiv = create('div', '')
            linkDiv.style.marginTop = '-8px'
            let openLinkBtn = create('button', 'openLinkBtn')
            openLinkBtn.title = ('https://' + list['children'][l]['children'][i]['children'][e]['link'])
            openLinkBtn.onclick = function () {
              window.open(list['children'][l]['children'][i]['children'][e]['link'], '_blank')
            }
            let link = create('a', 'itemLink')
            link.title = ('https://' + list['children'][l]['children'][i]['children'][e]['link'])
            link.href = 'https://' + list['children'][l]['children'][i]['children'][e]['link']
            link.target = '_blank'
            link.innerHTML = list['children'][l]['children'][i]['children'][e]['link']
            linkDiv.append(link)
            linkDiv.append(openLinkBtn)
            itemDiv.append(linkDiv)
          }

          // ITEM_CREATION_DATE
          let cdate = new Date(list['children'][l]['children'][i]['children'][e]['creationDate'])
          let creationDateP = create('p', 'creationDateText')
          creationDateP.title = months[cdate.getMonth()] + ' ' + cdate.getDate() + ", " + (cdate.getHours() % 12 || 12) + ":" + cdate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(cdate)

          creationDateP.innerHTML = (timeAgo(d.getTime(), list['children'][l]['children'][i]['children'][e]['creationDate']))

          // ITEM_SETTINGS_DIV
          itemSettingsDiv.style.display = 'none'
          itemSettingsDiv.className = 'itemSettingsDiv'

          // DUPLICATE_ITEM_BUTTON_
          let duplicateItemBtnDiv = create('div', '')
          let duplicateItemBtn = create('button', 'duplicateItemBtn')
          let duplicateItemBtnTooltip = createTooltip('Duplicate Item', 32, true)
          duplicateItemBtn = handleTooltip(duplicateItemBtn, duplicateItemBtnTooltip)
          duplicateItemBtn.onclick = function () {
            list['children'][l]['children'][i]['children'].splice(e, 0, list['children'][l]['children'][i]['children'][e])
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
          addLinkInput.value = list['children'][l]['children'][i]['children'][e]['link']
          addLinkInput.style.display = 'none'
          addLinkInput.onblur = function () {

            this.value = (this.value).replaceAll(' ', '')
            list['children'][l]['children'][i]['children'][e]['link'] = this.value.replaceAll('https://', '')
            writeJSON(list)
            generateList()
            listEdited(l)
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
            removeItem(l, i, e)
            listEdited(l)
          }
          delItemBtn = handleTooltip(delItemBtn, delItemBtnTooltip)
          delItemBtnDiv.append(delItemBtnTooltip)
          delItemBtnDiv.append(delItemBtn)

          // color buttons
          let colorBtn0 = create('button', 'colorBtn c0')
          if (list['children'][l]['children'][i]['children'][e]['color'] == 0) {
            colorBtn0.classList.add('active')
          }
          colorBtn0.onclick = function () {
            updateColor(this, 0)
          }
          let colorBtn1 = create('button', 'colorBtn c1')
          if (list['children'][l]['children'][i]['children'][e]['color'] == 1) {
            colorBtn1.classList.add('active')
          }
          colorBtn1.onclick = function () {
            updateColor(this, 1)
          }
          let colorBtn2 = create('button', 'colorBtn c2')
          if (list['children'][l]['children'][i]['children'][e]['color'] == 2) {
            colorBtn2.classList.add('active')
          }
          colorBtn2.onclick = function () {
            updateColor(this, 2)
          }
          let colorBtn3 = create('button', 'colorBtn c3')
          if (list['children'][l]['children'][i]['children'][e]['color'] == 3) {
            colorBtn3.classList.add('active')
          }
          colorBtn3.onclick = function () {
            updateColor(this, 3)
          }


          function updateColor(item, num) {
            list['children'][l]['children'][i]['children'][e]['color'] = num
            document.querySelector('.colorBtn.active').classList.remove('active')
            item.classList.add('active')
            itemDiv.className = 'item s' + num
            if (list['children'][l]['children'][i]['children'][e]['starred'] == true) {
              itemDiv.classList.add('starred')
            }
            writeJSON(list)
          }






          // add buttons to item settings
          itemSettingsDiv.append(mediaBtnDiv)

          if (list['children'][l]['children'][i]['children'][e]['media'] != null && list['children'][l]['children'][i]['children'][e]['media'] != '' && list['children'][l]['children'][i]['children'][e]['media'] != []) {
            // if no media
            itemSettingsDiv.append(delMediaBtnDiv)
          }
          itemSettingsDiv.append(addLinkBtnDiv)
          itemSettingsDiv.append(addDescBtnDiv)
          itemSettingsDiv.append(setStarredBtnDiv)
          itemSettingsDiv.append(duplicateItemBtnDiv)
          itemSettingsDiv.append(delItemBtnDiv)
          itemSettingsDiv.append(colorBtn0)
          itemSettingsDiv.append(colorBtn1)
          itemSettingsDiv.append(colorBtn2)
          itemSettingsDiv.append(colorBtn3)

          // link input
          itemSettingsDiv.append(addLinkInput)
          // creation date
          itemSettingsDiv.append(creationDateP)
          itemDiv.append(itemSettingsDiv)
          sublistContentDiv.append(itemDiv)
        }
      }
      listContent.append(sublists)
      listDiv.append(listContent)
      lists.append(listDiv)
    } else if (list['children'][l]['type'] == 'text') {
      listDiv.classList.add('text')
      listContent.classList.add('text')
      let textDiv = create('div', 'mainListContent text')

      for (let a = 0; a < list['children'][l]['children'].length; a++) {
        // all "blocks"
        let blockDiv = create('div', 'block')
        if (list['children'][l]['children'][a]['type'] == 'text') {
          blockDiv.classList.add('text')
          let textBlockP = create('p', 'text')
          textBlockP.spellcheck = false
          let temp = ''
          textBlockP.onfocus = function () {
            temp = this.innerHTML
          }
          textBlockP.onblur = function () {
            if (this.innerHTML != temp) {
              list['children'][l]['children'][a]['data'] = this.innerHTML
              writeJSON(list)
              listEdited(l)
            }
          }
          textBlockP.addEventListener('paste', function (e) {
            e.preventDefault()
            var text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)
          })
          textBlockP.innerHTML = list['children'][l]['children'][a]['data']
          textBlockP.contentEditable = true
          blockDiv.append(textBlockP)

        } else if (list['children'][l]['children'][a]['type'] == 'code') {
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
              list['children'][l]['children'][a]['data'] = this.innerHTML
              writeJSON(list)
              writeJSON(list)
            }
          }
          codeBlockP.addEventListener('paste', function (e) {
            e.preventDefault()
            var text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)
          })
          codeBlockP.innerHTML = list['children'][l]['children'][a]['data']
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
            navigator.clipboard.writeText(list['children'][l]['children'][a]['data']).then(function () {
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
        } else if (list['children'][l]['children'][a]['tyoe'] == 'media') {

        }
        textDiv.append(blockDiv)

      }


      let newCodeBlockBtnDiv = create('div', '', '')
      let newCodeBlockBtn = create('button', 'newCodeBlockBtn', '')
      newCodeBlockBtnTooltip = createTooltip('New Code Block', 32, false)
      newCodeBlockBtn = handleTooltip(newCodeBlockBtn, newCodeBlockBtnTooltip)

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
        showAlert('Code blocks are currently disabled', 1250, 'warning')
      }
      newCodeBlockBtnDiv.append(newCodeBlockBtnTooltip)
      newCodeBlockBtnDiv.append(newCodeBlockBtn)

      listSettingsDiv.append(newCodeBlockBtnDiv)

      listContent.append(textDiv)

      listDiv.append(listContent)
      lists.append(listDiv)
    } else if (list['children'][l]['type'] == 'checklist') {
      listDiv.classList.add('checklist')
      listContent.classList.add('checklist')

      // NEW SUBLIST BUTTON
      let newSublistBtnDiv = create('div', '')
      let newSublistBtnTooltip = createTooltip('New Sublist', 22, false)

      let newSublistBtn = create('button', 'newSublistBtn')
      newSublistBtn.onclick = function () {
        newChecklistSublist(l)
        writeJSON(list)
        generateList()
      }
      newSublistBtn = handleTooltip(newSublistBtn, newSublistBtnTooltip)
      newSublistBtnDiv.append(newSublistBtnTooltip)
      newSublistBtnDiv.append(newSublistBtn)
      listSettingsDiv.append(newSublistBtnDiv)

      let sublists = create('div', 'mainListContent checklist')
      for (let i = 0; i < list['children'][l]['children'].length; i++) {
        // FOR_EACH_SUBLIST

        let sublistDiv = create('div', 'sublistDiv')
        let sublistContentDiv = create('div', 'checklistSublistDiv')


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

        let sublistTitleP = document.createElement('input')

        sublistTitleP.value = list['children'][l]['children'][i]['name']
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
            list['children'][l]['children'][i]['name'] = this.value
            writeJSON(list)
            listEdited(l)
          }
        }
        sublistTitleDiv.append(deleteSublistBtn)

        sublistTitleDiv.append(collapseSublistBtn)
        sublistTitleDiv.append(sublistTitleP)

        sublistDiv.append(sublistTitleDiv)
        sublistDiv.append(sublistContentDiv)
        sublists.append(sublistDiv)


        for (let e = 0; e < list['children'][l]['children'][i]['children'].length; e++) {
          let itemDiv = create('div', ('checklistItem ' + list['children'][l]['children'][i]['children'][e]['checked']))
          let itemText = create('p', 'checklistItemText')
          let checkbox = create('button', ('checkBoxBtn ' + list['children'][l]['children'][i]['children'][e]['checked']))
          checkbox.onclick = function () {
            list['children'][l]['children'][i]['children'][e]['checked'] = !list['children'][l]['children'][i]['children'][e]['checked']
            this.className = 'checkBoxBtn ' + list['children'][l]['children'][i]['children'][e]['checked']
            itemDiv.className = 'checklistItem ' + list['children'][l]['children'][i]['children'][e]['checked']
            writeJSON(list)
          }
          itemText.contentEditable = true
          itemText.spellcheck = false

          let ctTemp = ''
          itemText.onkeydown = function (e) {
            if (e.code == 'Enter') {
              this.blur()
            }
          }
          itemText.onfocus = function () {
            ctTemp = this.innerHTML
          }
          itemText.onblur = function () {
            if (this.innerHTML != ctTemp) {
              list['children'][l]['children'][i]['children'][e]['text'] = this.innerHTML
              writeJSON(list)
              generateList()
              listEdited(l)
            }
            if (this.innerHTML.replaceAll(' ', '') == '' && e != list['children'][l]['children'][i]['children'].length - 1) {
              // if empty and not last element
              deleteChecklistItem(l, i, e)
            }
            if (this.innerHTML.replaceAll(' ', '') != '' && e == list['children'][l]['children'][i]['children'].length - 1) {
              // not empty and is last element
              newChecklistItemToBottom(l, i)
            }
          }
          itemText.innerHTML = list['children'][l]['children'][i]['children'][e]['text']

          // dont give last element a checkbox
          if (e != list['children'][l]['children'][i]['children'].length - 1) {
            itemDiv.append(checkbox)
          } else {
            // is the last element
            itemText.style.marginLeft = '22px'
          }
          itemDiv.append(itemText)
          sublistContentDiv.append(itemDiv)
        }
      }
      listContent.append(sublists)
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
    try {
      document.getElementsByClassName('sideListBtn')[selectedList + 1].click()
    } catch (err) {
      console.warn(err)
    }
  }
}

init()
