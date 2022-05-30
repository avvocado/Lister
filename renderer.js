

// event listeners
document.getElementById("closeBtn").addEventListener("click", function () {
  window.api.send('toMain', 'minimizeToTray', null);
});

document.getElementById("minimizeBtn").addEventListener("click", function () {
  window.api.send('toMain', 'minimize', null);
});

document.getElementById("refreshBtn").addEventListener("click", function () {
  window.api.send('toMain', 'refresh', null);
});

document.getElementById("newListBtn").addEventListener("click", function () {
  let newIndex = parseInt(Object.keys(list).length)
  list[newIndex] = {
    "name": "New List",
    "0": {
      "name": "Sublist",
    },
    "1": {
      "name": "Sublist",
    }, "2": {
      "name": "Sublist",
    }
  }
  writeJSON(list)
  generateList()
});

document.getElementById('alwaysOnTopCheckbox').addEventListener('input', function () {
  window.api.send('toMain', 'alwaysOnTop', this.checked);
});

document.getElementById('toTopBtn').addEventListener('click', function () {
  window.scrollTo(0, 0);
});

document.getElementById("settingsBtn").addEventListener("click", function () {
  if (document.getElementById('settings').style.display == 'none') {
    document.getElementById('settings').style.display = 'block'
    window.scrollTo(0, 0);
  } else {
    document.getElementById('settings').style.display = 'none'
  }
});


