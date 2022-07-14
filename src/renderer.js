
// event listeners
document.getElementById("closeBtn").addEventListener("click", function () {
  window.api.send('close', '');
});

document.getElementById("exitSearch").addEventListener("click", function () {
  document.querySelector('#listsSearch').value = ''
  this.style.display = 'none'

  for (let s = 0; s < document.querySelectorAll('.sideListBtn').length; s++) {
    if (document.querySelectorAll('.sideListBtn')[s].id != 'settingsBtn') {
      document.querySelectorAll('.sideListBtn')[s].style.display = 'none'
      if ((list['children'][(s - 1)]['name'].toLowerCase().includes(document.querySelector('#listsSearch').value.toLowerCase()) && list['children'][(s - 1)]['locked'] == false) || this.value == '') {
        document.querySelectorAll('.sideListBtn')[s].style.display = null
      }
    }
  }
});

document.querySelectorAll(".checkedItemStyleBtn")[0].addEventListener("click", function () {
  settings['checkedItemStyle'] = 0
  document.querySelectorAll(".checkedItemStyleBtn")[1].classList.remove('active')
  this.classList.add('active')
  writeSettings(settings)
  for (let i = 0; i < document.querySelectorAll('.checklistItem').length; i++) {
    document.querySelectorAll('.checklistItem')[i].classList.add('strikethrough')
  }
});

document.querySelectorAll(".checkedItemStyleBtn")[1].addEventListener("click", function () {
  settings['checkedItemStyle'] = 1
  document.querySelectorAll(".checkedItemStyleBtn")[0].classList.remove('active')
  this.classList.add('active')
  writeSettings(settings)
  for (let i = 0; i < document.querySelectorAll('.checklistItem').length; i++) {
    document.querySelectorAll('.checklistItem')[i].classList.remove('strikethrough')
  }
});

document.getElementById("blockListItemMediaWidth").addEventListener("input", function () {
  let wid = document.querySelector('#blockListItemMediaWidth').value * 10
  document.querySelector('#mediaWidthTitle').innerHTML = 'Media Width (' + wid + '%)'
  for (let i = 0; i < document.querySelectorAll('.itemMedia').length; i++) {
    document.querySelectorAll('.itemMedia')[i].style.width = wid + '%'
  }
  settings['blockListItemMediaWidth'] = wid
  writeSettings(settings)
});

document.querySelector('#listsSearch').addEventListener('input', function () {
  if (this.value != '') {
    document.querySelector('#exitSearch').style.display = null
  } else {
    document.querySelector('#exitSearch').style.display = 'none'
  }
  for (let s = 0; s < document.querySelectorAll('.sideListBtn').length; s++) {
    if (document.querySelectorAll('.sideListBtn')[s].id != 'settingsBtn') {
      document.querySelectorAll('.sideListBtn')[s].style.display = 'none'
      if ((list['children'][(s - 1)]['name'].toLowerCase().includes(document.querySelector('#listsSearch').value.toLowerCase()) && list['children'][(s - 1)]['locked'] == false) || this.value == '') {
        document.querySelectorAll('.sideListBtn')[s].style.display = null
      }
    }
  }
})

document.getElementById("toggleSideBtn").addEventListener("click", function () {
  if (document.querySelector('#side').style.padding == "8px 0px") {
    document.querySelector('#menuBar').style.width = 'calc(100vw - 180px)'
    document.querySelector('#menuBar').style.marginLeft = '180px'
    document.querySelector('#content').style.marginLeft = '180px'
    document.querySelector('#side').style.width = null
    document.querySelector('#side').style.padding = null
  } else {
    document.querySelector('#menuBar').style.width = '100vw'
    document.querySelector('#menuBar').style.margin = '0'
    document.querySelector('#content').style.margin = '0'
    document.querySelector('#side').style.width = '0'
    document.querySelector('#side').style.padding = '8px 0 8px 0'
  }
});

