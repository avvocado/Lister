
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

document.getElementById("homeBtn").addEventListener("click", function () {
  for (let p = 0; p < document.getElementsByClassName('sideListBtn').length; p++) {
    document.getElementsByClassName('sideListBtn')[p].classList.remove('active')
  }
  this.classList.add('active')
  for (let k = 0; k < document.getElementsByClassName('listDiv').length; k++) {
    document.getElementsByClassName('listDiv')[k].style.display = 'none'

    document.getElementById('settings').style.display = 'none'
  }

  document.getElementById('homePageDiv').style.animation = 'fadein 500ms'
  document.getElementById('homePageDiv').style.display = null

  selectedList = -2
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
  document.getElementById('homePageDiv').style.display = 'none'

  document.getElementById('settings').style.animation = 'fadein 500ms'
  document.getElementById('settings').style.display = null

  selectedList = -1
});

// globals

var shiftDown = false
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
  let d = new Date()


  document.getElementById('date').innerHTML = week[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate()

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


  if (d.getHours() >= 5 && d.getHours() < 12) {
    // 5am-midday
    document.getElementById('hello').innerHTML = 'Good Morning'
  }
  if (d.getHours() >= 12 && d.getHours() < 17) {
    // midday-5pm
    document.getElementById('hello').innerHTML = 'Good Afternoon'
  }
  if (d.getHours() >= 17 && d.getHours() < 22) {
    // 5pm-10pm
    document.getElementById('hello').innerHTML = 'Good Evening'
  }
  if (d.getHours() >= 22 && d.getHours() < 5) {
    // 10pm-5am
    document.getElementById('hello').innerHTML = 'Good Night'
  }


  let lists = document.getElementById('lists')
  lists.innerHTML = ''


  for (let l = 0; l < Object.keys(list).length; l++) {
    // for each list
    let lockedDiv
    let sideListBtn
    // list content div
    let listDiv = create('div', 'listDiv')
    let listContent = create('div', 'listContent')
    let pswd
    if (list[l]['locked'] == true) {
      let lockedTitle = create('p', 'lockedTitle')
      lockedTitle.innerHTML = 'This List is Locked'
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
    sideListBtn.onclick = function () {

      for (let p = 0; p < document.getElementsByClassName('sideListBtn').length; p++) {
        document.getElementsByClassName('sideListBtn')[p].classList.remove('active')
      }
      this.classList.add('active')
      for (let k = 0; k < document.getElementsByClassName('listDiv').length; k++) {
        document.getElementsByClassName('listDiv')[k].style.display = 'none'
      }
      document.getElementById('homePageDiv').style.display = 'none'
      document.getElementById('settings').style.display = 'none'

      document.getElementById('settings').style.display = 'none'

      if (selectedList != l) {
        listDiv.style.animation = 'fadein 500ms'
      }
      listDiv.style.display = null


      if (list[l]['locked'] == true) {
        // if you're entering a locked list, relock it

        if (selectedList != l) {
          lockedDiv.style.display = 'block'
          listContent.style.display = 'none'
          pswd.focus()
        }
        // you're going to the same list, bypass the lock
        if (l == selectedList && lockedDiv.style.display == '') {
          lockedDiv.style.display = 'none'
          listContent.style.display = null
          sideListBtn.innerHTML = list[l]['name']
          sideListBtn.classList.remove('locked')
          sideListBtn.classList.add('unlocked')
        }

      }
      if (selectedList >= 0 && list[selectedList]['locked'] == true && selectedList != l) {
        // leaving a locked list, just change the title of sidelist btn to locked list
        document.querySelectorAll('.sideListBtn')[selectedList + 2].innerHTML = 'Locked List'
        document.querySelectorAll('.sideListBtn')[selectedList + 2].classList.remove('unlocked')
        document.querySelectorAll('.sideListBtn')[selectedList + 2].classList.add('locked')
      }
      selectedList = l
    }

    // list settings, creation date + buttons
    let listSettingsDiv = create('div', 'listSettingsDiv')
    let tdate = new Date(list[l]['creationDate'])
    let listCreationDate = create('p', 'listCreationDate')
    listCreationDate.title = (timeAgo(d.getTime(), list[l]['creationDate']))
    let mod = ''
    if (tdate.getHours() > 11) {
      mod = 'PM'
    } else {
      mod = 'AM'
    }

    let deleteListBtnDiv = create('div', '')
    let deleteListBtnTooltip = createTooltip('Delete List', 34, false)

    let deleteListBtn = create('button', 'deleteListBtn')
    deleteListBtn.onclick = function () {
      removeList(l)
    }
    deleteListBtn = handleTooltip(deleteListBtn, deleteListBtnTooltip)
    deleteListBtnDiv.append(deleteListBtnTooltip)
    deleteListBtnDiv.append(deleteListBtn)

    listCreationDate.innerHTML = months[tdate.getMonth()] + ' ' + tdate.getDate() + ", " + (tdate.getHours() % 12 || 12) + ":" + tdate.getMinutes().toString().padStart(2, '0') + " " + mod

    listSettingsDiv.append(listCreationDate)
    listSettingsDiv.append(deleteListBtnDiv)

    if (list[l]['locked'] == false) {
      // not locked yet
      let lockListBtnDiv = create('div', '')
      let lockListBtnTooltip = createTooltip('Lock List', 10, false)

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

    if (list[l]['type'] == 'default') {
      listDiv.classList.add('default')
      listContent.classList.add('default')

      let sublists = create('div', 'sublists')
      for (let i = 0; i < getListChildren(l); i++) {
        // for each sublist
        // -3 because "name" and "type"

        let sublistDiv = create('div', 'sublistDiv')
        let sublistContentDiv = document.createElement('div')

        let sublistTitleDiv = create('div', 'sublistTitleDiv')
        let newItemToTopBtn = create('button', 'newItemToTopBtn')
        newItemToTopBtn.onclick = function () {
          newItemToTop(l, i)
        }
        let sublistTitleP = document.createElement('input')
        sublistTitleP.value = list[l][i]['name']
        sublistTitleP.type = 'text'
        sublistTitleP.spellcheck = false
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
            list[l][i]['name'] = this.value
            writeJSON(list)
          }

        }

        sublistTitleDiv.append(newItemToTopBtn)
        sublistTitleDiv.append(sublistTitleP)

        let newItemBtnContainer = create('div', 'newItemBtnContainer')

        let newItemBtn = create('button', 'newItemBtn')
        newItemBtn.innerHTML = '+'
        newItemBtn.onclick = function () {
          newItemToEnd(l, i)
        }
        newItemBtnContainer.append(newItemBtn)
        sublistDiv.append(sublistTitleDiv)
        sublistDiv.append(sublistContentDiv)
        sublists.append(sublistDiv)
        listContent.append(sublists)
        listDiv.append(listContent)

        for (let e = 0; e < Object.keys(list[l][i]).length - 1; e++) {
          // -1 because "name" is a key
          let itemSettingsDiv = document.createElement('div')

          let itemDiv = document.createElement('div')
          itemDiv.className = 'item'
          // status button
          button = document.createElement('button')
          button.classList = 'statusBtn'
          if (list[l][i][e]['priority'] == true) {
            button.classList = 'statusBtn priority'
          }
          button.onmouseup = function (event) {
            if (event.button == 2) {
              // right click
              // if is complete, skip down to incomplete,
              // otherwise just cycle down like normal
              if (list[l][i][e]['status'] == 3) {
                list[l][i][e]['status'] = 1
                writeJSON(list)
              } else if (list[l][i][e]['status'] > 0) {
                list[l][i][e]['status'] -= 1
                writeJSON(list)
              }

            } else if (event.button == 0) {
              // left click, cycle up
              if (list[l][i][e]['status'] < 3) {
                list[l][i][e]['status'] += 1
                writeJSON(list)
                if (list[l][i][e]['status'] == 3 && list[l][i][e]['priority'] == false) {
                  // completed
                  let temp = list[l][i][e]
                  removeItem(l, i, e)
                  currentKeys = Object.keys(list[l][i]).length - 1
                  list[l][i][currentKeys] = temp// + 1 to add next index
                  writeJSON(list)
                  generateList()

                }
              }

            }
            this.className = 'statusBtn'
            if (list[l][i][e]['priority'] == true) {
              this.classList = 'statusBtn priority'
            }

            this.classList.add("s" + (list[l][i][e]['status']).toString())
            this.parentElement.className = 'item'
            this.parentElement.classList.add(("s" + (list[l][i][e]['status']).toString()))
          }

          button.classList.add("s" + (list[l][i][e]['status']).toString());
          itemDiv.classList.add(("s" + (list[l][i][e]['status']).toString()));
          itemDiv.append(button)

          // item title
          let itemTitle = document.createElement('p')
          itemTitle.contentEditable = true
          itemTitle.innerHTML = list[l][i][e]['title']
          itemTitle.className = 'itemTitle'
          itemTitle.spellcheck = false
          itemTitle.onkeydown = function (e) {
            if (e.code == 'Enter') {
              this.blur()
            }
          }
          let itTemp = ''
          itemTitle.onfocus = function () {
            itTemp = this.innerHTML
          }
          itemTitle.onblur = function () {
            if (this.innerHTML != itTemp) {
              list[l][i][e]['title'] = this.innerHTML
              writeJSON(list)
            }
          }
          itemDiv.append(itemTitle)

          // MORE BUTTON
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

          // ITEM media 
          if (list[l][i][e]['media'] != null && list[l][i][e]['media'] != '' && list[l][i][e]['media'] != []) {
            // if there is an media media specified
            for (let p = 0; p < list[l][i][e]['media'].length; p++) {
              // for every piece of media
              if (list[l][i][e]['media'][p].endsWith("png") || list[l][i][e]['media'][p].endsWith("jpg") || list[l][i][e]['media'][p].endsWith("jpeg") || list[l][i][e]['media'][p].endsWith("gif") || list[l][i][e]['media'][p].endsWith("webp")) {
                // if is .png .jpg .jpeg .gif .webp
                // make image
                let img = document.createElement('img')
                img.className = 'itemMedia'
                img.src = "../resources/media/" + list[l][i][e]['media'][p]
                img.alt = 'Error loading ' + list[l][i][e]['media'][p]
                if (typeof dirname === 'undefined') {
                  dirname = ''
                  console.log('dirname error')
                }
                img.title = dirname + 'resources/media/' + list[l][i][e]['media']
                img.addEventListener("dblclick", function () {
                  window.api.send('openFile', list[l][i][e]['media'][p]);
                });
                img.style.cursor = 'pointer'
                itemDiv.append(img)
              } else if (list[l][i][e]['media'][p].endsWith(".mp4") || list[l][i][e]['media'][p].endsWith(".webm")) {
                // if is .mp4 .webm 
                // make video
                let vid = document.createElement('video')
                vid.className = 'itemMedia'
                vid.controls = true
                vid.disablePictureInPicture = true
                vid.controlsList = "nodownload noremoteplayback noplaybackrate"
                vid.src = "../resources/media/" + list[l][i][e]['media'][p]
                vid.alt = 'Error loading ' + list[l][i][e]['media'][p]
                vid.title = list[l][i][e]['media'][p]
                itemDiv.append(vid)
              } else if (list[l][i][e]['media'][p].endsWith(".ogg") || list[l][i][e]['media'][p].endsWith(".wav") || list[l][i][e]['media'][p].endsWith(".mp3")) {
                // if is .ogg .wav .mp3
                // make audio 
                let aud = document.createElement('audio')
                aud.controls = true
                aud.className = 'itemMedia'
                aud.src = "../resources/media/" + list[l][i][e]['media'][p]
                itemDiv.append(aud)
              }
            }




            // delete media button
            delMediaBtnDiv = document.createElement('div')
            let delMediaBtnTooltip = createTooltip('Delete All Media', 36, true)
            let delMediaBtn = document.createElement('button')
            delMediaBtn.className = 'delMediaBtn'
            delMediaBtn = handleTooltip(delMediaBtn, delMediaBtnTooltip)
            delMediaBtn.onclick = function () {
              list[l][i][e]['media'] = []
              writeJSON(list)
              generateList()
            }
            delMediaBtnDiv.append(delMediaBtnTooltip)
            delMediaBtnDiv.append(delMediaBtn)

          }

          // ITEM DESCRIPTION
          // ADD DESCRIPTION BUTTON
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

          let setPriorityBtnDiv = document.createElement('div')
          let setPriorityBtn = document.createElement('button')

          let setPriorityBtnTooltip

          if (list[l][i][e]['priority'] == true) {
            setPriorityBtn.className = 'setPriorityBtn active'
            setPriorityBtnTooltip = createTooltip('Remove Priority', 38, true)
          } else {
            setPriorityBtn.className = 'setPriorityBtn'
            setPriorityBtnTooltip = createTooltip('Set Priority', 26, true)
          }
          setPriorityBtn.onclick = function () {
            // edit list
            list[l][i][e].priority = !list[l][i][e].priority
            if (list[l][i][e].priority == true) {
              // save item
              temp = list[l][i][e]
              // remove item
              removeItem(l, i, e)
              // re add to top
              let lastElem = Object.keys(list[l][i]).length - 2

              for (let j = lastElem; j >= 0; j--) {
                // move all items down
                list[l][i][j + 1] = list[l][i][j]
              }
              // add new item in index 0
              list[l][i][0] = temp

            }
            writeJSON(list)
            generateList()

          }
          setPriorityBtn = handleTooltip(setPriorityBtn, setPriorityBtnTooltip)
          setPriorityBtnDiv.append(setPriorityBtnTooltip)
          setPriorityBtnDiv.append(setPriorityBtn)

          let itemDescription = document.createElement('p')
          itemDescription.contentEditable = true
          itemDescription.innerHTML = list[l][i][e]['description']
          itemDescription.className = 'itemDescription'
          itemDescription.spellcheck = false
          let idTemp = ''
          itemDescription.onfocus = function () {
            idTemp = this.innerHTML
          }
          itemDescription.onblur = function () {
            if (this.innerHTML != idTemp) {
              list[l][i][e]['description'] = this.innerHTML
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

          // LINK
          if (list[l][i][e]['link'] != '' && list[l][i][e]['link'] != null) {
            let linkDiv = create('div', '')
            linkDiv.style.marginTop = '-8px'
            let openLinkBtn = create('button', 'openLinkBtn')
            openLinkBtn.title = ('https://' + list[l][i][e]['link'])
            openLinkBtn.onclick = function () {
              window.open(list[l][i][e]['link'], '_blank')
            }
            let link = create('a', 'itemLink')
            link.title = ('https://' + list[l][i][e]['link'])
            link.href = 'https://' + list[l][i][e]['link']
            link.target = '_blank'
            link.innerHTML = list[l][i][e]['link']
            linkDiv.append(link)
            linkDiv.append(openLinkBtn)
            itemDiv.append(linkDiv)
          }


          // CREATION DATE
          let cdate = new Date(list[l][i][e]['creationDate'])
          let creationDateP = create('p', 'creationDateText')
          creationDateP.title = (timeAgo(d.getTime(), list[l][i][e]['creationDate']))
          let mod = ''
          if (cdate.getHours() > 11) {
            mod = 'PM'
          } else {
            mod = 'AM'
          }

          creationDateP.innerHTML = months[cdate.getMonth()] + ' ' + cdate.getDate() + ", " + (cdate.getHours() % 12 || 12) + ":" + cdate.getMinutes().toString().padStart(2, '0') + " " + mod

          // ITEM SETTINGS DIV 
          itemSettingsDiv.style.display = 'none'
          itemSettingsDiv.className = 'itemSettingsDiv'

          // DUPLICATE ITEM BUTTON
          let duplicateItemBtnDiv = create('div', '')
          let duplicateItemBtn = create('button', 'duplicateItemBtn')
          let duplicateItemBtnTooltip = createTooltip('Duplicate Item', 32, true)
          duplicateItemBtn = handleTooltip(duplicateItemBtn, duplicateItemBtnTooltip)
          duplicateItemBtn.onclick = function () {
            moveItemsDown(l, i, e + 1)
            list[l][i][e + 1] = list[l][i][e]
            writeJSON(list)
            generateList()
          }
          duplicateItemBtnDiv.append(duplicateItemBtnTooltip)
          duplicateItemBtnDiv.append(duplicateItemBtn)

          // ADD LINK BUTTON
          let addLinkBtnDiv = create('div', '')
          let addLinkBtn = create('button', 'addLinkBtn')
          let addLinkBtnTooltip = createTooltip('Add Link', 17, true)
          addLinkBtn = handleTooltip(addLinkBtn, addLinkBtnTooltip)
          let addLinkInput = create('input', 'addLinkInput')
          addLinkInput.placeholder = 'Link'
          addLinkInput.value = list[l][i][e]['link']
          addLinkInput.style.display = 'none'
          addLinkInput.onblur = function () {
            this.value = (this.value).replaceAll(' ', '')
            list[l][i][e]['link'] = this.value.replaceAll('https://', '')
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
            delItemBtnTooltip = createTooltip('Delete Item', 42, true)
            delItemBtnTooltip.style.whiteSpace = 'nowrap'
          } else {
            delItemBtnTooltip = createTooltip('Delete Item', 28, true)
          }
          delItemBtn.onclick = function () {
            removeItem(l, i, e)
          }
          delItemBtn = handleTooltip(delItemBtn, delItemBtnTooltip)

          delItemBtnDiv.append(delItemBtnTooltip)
          delItemBtnDiv.append(delItemBtn)


          // add buttons to item settings
          itemSettingsDiv.append(mediaBtnDiv)

          if (list[l][i][e]['media'] != null && list[l][i][e]['media'] != '' && list[l][i][e]['media'] != []) {
            // if no media
            itemSettingsDiv.append(delMediaBtnDiv)
          }
          itemSettingsDiv.append(addLinkBtnDiv)

          itemSettingsDiv.append(addDescBtnDiv)
          itemSettingsDiv.append(setPriorityBtnDiv)
          itemSettingsDiv.append(duplicateItemBtnDiv)
          itemSettingsDiv.append(delItemBtnDiv)
          // link input
          itemSettingsDiv.append(addLinkInput)
          // creation date
          itemSettingsDiv.append(creationDateP)

          itemDiv.append(itemSettingsDiv)
          sublistContentDiv.append(itemDiv)

        }
        sublistContentDiv.append(newItemBtnContainer)
      }
      lists.append(listDiv)
    } else if (list[l]['type'] == 'block') {
      listDiv.classList.add('block')
      listContent.classList.add('block')
      let textDiv = create('div', 'textDiv')

      for (let a = 0; a < getListChildren(l); a++) {
        // all "blocks"
        if (list[l][a]['type'] == 'text') {
          let textBlock = create('div', 'textBlock')
          let textBlockP = create('p', 'textBlockP')
          textBlockP.spellcheck = false
          let temp = ''
          textBlockP.onfocus = function () {
            temp = this.innerHTML
          }
          textBlockP.onblur = function () {
            if (this.innerHTML != temp) {
              list[l][a]['data'] = this.innerHTML
              writeJSON(list)
            }

          }
          textBlockP.innerHTML = list[l][a]['data']
          textBlockP.contentEditable = true

          textBlock.append(textBlockP)
          textDiv.append(textBlock)

        } else if (list[l][a]['type'] == 'code') {
          let copyBtnDiv = create('div', 'copyBtnDiv')
          let codeBlock = create('div', 'codeBlock')
          let codeBlockP = create('p', 'codeBlockP')
          codeBlockP.spellcheck = false
          codeBlockP.onmouseenter = function () {
            copyBtnDiv.style.display = 'block'
          }
          codeBlock.onmouseleave = function () {
            copyBtnDiv.style.display = 'none'
          }
          let temp = ''
          codeBlockP.onfocus = function () {
            temp = this.innerHTML
          }
          codeBlockP.onblur = function () {
            if (this.innerHTML != temp) {
              list[l][a]['data'] = this.innerHTML
              writeJSON(list)
            }
          }
          codeBlockP.innerHTML = list[l][a]['data']
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
            navigator.clipboard.writeText(list[l][a]['data']).then(function () {
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
          codeBlock.append(copyBtnDiv)
          codeBlock.append(blockSettingsDiv)
          codeBlock.append(codeBlockP)
          textDiv.append(codeBlock)
        }else if(list[l][a]['tyoe'] == 'media'){
          
        }
      }

      let newBlockBtns = create('div', 'newBlockBtns')

      let newCodeBlockBtnDiv = create('div', '', '')
      let newCodeBlockBtn = create('button', 'newCodeBlockBtn', '')
      newCodeBlockBtnTooltip = createTooltip('New Code Block', 32, false)
      newCodeBlockBtn = handleTooltip(newCodeBlockBtn, newCodeBlockBtnTooltip)

      newCodeBlockBtn.onclick = function () {
        let newIndex = getListChildren(l)
        list[l][newIndex] = {
          "data": "New Code Block",
          "type": "code"
        }
        let newIndex1 = getListChildren(l)
        list[l][newIndex1] = {
          "data": "",
          "type": "text"
        }
        writeJSON(list)
        generateList()
      }
      newCodeBlockBtnDiv.append(newCodeBlockBtnTooltip)
      newCodeBlockBtnDiv.append(newCodeBlockBtn)

      listSettingsDiv.append(newCodeBlockBtnDiv)

      listContent.append(textDiv)

      textDiv.append(newBlockBtns)
      listDiv.append(listContent)
      lists.append(listDiv)


    }

  }

  try {
    document.getElementsByClassName('sideListBtn')[selectedList + 2].click()
  } catch {
    document.getElementsByClassName('sideListBtn')[selectedList + 1].click()
  }
}

init()