const months = ['January', "February", 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
// const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

var currImgIndex = [0, 0, 0]

// basic Windows notification with title, body, and media
function notification(title, body, img) {
  console.log(img)
  if (img == null || img == '' || img.endsWith('ogg') || img.endsWith('wav') || img.endsWith('mp3')) {
    // no media or is audio file
    img = "assets/icon.png"
  } else {
    img = 'media/' + img
  }
  new Notification(title, {
    body: body,
    icon: img,
  })
}

var list

function init() {

  // request the json
  // uses toMain, which sends data to the main process
  window.api.send("toMain", 'requestJSON', null);
  // wait for main to send back the json
}

// receiving info from main process
window.api.receive("toRenderer", (args, data) => {
  if (args == 'json') {
    console.log('Received [' + data + '] from main process');
    list = data
    generateList()
  }
  if (args == 'media') {
    // data is an array of media names
    list[currImgIndex[0]][currImgIndex[1]][currImgIndex[2]]['media'].push(data)
    writeJSON(list)
    generateList()
    console.log('Received [' + data + '] from main process');
  }
});

function writeJSON(data) {
  window.api.send('toMain', 'writeJSON', JSON.stringify(data))
}

function generateList() {
  let lists = document.getElementById('lists')
  lists.innerHTML = ''

  for (let l = 0; l < Object.keys(list).length; l++) {
    let listDiv = create('div', 'listDiv', '')
    let listTitleDiv = create('div', 'listTitleDiv', '')
    let listTitle = create('p', 'listTitle', '')

    listTitle.contentEditable = true
    let ltTemp = ''
    listTitle.onfocus = function () {
      ltTemp = this.innerText
    }
    listTitle.onblur = function () {
      if (this.innerText != ltTemp) {
        list[l]['name'] = this.innerText
        writeJSON(list)
      }
    }
    listTitle.innerHTML = list[l]['name']
    let deleteListBtn = create('button', 'deleteListBtn', ('Delete "' + list[l]['name'] + '"'))
    deleteListBtn.onclick = function () {
      removeList(l)
    }
    let collapseListBtn = create('button', 'collapseBtn down', ('Collapse "' + list[l]['name'] + '"'))
    collapseListBtn.onclick = function () {
      if (listDiv.style.display == 'none') {
        this.classList = 'collapseBtn down'
        listDiv.style.display = 'flex'
        collapseListBtn.title = 'Collapse "' + list[l]['name'] + '"'
      } else {
        this.classList = 'collapseBtn up'
        collapseListBtn.title = 'Show "' + list[l]['name'] + '"'
        listDiv.style.display = 'none'
      }
    }
    listTitleDiv.append(collapseListBtn)
    listTitleDiv.append(deleteListBtn)
    listTitleDiv.append(listTitle)
    lists.append(listTitleDiv)

    for (let i = 0; i < Object.keys(list[l]).length - 1; i++) {
      // -1 because "name" is a key

      // current parent key
      let sublistDiv = create('div', 'sublistDiv', '')
      let sublistContentDiv = document.createElement('div')

      let sublistTitleDiv = create('div', 'sublistTitleDiv', '')
      let newItemToTopBtn = create('button', 'newItemToTopBtn', 'New Item to Top')
      newItemToTopBtn.onclick = function () {
        newItemToTop(l, i)
      }
      let sublistTitleP = document.createElement('p')
      sublistTitleP.innerHTML = list[l][i]['name']
      sublistTitleP.contentEditable = true
      sublistTitleP.spellcheck = false
      // only update list and writejson if it actually changed
      let stpTemp = ''
      sublistTitleP.onfocus = function () {
        stpTemp = this.innerText
      }
      sublistTitleP.onblur = function () {
        if (this.innerText != stpTemp) {
          list[l][i]['name'] = this.innerText
          writeJSON(list)
        }

      }

      let collapseSublistBtn = create('button', 'collapseBtn down', ('Collapse "' + list[l][i]['name'] + '" (' + (Object.keys(list[l][i]).length - 1) + ")"))
      collapseSublistBtn.onclick = function () {
        if (sublistContentDiv.style.display == 'none') {
          this.classList = 'collapseBtn down'
          sublistContentDiv.style.display = 'block'
          collapseSublistBtn.title = 'Collapse "' + list[l][i]['name'] + '"'
        } else {
          this.classList = 'collapseBtn up'
          sublistContentDiv.style.display = 'none'
          collapseSublistBtn.title = 'Show "' + list[l][i]['name'] + '"'
        }
      }
      sublistTitleDiv.append(collapseSublistBtn)
      sublistTitleDiv.append(newItemToTopBtn)
      sublistTitleDiv.append(sublistTitleP)

      let newItemBtn = create('button', 'newItemBtn', 'New Item to Bottom')
      newItemBtn.innerHTML = '+'
      newItemBtn.onclick = function () {
        newItemToEnd(l, i)
      }
      sublistDiv.append(sublistTitleDiv)
      sublistDiv.append(sublistContentDiv)
      listDiv.append(sublistDiv)

      for (let e = 0; e < Object.keys(list[l][i]).length - 1; e++) {
        // -1 because "name" is a key

        let itemDiv = document.createElement('div')
        itemDiv.className = 'item'

        // status button
        button = document.createElement('button')
        button.classList = 'statusBtn'
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
              if (list[l][i][e]['status'] == 3) {
                // completed
                let temp = list[l][i][e]
                removeItem(l, i, e)
                currentKeys = Object.keys(list[l][i]).length - 1 // -1 because "name" is one
                list[l][i][currentKeys] = temp// + 1 to add next index
                writeJSON(list)
                generateList()

              }
            }

          }
          this.className = 'statusBtn'

          this.classList.add("s" + (list[l][i][e]['status']).toString())
          this.parentElement.className = 'item'
          this.parentElement.classList.add(("s" + (list[l][i][e]['status']).toString()))

          if (list[l][i][e]['status'] == 0) {
            this.title = 'Paused'
          } else if (list[l][i][e]['status'] == 1) {
            this.title = 'Incomplete'
          } else if (list[l][i][e]['status'] == 2) {
            this.title = 'In Progress'
          } else if (list[l][i][e]['status'] == 3) {
            this.title = 'Completed'
          }
        }
        if (list[l][i][e]['status'] == 0) {
          button.title = 'Paused'
        } else if (list[l][i][e]['status'] == 1) {
          button.title = 'Incomplete'
        } else if (list[l][i][e]['status'] == 2) {
          button.title = 'In Progress'
        } else if (list[l][i][e]['status'] == 3) {
          button.title = 'Completed'
        }


        button.className = 'statusBtn'
        button.classList.add("s" + (list[l][i][e]['status']).toString());
        itemDiv.classList.add(("s" + (list[l][i][e]['status']).toString()));
        itemDiv.append(button)

        // item title
        let itemTitle = document.createElement('p')
        itemTitle.contentEditable = true
        itemTitle.innerHTML = list[l][i][e]['title']
        itemTitle.className = 'itemTitle'
        itemTitle.spellcheck = false
        let itTemp = ''
        itemTitle.onfocus = function () {
          itTemp = this.innerText
        }
        itemTitle.onblur = function () {
          if (this.innerText != itTemp) {
            list[l][i][e]['title'] = this.innerText
            writeJSON(list)
          }
        }
        itemDiv.append(itemTitle)

        // MORE BUTTON
        let itemSettingsDiv = document.createElement('div')
        let moreBtn = document.createElement('button')
        moreBtn.className = 'moreBtn'
        moreBtn.title = 'Item Settings'
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

        // open media folder btn
        let openMediaFolderBtnDiv = document.createElement('div')
        let openMediaFolderBtnTooltip = createTooltip('Open Media in Folder', 50)
        let openMediaFolderBtn = document.createElement('button')
        openMediaFolderBtn.className = 'openMediaFolderBtn'
        openMediaFolderBtn = handleTooltip(openMediaFolderBtn, openMediaFolderBtnTooltip)
        openMediaFolderBtn.onclick = function () {
          window.api.send('toMain', 'openPath', list[l][i][e]['media'][0]);

        }
        openMediaFolderBtnDiv.append(openMediaFolderBtnTooltip)
        openMediaFolderBtnDiv.append(openMediaFolderBtn)
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
              img.src = "media/" + list[l][i][e]['media'][p]
              img.alt = 'Error loading ' + list[l][i][e]['media'][p]
              img.title = list[l][i][e]['media'] + "\nDouble Click to Open"
              img.addEventListener("dblclick", function () {
                window.api.send('toMain', 'openFile', list[l][i][e]['media'][p]);
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
              vid.src = "media/" + list[l][i][e]['media'][p]
              vid.alt = 'Error loading ' + list[l][i][e]['media'][p]
              vid.title = list[l][i][e]['media'][p]
              itemDiv.append(vid)
            } else if (list[l][i][e]['media'][p].endsWith(".ogg") || list[l][i][e]['media'][p].endsWith(".wav") || list[l][i][e]['media'][p].endsWith(".mp3")) {
              // if is .ogg .wav .mp3
              // make audio 
              let aud = document.createElement('audio')
              aud.controls = true
              aud.className = 'itemMedia'
              aud.src = "media/" + list[l][i][e]['media'][p]
              itemDiv.append(aud)
            }
          }




          // delete media button
          delMediaBtnDiv = document.createElement('div')
          let delMediaBtnTooltip = createTooltip('Delete All Media', 36)
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
        let addDescBtnTooltip = createTooltip('Add Description', 36)
        addDescBtn.onclick = function () {
          itemDescription.style.display = 'block'
          addDescBtnDiv.style.display = 'none'
          itemDescription.focus()
        }
        addDescBtn = handleTooltip(addDescBtn, addDescBtnTooltip)
        addDescBtnDiv.append(addDescBtnTooltip)
        addDescBtnDiv.append(addDescBtn)

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
            if (this.innerText.replaceAll(" ", '').replaceAll("\n", '').replaceAll('<br>', '') == '') {
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
          let linkDiv = create('div', '', '')
          linkDiv.style.marginTop = '-8px'
          let openLinkBtn = create('button', 'openLinkBtn', ('https://' + list[l][i][e]['link']))
          openLinkBtn.onclick = function () {
            window.open(list[l][i][e]['link'], '_blank')
          }
          let link = create('a', 'itemLink', ('https://' + list[l][i][e]['link']))
          link.href = 'https://' + list[l][i][e]['link']
          link.target = '_blank'
          link.innerHTML = list[l][i][e]['link']
          linkDiv.append(openLinkBtn)
          linkDiv.append(link)
          itemDiv.append(linkDiv)
        }

        // REMINDERS
        let d = new Date()
        let reminderDiv = document.createElement('div')
        reminderDiv.className = 'reminderDiv'
        reminderDiv.style.display = 'none'
        let reminderBtnDiv = document.createElement('div')
        let reminderBtnTooltip = createTooltip('Add Reminder', 32)
        let reminderBtn = document.createElement('button')
        reminderBtn.className = 'reminderBtn'
        reminderBtn = handleTooltip(reminderBtn, reminderBtnTooltip)
        reminderBtn.onclick = function () {
          // toggle set reminder div
          if (reminderDiv.style.display == 'none') {
            reminderDiv.style.display = 'block'
          } else {
            reminderDiv.style.display = 'none'
          }
        }
        reminderBtnDiv.append(reminderBtnTooltip)
        reminderBtnDiv.append(reminderBtn)

        if (!(d.getTime() > list[l][i][e]['reminder']['time'])) {
          // if reminder date has not already passed
          // create a timer for when the reminder should be sent out
          let timeout = setTimeout(() => {
            // send notification
            notification(list[l][i][e]['title'], list[l][i][e]['description'], list[l][i][e]['media'][0]);
            generateList()
            reminderBtn.className = 'reminderBtn'
          }, list[l][i][e]['reminder']['time'] - d.getTime());

          reminderBtn.classList.add('active')

          // reminder will stay on through app closes because the reminder time is stored in JSON
          // if the app was closed when reminder shouldve gone off, it will just stay like that until a new one is issued

          console.log('reminder on for ' + list[l][i][e]['reminder']['time'])

          // html for reminder
          let clearReminderBtn = document.createElement('button')
          clearReminderBtn.className = 'clearReminderButton'
          clearReminderBtn.innerHTML = 'Clear Reminder'
          clearReminderBtn.onclick = function () {
            // set the reminder time to 0
            list[l][i][e]['reminder']['time'] = 0
            clearTimeout(timeout)
            // send to json and regenerate the list to display proper buttons for an item with no reminder
            writeJSON(list)
            generateList()
          }
          let currentReminder = document.createElement('p')
          currentReminder.innerHTML = "Reminder set for " + ((new Date(list[l][i][e]['reminder']['time'])).toLocaleString()).toString()
          currentReminder.className = 'currentReminder'
          reminderDiv.append(currentReminder)
          reminderDiv.append(clearReminderBtn)

        } else {
          // no reminder for this item

          // set reminder buttons, only add these if there is not a current reminder active
          let reminder5m = document.createElement('button')
          reminder5m.className = 'setReminderBtn'
          reminder5m.innerHTML = '5m'
          reminder5m.onclick = function () {
            d = new Date()
            list[l][i][e]['reminder']['time'] = d.getTime() + (3000)
            writeJSON(list)
            generateList()
          }
          let reminder15m = document.createElement('button')
          reminder15m.className = 'setReminderBtn'
          reminder15m.innerHTML = '15m'
          reminder15m.onclick = function () {
            list[l][i][e]['reminder']['time'] = d.getTime() + (15 * 60000)
            writeJSON(list)
            generateList()
          }
          let reminder30m = document.createElement('button')
          reminder30m.className = 'setReminderBtn'
          reminder30m.innerHTML = '30m'
          reminder30m.onclick = function () {
            list[l][i][e]['reminder']['time'] = d.getTime() + (30 * 60000)
            writeJSON(list)
            generateList()
          }
          let reminder1hr = document.createElement('button')
          reminder1hr.className = 'setReminderBtn'
          reminder1hr.innerHTML = '1hr'
          reminder1hr.onclick = function () {
            list[l][i][e]['reminder']['time'] = d.getTime() + (60 * 60000)
            writeJSON(list)
            generateList()
          }
          reminderDiv.append(reminder5m)
          reminderDiv.append(reminder15m)
          reminderDiv.append(reminder30m)
          reminderDiv.append(reminder1hr)
        }


        // CREATION DATE
        if (list[l][i][e]['creationDate'] == 0 || list[l][i][e]['creationDate'] == null || list[l][i][e]['creationDate'] == '') {
          // will set bugged/broken dates to now
          list[l][i][e]['creationDate'] = d.getTime()
        }
        let cdate = new Date(list[l][i][e]['creationDate'])
        let creationDateP = create('p', 'creationDateText', (timeAgo(d.getTime(), list[l][i][e]['creationDate'])))
        let mod = ''
        if (cdate.getHours() > 11) {
          mod = 'PM'
        } else {
          mod = 'AM'
        }

        creationDateP.innerHTML = months[cdate.getMonth()] + ' ' + cdate.getDate() + ", " + (cdate.getHours() % 12 || 12) + ":" + cdate.getMinutes().toString().padStart(2, '0') + " " + mod
        itemDiv.append(creationDateP)

        // ITEM SETTINGS DIV 
        itemSettingsDiv.style.display = 'none'
        itemSettingsDiv.className = 'itemSettingsDiv'

        // DUPLICATE ITEM BUTTON
        let duplicateItemBtnDiv = create('div', '', '')
        let duplicateItemBtn = create('button', 'duplicateItemBtn', '')
        let duplicateItemBtnTooltip = createTooltip('Duplicate Item', 32)
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
        let addLinkBtnDiv = create('div', '', '')
        let addLinkBtn = create('button', 'addLinkBtn', '')
        let addLinkBtnTooltip = createTooltip('Add Link', 17)
        addLinkBtn = handleTooltip(addLinkBtn, addLinkBtnTooltip)
        let addLinkInput = create('input', 'addLinkInput', '')
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
        let mediaBtn = create('button', 'uploadMediaBtn', '')
        let mediaBtnTooltip = createTooltip('Upload Media', 20)
        mediaBtn.onclick = function () {
          window.api.send("toMain", "uploadMedia", null);
          // wait for main to send back the media name
          currImgIndex = [l, i, e]
        }
        mediaBtn = handleTooltip(mediaBtn, mediaBtnTooltip)
        mediaBtnDiv.append(mediaBtnTooltip)
        mediaBtnDiv.append(mediaBtn)

        // DELETE ITEM BUTTON
        let delItemBtn = document.createElement('button')
        delItemBtn.className = 'deleteItemBtn'
        delItemBtnDiv = document.createElement('div')
        let delItemBtnTooltip = createTooltip('Delete Item', 24)
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
          itemSettingsDiv.append(openMediaFolderBtnDiv)
        }
        itemSettingsDiv.append(addLinkBtnDiv)

        itemSettingsDiv.append(addDescBtnDiv)
        itemSettingsDiv.append(reminderBtnDiv)
        itemSettingsDiv.append(duplicateItemBtnDiv)
        itemSettingsDiv.append(delItemBtnDiv)
        // reminder settings
        itemSettingsDiv.append(reminderDiv)
        // link input
        itemSettingsDiv.append(addLinkInput)

        itemDiv.append(itemSettingsDiv)
        sublistContentDiv.append(itemDiv)

      }
      sublistContentDiv.append(newItemBtn)
    }
    lists.append(listDiv)
  }
}