document.getElementById("password").addEventListener("blur", function () {
  if (settings['password'] != this.value) {
    // if the password actually changed
    settings['password'] = this.value

    writeSettings(settings)
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
  this.className = !(this.className === 'true')
});

document.getElementById("newListBtn").addEventListener("click", function () {
  let type = document.getElementById('listType').value
  showAlert('Created New List', 1000, "success")
  newList(type)
});

document.getElementById("resetSettingsBtn").addEventListener("click", function () {
  writeSettings(defaultSettings)
  window.api.send('requestSettings', '');
  showAlert('Reset Settings', 1000, "success")
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

document.getElementById('spellcheckToggle').addEventListener('input', function () {
  settings['spellcheck'] = this.checked
  writeSettings(settings)
  for (let e = 0; e < document.body.querySelectorAll('[contentEditable="true"], input[type="text"]').length; e++) {
    document.body.querySelectorAll('[contentEditable="true"], input[type="text"]')[e].spellcheck = this.checked
  }
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

function init() {
  // request the json
  // uses toMain, which sends data to the main process
  window.api.send('requestList', '');
  window.api.send('requestSettings', '');
  window.api.send('requestSystem', '');
  window.api.send('requestDefaultSettings', '');
  // wait for main to send back the json
}

function generateList() {
  try {
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
        let touchIdBtn = create('button', 'touchidbtn')
        touchIdBtn.onclick = function () {
          awaitUnlock = l
          window.api.send('touchID', '');
        }
        lockedTitle.innerHTML = 'This List is Locked'
        listDiv.classList.add('locked')
        listContent.style.display = 'none'
        lockedDiv = create('div', 'lockedDiv')
        pswd = createElement('input', { 'class': 'pswdInput', 'type': 'password', 'placeholder': 'Password' })
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
            sideListBtn.classList.add(list['children'][l]['type'])
            showAlert('Unlocked "' + list['children'][l]['name'] + '"', 1000, 'success')
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
        lockedDiv.append(lockedTitle)

        if (system['touchID'] == true) {
          lockedDiv.append(touchIdBtn)
        }
        lockedDiv.append(pswd)
        lockedDiv.append(pswdSubmit)
        listDiv.append(lockedDiv)
      }

      // list title
      let listTitle = createElement('input', { 'class': 'listTitle', 'type': 'text', 'value': (list['children'][l]['name']) })
      listTitle.spellcheck = settings.spellcheck
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
          listEdited(l)
        }
      }

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
          lastEdited.innerHTML = "Edited " + (timeAgo(d.getTime(), list['children'][l]['lastEdited']))

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



            sideListBtn.classList.remove(list['children'][l]['type'])
            sideListBtn.classList.add('locked')
            lockedDiv.style.display = 'block'
            listContent.style.display = 'none'
            pswd.focus()

            // ! automatically request touch id when clicking on a locked list
            if (system.touchID == true) {
              //awaitUnlock = l
              // window.api.send('touchID', '');
            }
          }
          // you're going to the same list & its unlocked, bypass the lock
          if (l == selectedList && lockedDiv.style.display != 'block') {
            lockedDiv.style.display = 'none'
            listContent.style.display = null
            sideListBtnText.innerHTML = list['children'][l]['name']
            sideListBtnDate.innerHTML = timeAgo(d.getTime(), edate)
            sideListBtn.classList.remove('locked')
            sideListBtn.classList.add(list['children'][l]['type'])
          }
        }
        if (selectedList >= 0 && list['children'][selectedList]['locked'] == true && selectedList != l) {
          // leaving a locked list, just change the title of sidelist btn to locked list
          document.querySelectorAll('.sideListBtn .title')[selectedList].innerHTML = 'Locked List'
          document.querySelectorAll('.sideListBtn .date')[selectedList].innerHTML = '...'
          document.querySelectorAll('.sideListBtn')[selectedList + 1].classList.remove(list['children'][l]['type'])
          document.querySelectorAll('.sideListBtn')[selectedList + 1].classList.add('locked')
          document.querySelectorAll('.listDiv')[selectedList].children[0].children[1].value = ''
          //                         .listDiv                .lockedDiv  .pswdInput
        }
        if (selectedList >= 0 && list['children'][selectedList]['type'] == 'accounts' && selectedList != l) {
          // leaving an account list, sort it
          //  sortAccounts(selectedList)
        }
        selectedList = l
      }

      // list settings, creation date, last edit + buttons
      let listSettingsDiv = create('div', 'listSettingsDiv')
      let listCreationDate = createElement('p', {
        'class': 'listDate',
        'title': (months[tdate.getMonth()] + ' ' + tdate.getDate() + ", " + (tdate.getHours() % 12 || 12) + ":" + tdate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(tdate)),
        'innerhtml': ("•&nbsp;&nbsp;&nbsp;Created " + (timeAgo(d.getTime(), list['children'][l]['creationDate'])))
      })

      lastEdited = create('p', 'listDate')

      if (list['children'][l]['lastEdited'] != 0) {
        lastEdited.title = months[edate.getMonth()] + ' ' + edate.getDate() + ", " + (edate.getHours() % 12 || 12) + ":" + edate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(edate)
        lastEdited.innerHTML = "Edited " + (timeAgo(d.getTime(), list['children'][l]['lastEdited']))
        lastEdited.style.marginRight = '10px'
        listSettingsDiv.append(lastEdited)
      }

      let deleteListBtnDiv = create('div', '')
      let deleteListBtnTooltip = createTooltip('Delete List', 38, false)

      let deleteListBtn = createElement('button', { 'class': 'deleteListBtn right' })
      deleteListBtn.onclick = function () {
        showAlert('Deleted "' + list['children'][l]['name'] + '"', + 1000, "success")
        removeList(l)
        writeJSON(list)
        generateList()
      }
      deleteListBtn = handleTooltip(deleteListBtn, deleteListBtnTooltip)
      deleteListBtnDiv.append(deleteListBtnTooltip)
      deleteListBtnDiv.append(deleteListBtn)

      listSettingsDiv.append(listCreationDate)
      listSettingsDiv.append(deleteListBtnDiv)

      if (list['children'][l]['locked'] == false) {
        // not locked yet
        let lockListBtnDiv = create('div', '')
        let lockListBtnTooltip = createTooltip('Lock List', 12, false)

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

        let newSublistBtn = create('button', 'newBtn')
        newSublistBtn.onclick = function () {
          newSublist(l)
          listEdited(l)
        }
        newSublistBtn = handleTooltip(newSublistBtn, newSublistBtnTooltip)
        newSublistBtnDiv.append(newSublistBtnTooltip)
        newSublistBtnDiv.append(newSublistBtn)
        listSettingsDiv.append(newSublistBtnDiv)

        let sublists = create('div', 'mainListContent block')
        for (let i = 0; i < list['children'][l]['children'].length; i++) {
          // FOR_EACH_SUBLIST

          let sublistDiv = create('div', 'sublistDiv')
          let sublistContentDiv = create('div', 'content')

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
            listEdited(l)
          }

          let newItemToTopBtn = create('button', 'newItemToTopBtn')
          newItemToTopBtn.onclick = function () {
            // newItemToTop(l, i)
            newBlockItem(l, i)
            listEdited(l)
          }
          let sublistTitleP = createElement('input', {
            'value': (list['children'][l]['children'][i]['name']),
            'type': 'text',
          })

          sublistTitleP.onkeydown = function (e) {
            if (e.code == 'Enter') {
              this.blur()
            }
          }
          // only update list and writejson if it actually changed
          let stpTemp = ''
          sublistTitleP.onfocus = function () {
            stpTemp = this.value
          }
          sublistTitleP.onblur = function () {
            if (this.value != stpTemp) {
              list['children'][l]['children'][i]['name'] = this.value
              listEdited(l)
            }

          }
          sublistTitleDiv.append(deleteSublistBtn)

          sublistTitleDiv.append(newItemToTopBtn)
          sublistTitleDiv.append(collapseSublistBtn)
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

            // number count
            let count = createElement("p", { "class": "blockItemCount" })
            count.innerHTML = (e + 1) + "."

            // status button
            button = document.createElement('button')
            button.classList = 'statusBtn'

            button.onclick = function (event) {

              // left click, cycle up
              if (list['children'][l]['children'][i]['children'][e]['status'] < 6) {
                list['children'][l]['children'][i]['children'][e]['status'] += 1
                writeJSON(list)
              } else {
                list['children'][l]['children'][i]['children'][e]['status'] = 0
              }
              this.className = 'statusBtn'
              this.classList.add("s" + (list['children'][l]['children'][i]['children'][e]['status']).toString())
              listEdited(l)

            }
            button.classList.add("s" + (list['children'][l]['children'][i]['children'][e]['status']).toString());
            itemDiv.append(button)
            itemDiv.append(count)

            // ITEM_TITLE
            let itemTitle = createElement('p', {
              'contenteditable': true,
              'innerhtml': (list['children'][l]['children'][i]['children'][e]['title']),
              'class': 'title'
            })
            itemTitle.addEventListener('paste', function (e) {
              e.preventDefault()
              var text = e.clipboardData.getData('text/plain')
              document.execCommand('insertText', false, text)
            })
            itemTitle.spellcheck = settings.spellcheck
            let itTemp = ''
            itemTitle.onfocus = function () {
              itTemp = this.innerText
            }
            itemTitle.onblur = function () {
              if (this.innerText != itTemp) {
                console.log('item title')
                list['children'][l]['children'][i]['children'][e]['title'] = this.innerText
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
                listEdited(l)
              }
              delMediaBtnDiv.append(delMediaBtnTooltip)
              delMediaBtnDiv.append(delMediaBtn)
            }


            // ITEM_CREATION_DATE
            let cdate = new Date(list['children'][l]['children'][i]['children'][e]['creationDate'])
            let creationDateP = create('p', 'creationDateText')
            creationDateP.title = months[cdate.getMonth()] + ' ' + cdate.getDate() + ", " + (cdate.getHours() % 12 || 12) + ":" + cdate.getMinutes().toString().padStart(2, '0') + " " + getAmPm(cdate)

            creationDateP.innerHTML = "• " + (timeAgo(d.getTime(), list['children'][l]['children'][i]['children'][e]['creationDate']))

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
              listEdited(l)
            }
            duplicateItemBtnDiv.append(duplicateItemBtnTooltip)
            duplicateItemBtnDiv.append(duplicateItemBtn)

            // ADD MEDIA BUTTON
            let mediaBtnDiv = document.createElement('div')
            let mediaBtn = create('button', 'uploadMediaBtn')
            let mediaBtnTooltip
            mediaBtnTooltip = createTooltip('Upload Media', 28, true)

            mediaBtn.onclick = function () {
              currImgIndex = [l, i, e]
              // wait for main to send back the media name
              window.api.send("uploadMedia", '');
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
            delItemBtnTooltip = createTooltip('Delete Item', 28, true)
            delItemBtnTooltip.style.whiteSpace = 'nowrap'

            delItemBtn.onclick = function () {
              removeItem(l, i, e)
              listEdited(l)
            }
            delItemBtn = handleTooltip(delItemBtn, delItemBtnTooltip)
            delItemBtnDiv.append(delItemBtnTooltip)
            delItemBtnDiv.append(delItemBtn)

            // add buttons to item settings
            itemSettingsDiv.append(mediaBtnDiv)

            if (list['children'][l]['children'][i]['children'][e]['media'] != null && list['children'][l]['children'][i]['children'][e]['media'] != '' && list['children'][l]['children'][i]['children'][e]['media'] != []) {
              // if no media
              itemSettingsDiv.append(delMediaBtnDiv)
            }
            itemSettingsDiv.append(duplicateItemBtnDiv)
            itemSettingsDiv.append(delItemBtnDiv)
            // creation date
            itemDiv.append(creationDateP)
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
            textBlockP.spellcheck = settings['spellcheck']
            let temp = ''
            textBlockP.onfocus = function () {
              temp = this.innerHTML
            }
            textBlockP.onblur = function () {
              if (this.innerHTML != temp) {
                list['children'][l]['children'][a]['data'] = this.innerHTML
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
            codeBlockP.spellcheck = settings['spellcheck']
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
                listEdited(l)

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
              listEdited(l)
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

        let newSublistBtn = create('button', 'newBtn')
        newSublistBtn.onclick = function () {
          newChecklistSublist(l)
          listEdited(l)
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
            listEdited(l)
          }

          let sublistTitleP = createElement('input', {
            'value': (list['children'][l]['children'][i]['name']),
            'type': 'text',
          })

          sublistTitleP.spellcheck = settings['spellcheck']
          sublistTitleP.onkeydown = function (e) {
            if (e.code == 'Enter') {
              this.blur()
            }
          }
          // only update list and writejson if it actually changed
          let stpTemp = ''
          sublistTitleP.onfocus = function () {
            stpTemp = this.value
          }

          sublistTitleP.onblur = function () {
            if (this.value != stpTemp) {
              list['children'][l]['children'][i]['name'] = this.value
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

            if (settings['checkedItemStyle'] == 0) {
              itemDiv.classList.add('strikethrough')
            }
            let checkbox = create('button', ('checkBoxBtn ' + list['children'][l]['children'][i]['children'][e]['checked']))
            checkbox.onclick = function () {
              list['children'][l]['children'][i]['children'][e]['checked'] = !list['children'][l]['children'][i]['children'][e]['checked']
              this.className = 'checkBoxBtn ' + list['children'][l]['children'][i]['children'][e]['checked']
              itemDiv.classList.remove('true')
              itemDiv.classList.remove('false')
              itemDiv.classList.add(list['children'][l]['children'][i]['children'][e]['checked'])
              listEdited(l)
            }
            itemText.contentEditable = true
            itemText.spellcheck = settings['spellcheck']

            itemText.addEventListener('paste', function (e) {
              e.preventDefault()
              var text = e.clipboardData.getData('text/plain')
              document.execCommand('insertText', false, text)
            })

            let ctTemp = ''
            itemText.onkeydown = function (e) {
              if (e.code == 'Enter') {
                this.blur()
              }
            }

            itemText.onfocus = function () {
              ctTemp = this.innerText
            }
            itemText.onblur = function () {
              if (this.innerText != ctTemp) {
                list['children'][l]['children'][i]['children'][e]['text'] = this.innerText
                listEdited(l)
              }
              if (this.innerText.replaceAll(' ', '') == '' && e != list['children'][l]['children'][i]['children'].length - 1) {
                // if empty and not last element
                deleteChecklistItem(l, i, e)
                listEdited(l)
              }
              if (this.innerText.replaceAll(' ', '') != '' && (list['children'][l]['children'][i]['children'].length == 0 || e == list['children'][l]['children'][i]['children'].length - 1)) {
                // not empty and is last element
                newChecklistItemToBottom(l, i)
                listEdited(l)
              }

            }
            itemText.innerText = list['children'][l]['children'][i]['children'][e]['text']

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

      } else if (list['children'][l]['type'] == 'accounts') {
        // ! LIST TYPE ACCOUNTS
        listDiv.classList.add('accounts')
        listContent.classList.add('accounts')
        // NEW SUBLIST BUTTON
        let newAccountBtnDiv = create('div', '')
        let newAccountBtnTooltip = createTooltip('New Account', 24, false)

        let newAccountBtn = create('button', 'newBtn')
        newAccountBtn.onclick = function () {
          newAccount(l)
          writeJSON(list)
          generateList()
        }

        searchBox = create('input', 'accountSearchBox')
        searchBox.type = 'text'
        searchBox.placeholder = 'Search...'
        searchBox.spellcheck = settings.spellcheck


        newAccountBtn = handleTooltip(newAccountBtn, newAccountBtnTooltip)
        newAccountBtnDiv.append(newAccountBtnTooltip)
        newAccountBtnDiv.append(newAccountBtn)
        listSettingsDiv.append(newAccountBtnDiv)
        listContent.append(searchBox)

        let accountsDiv = create('div', 'mainListContent accounts')

        for (let i = 0; i < list['children'][l]['children'].length; i++) {
          // for each account
          // for_each_account

          let editableOnEdit = []
          let accountFields = createElement('table', {})

          let accountDiv = create('div', 'accountDiv')
          let accountTitle = create('p', 'accountTitle')
          let collapseIcon = createElement('button', { 'class': 'collapseAccountBtn up' })

          accountTitle.contentEditable = false
          accountTitle.style.cursor = 'default'
          editableOnEdit.push(accountTitle)
          accountTitle.onclick = function () {
            if (this.contentEditable == 'false') {
              if (accountFields.style.display == 'none') {
                accountFields.style.display = null
                collapseIcon.classList.remove('up')
                collapseIcon.classList.add('down')
              } else {
                accountFields.style.display = 'none'
                collapseIcon.classList.remove('down')
                collapseIcon.classList.add('up')
              }
            }
          }

          collapseIcon.onclick = function () {
            if (accountTitle.contentEditable == 'false') {
              if (accountFields.style.display == 'none') {
                accountFields.style.display = null
                collapseIcon.classList.remove('up')
                collapseIcon.classList.add('down')
              } else {
                accountFields.style.display = 'none'
                collapseIcon.classList.remove('down')
                collapseIcon.classList.add('up')
              }
            }
          }

          collapseIcon.click()
          accountTitle.spellcheck = settings['spellcheck']

          let showOnEdit = []

          let atTemp = ''
          accountTitle.onfocus = function () {
            atTemp = this.innerHTML
          }
          accountTitle.onblur = function () {
            if (this.innerHTML != atTemp) {
              list['children'][l]['children'][i]['name'] = this.innerHTML
              listEdited(l)
            }
          }
          accountTitle.onkeydown = function (e) {
            if (e.code == 'Enter') {
              this.blur()
            }
          }
          accountTitle.innerHTML = list['children'][l]['children'][i]['name']

          // new field btn
          let newFieldBtn = create('button', 'newFieldBtn')
          newFieldBtn.onclick = function () {
            newAccountField(l, i, fieldType.value, newFieldText.value)
            listEdited(l)
          }

          let openAccountSettingsBtn = create('button', 'openAccountSettingsBtn')


          let deleteAccountBtn = createElement('button', { 'class': 'right text-red border-red margin4', 'innerhtml': 'Delete' })
          deleteAccountBtn.style.padding = '0 12px'
          deleteAccountBtn.style.borderRadius = '3px'
          deleteAccountBtn.onclick = function () {
            deleteAccount(l, i)
            listEdited(l)
          }

          let accountSettingsDiv = createElement('div', { 'class': 'accountSettingsDiv', 'hide': true })

          let saveAccountChangesBtn = createElement('button', { 'class': 'right bg-green border-green margin4', 'innerhtml': 'Done' })
          saveAccountChangesBtn.style.padding = '0 12px'
          saveAccountChangesBtn.style.borderRadius = '3px'
          saveAccountChangesBtn.onclick = function () {
            accountSettingsDiv.style.display = 'none'
            openAccountSettingsBtn.style.display = null;

            // hide all tagged items
            for (let k = 0; k < showOnEdit.length; k++) {
              showOnEdit[k].style.display = 'none'
            }

            // make elements not editable
            for (let k = 0; k < editableOnEdit.length; k++) {
              editableOnEdit[k].contentEditable = false
              editableOnEdit[k].style.filter = null
            }
            accountTitle.style.cursor = 'default'

          }

          let fieldType = create('select', 'fieldType')
          fieldType.innerHTML = (`
            <option value='Email'>Email</option>
            <option value='ID'>ID</option>
            <option value='Name'>Name</option>
            <option value='Password'>Password</option>
            <option value='Phone'>Phone</option>
            <option value='Token'>Token</option>
            <option value='Username'>Username</option>
            <option value='Website'>Website</option>
          `)

          let newFieldText = createElement('input', { 'type': 'text', 'placeholder': 'Field Value...' })
          newFieldText.addEventListener('paste', function (e) {
            e.preventDefault()
            var text = e.clipboardData.getData('text/plain')
            document.execCommand('insertText', false, text)
          })
          newFieldText.onkeydown = function (e) {
            if (e.code == 'Enter') {
              newFieldBtn.click()
            }
          }
          newFieldText.spellcheck = settings.spellcheck

          let accountType = create('select', 'account')
          accountType.innerHTML = (`
          <option value=''>None</option>
          <option value='education'>Education</option>
          <option value='email'>Email</option>
          <option value='entertainment'>Entertainment</option>
          <option value='game'>Game</option>
          <option value='music'>Music</option>
          <option value='shopping'>Shopping</option>
          <option value='socialmedia'>Social Media</option>
          `)

          accountType.oninput = function () {
            list['children'][l]['children'][i]['type'] = this.value
            if (list['children'][l]['children'][i]['type'] != '') {
              // not none
              accountIcon.style.display = null
              accountIcon.src = accountTypeIconMap[list['children'][l]['children'][i]['type']]
            } else {
              accountIcon.style.display = 'none'
            }
            writeJSON(list)
          }

          accountType.value = list['children'][l]['children'][i]['type']

          let accountTypeIconMap = {
            "education": "../assets/accountTypeIcons/book.svg",
            "shopping": "../assets/accountTypeIcons/shopping.svg",
            "music": "../assets/accountTypeIcons/music.svg",
            "socialmedia": "../assets/accountTypeIcons/message.svg",
            "entertainment": "../assets/accountTypeIcons/film.svg",
            "game": "../assets/accountTypeIcons/controller.svg",
            "email": "../assets/accountTypeIcons/mail.svg",
          }

          accountType.style.marginTop = '4px'
          fieldType.style.transform = 'translateY(-6px)'

          let p1 = create('p', '')
          p1.innerHTML = 'New Field'

          let p2 = create('p', '')
          p2.innerHTML = 'Account Type'


          //  accountSettingsDiv.append(p1)
          accountSettingsDiv.append(newFieldBtn)
          accountSettingsDiv.append(fieldType)
          accountSettingsDiv.append(newFieldText)
          //accountSettingsDiv.append(p2)
          //accountSettingsDiv.append(accountType)
          accountSettingsDiv.append(saveAccountChangesBtn)
          accountSettingsDiv.append(deleteAccountBtn)



          let accountIcon = create('img', '')
          if (list['children'][l]['children'][i]['type'] != '') {
            // not none
            accountIcon.src = accountTypeIconMap[list['children'][l]['children'][i]['type']]
          } else {
            accountIcon.style.display = 'none'
          }

          accountDiv.append(accountIcon)
          accountDiv.append(accountTitle)
          accountDiv.append(collapseIcon)
          accountDiv.append(openAccountSettingsBtn)


          for (let e = 0; e < list['children'][l]['children'][i]['fields'].length; e++) {
            // each field
            let fieldIcon = create('img', '')

            let fieldIcons = {
              "Password": "lock.svg",
              "Website": "globe.svg",
              "Email": "mail.svg",
              "Username": "user.svg",
              "Name": "user.svg",
              "Token": "key.svg",
              "ID": "id.svg",
              "Phone": "phone.svg"
            }
            // password: lock
            // website: globe
            // email: mail
            // username: user
            // token: key
            // phone: phone
            // id: id card
            // name: user

            fieldIcon.src = '../assets/accountFieldIcons/' + fieldIcons[list['children'][l]['children'][i]['fields'][e]['title']]

            let fieldText = create('p', 'text')

            let fieldTitle = create('p', 'title')
            fieldTitle.innerHTML = list['children'][l]['children'][i]['fields'][e]['title'] + ':&nbsp;'

            editableOnEdit.push(fieldText)
            if (list['children'][l]['children'][i]['fields'][e].title == 'Password' || list['children'][l]['children'][i]['fields'][e].title == 'Token') {
              // if is password or token, blur it
              fieldText.classList.add('blur')
            }
            fieldText.innerHTML = list['children'][l]['children'][i]['fields'][e]['value']
            let fteTemp = ''
            fieldText.onfocus = function () {
              fteTemp = this.innerHTML
            }
            fieldText.onblur = function () {
              if (this.innerHTML != fteTemp) {
                list['children'][l]['children'][i]['fields'][e]['value'] = this.innerHTML
                listEdited(l)
              }
            }
            fieldText.onkeydown = function (e) {
              if (e.code == 'Enter') {
                this.blur();
              }
            }

            let deleteFieldRowBtn = createElement('button', { 'hide': false, 'class': 'deleteFieldBtn' })
            deleteFieldRowBtn.onclick = function () {
              deleteAccountField(l, i, e)
              listEdited(l)
            }

            // appends

            let accountFieldRow = createElement('tr', {})

            let iconTd = createElement('td', {})
            iconTd.append(fieldIcon)

            let textTd = createElement('td', {})
            textTd.append(fieldText)

            let titleTd = createElement('td', { "class": "titleTD" })
            titleTd.append(fieldTitle)

            let deleteFieldRowTd = createElement('td', { 'class': 'deleteFieldTd', 'hide': true })
            showOnEdit.push(deleteFieldRowTd)
            deleteFieldRowTd.append(deleteFieldRowBtn)

            accountFieldRow.append(iconTd)
            accountFieldRow.append(titleTd)
            accountFieldRow.append(textTd)
            accountFieldRow.append(deleteFieldRowTd)

            accountFields.append(accountFieldRow)
          }

          openAccountSettingsBtn.onclick = function () {
            // show settings
            accountSettingsDiv.style.display = null
            this.style.display = 'none'

            // set open account settings variable [list, account]
            openedAccountSettings = [l, i]

            // show fields
            accountFields.style.display = null

            collapseIcon.classList.remove('up')
            collapseIcon.classList.add('down')

            // show all tagged items
            for (let k = 0; k < showOnEdit.length; k++) {
              showOnEdit[k].style.display = null
            }

            // make elements editable
            for (let k = 0; k < editableOnEdit.length; k++) {
              editableOnEdit[k].contentEditable = true
              editableOnEdit[k].style.filter = 'none'
            }
            accountTitle.style.cursor = 'text'

          }

          if (openedAccountSettings[0] == l && openedAccountSettings[1] == i) {
            openAccountSettingsBtn.click()
          }
          accountDiv.append(accountFields)
          accountDiv.append(accountSettingsDiv)
          accountsDiv.append(accountDiv)
        }
        let accountCount = create('p', 'bottomCounter')

        searchBox.oninput = function () {
          // do search
          let accts = 0
          for (let k = 0; k < list['children'][l]['children'].length; k++) {
            listContent.querySelectorAll('.accountDiv')[k].style.display = 'none'
            if (list['children'][l]['children'][k]['name'].toLowerCase().includes(this.value.toLowerCase())) {
              listContent.querySelectorAll('.accountDiv')[k].style.display = null
              accts += 1;
            }
          }
          if (this.value == '') {
            accountCount.innerHTML = list['children'][l]['children'].length + ((list['children'][l]['children'].length == 1) ? ' Account' : ' Accounts')
          } else {
            accountCount.innerHTML = accts + ((accts == 1) ? ' Matching Account' : ' Matching Accounts') + '<br>' + list['children'][l]['children'].length + ((list['children'][l]['children'].length == 1) ? ' Account Total' : ' Accounts Total')
          }
        }

        accountCount.innerHTML = list['children'][l]['children'].length + ((list['children'][l]['children'].length == 1) ? ' Account' : ' Accounts')
        listContent.append(accountsDiv)
        listContent.append(accountCount)
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
  } catch (err) {
    // this will throw an error because it receives settings and list asynchronously 
  }

}

init()