function handleTooltip(item, tool) {
  // generate the mouse enter and mouse leave functions to show and hide tooltips for buttons
  item.onmouseenter = function () {
    tool.style.opacity = '100%'
  }
  item.onmouseleave = function () {
    tool.style.opacity = '0%'
  }

  return (item)
}

function newItemToEnd(l, i) {
  // l = main list
  // i = sublist
  d = new Date
  currentKeys = Object.keys(list[l][i]).length - 1 // -1 because "name" is one
  list[l][i][currentKeys] = ({
    title: "Title",
    media: [],
    description: "",
    status: 1,
    link: "",
    creationDate: d.getTime(),
    reminder: {
      time: 0
    }
  }) // + 1 to add next index
  writeJSON(list)
  generateList()
}

function moveItemsDown(l, i, start) {
  let lastElem = Object.keys(list[l][i]).length - 2
  for (let j = lastElem; j >= start; j--) {
    // move all items down
    list[l][i][j + 1] = list[l][i][j]
  }
  delete (list[l][i][start])
}

function newItemToTop(l, i) {
  let lastElem = Object.keys(list[l][i]).length - 2
  for (let j = lastElem; j >= 0; j--) {
    // move all items down
    list[l][i][j + 1] = list[l][i][j]
  }
  // add new item in index 0
  let d = new Date()
  list[l][i][0] = ({
    title: "Title",
    media: [],
    description: "",
    status: 1,
    link: "",
    creationDate: d.getTime(),
    reminder: {
      time: 0
    }
  })
  writeJSON(list)
  generateList()
}

function removeItem(l, i, e) {
  // amount of items between e and the end of the sublist
  let eToEnd = (Object.keys(list[l][i]).length - 1) - (e + 1)
  if (eToEnd == 0) {
    delete (list[l][i][e])
  } else {
    for (let j = 0; j < eToEnd; j++) {
      let index = j + 1 + e
      // index in the sublist of the items that need to be moved
      list[l][i][index - 1] = list[l][i][index]
      delete (list[l][i][index])
    }
  }

  writeJSON(list)
  generateList()
}

function removeList(l) {
  let lToEnd = (Object.keys(list).length - 1) - l
  if (lToEnd == 0) {
    delete (list[l])
  } else {
    for (let j = 0; j < lToEnd; j++) {
      let index = j + 1 + l
      // index in the sublist of the items that need to be moved
      list[index - 1] = list[index]
      delete (list[index])
    }
  }

  writeJSON(list)
  generateList()
}

// helper to create element with class name
function create(type, className, title) {
  let temp = document.createElement(type)
  if (title != '') {
    temp.title = title
  }
  if (className != '') {
    temp.className = className
  }
  return (temp)
}

function createTooltip(text, xoffset) {
  let tooltip = document.createElement('p')
  tooltip.innerHTML = text
  tooltip.className = 'tooltip'
  tooltip.style.transform = 'translateY(-26px) translateX(-' + xoffset + 'px)'
  return (tooltip)
}

function timeAgo(now, date) {
  var time = ''
  if (now - date > 1000 * 60 * 60 * 24 * 30) {
    // month, uses 30 days per month
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30))
    if (time1 == 1) {
      time = time1 + ' month ago'
    } else {
      time = time1 + ' months ago'
    }
  } else if (now - date > 1000 * 60 * 60 * 24 * 7) {
    // week
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 7))
    if (time1 == 1) {
      time = time1 + ' week ago'
    } else {
      time = time1 + ' weeks ago'
    }
  } else if (now - date > 1000 * 60 * 60 * 24) {
    // day
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (time1 == 1) {
      time = time1 + ' day ago'
    } else {
      time = time1 + 'days ago'
    }
  } else if (now - date > 1000 * 60 * 60) {
    // hour
    let time1 = Math.floor((now - date) / (1000 * 60 * 60))
    if (time1 == 1) {
      time = time1 + ' hour ago'
    } else {
      time = time1 + ' hours ago'
    }
  } else if (now - date > 1000 * 60) {
    // minute
    let time1 = Math.floor((now - date) / (1000 * 60))
    if (time1 == 1) {
      time = time1 + ' minute ago'
    } else {
      time = time1 + ' minutes ago'
    }
  } else if (now - date > 1000) {
    // seconds
    let time1 = Math.floor((now - date) / 1000)
    if (time1 == 1) {
      time = time1 + ' second ago'
    } else {
      time = time1 + ' seconds ago'
    }
  } else if (now - date < 1000) {
    // now
    time = 'Now'
  }

  return (time)

}

init()