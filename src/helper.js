

// handles the tooltip code
// params: item the tooltip is attached to, tooltip element
function handleTooltip(item, tool) {
  // generate the mouse enter and mouse leave functions to show and hide tooltips for buttons
  item.onmouseenter = function () {
    tool.style.display = 'block'
  }
  item.onmouseleave = function () {
    tool.style.display = 'none'
  }

  return (item)
}


// new item at the end of a default list
// params: list index, sublist index
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
    priority: false,
    link: "",
    creationDate: d.getTime(),
    reminder: {
      time: 0
    }
  }) // + 1 to add next index
  writeJSON(list)
  generateList()
}


// deletes a block in block list
// params: list index, block index
function deleteBlock(l, a) {
  // amount of items between a and the end of the sublist
  let aToEnd = (getListChildren(l)) - (a + 1)
  if (aToEnd == 0) {
    delete (list[l][a])
  } else {
    for (let j = 0; j < aToEnd; j++) {
      let index = j + 1 + a
      // index in the sublist of the items that need to be moved
      list[l][index - 1] = list[l][index]
      delete (list[l][index])
    }
  }

  writeJSON(list)
  generateList()

}

// move items down from a starting point in default list
// params: list index, sublist index, first item to move
function moveItemsDown(l, i, start) {
  let lastElem = Object.keys(list[l][i]).length - 3
  for (let j = lastElem; j >= start; j--) {
    // move all items down
    list[l][i][j + 1] = list[l][i][j]
  }
  delete (list[l][i][start])
}


// new item at top in default list
// params: list index, sublist index
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
    priority: false,
    link: "",
    creationDate: d.getTime(),
    reminder: {
      time: 0
    }
  })
  writeJSON(list)
  generateList()
}


// delete item in default list
// params: list index, sublist index, item index
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


// delete a list
// params: list index
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

  selectedList = -2
  writeJSON(list)
  generateList()
}


// helper to create elements
// params: element type, parameters as object
function create(type, className) {
  let temp = document.createElement(type)
  if (className) {
    temp.className = className
  }
  return (temp)
}


// creates a tooltip element
// params: tooltip text, x offset, if it's above or below
function createTooltip(text, xoffset, above) {
  let tooltip = document.createElement('p')
  tooltip.innerHTML = text
  tooltip.className = 'tooltip'
  if (above == true) {
    tooltip.style.transform = 'translateY(-26px) translateX(-' + xoffset + 'px)'
  } else {
    tooltip.style.transform = 'translateY(34px) translateX(-' + xoffset + 'px)'
  }
  return (tooltip)
}


// params: current time (ms), past/future time (ms)
// returns: how long ago the date was OR in how long the date is
// eg: "9 hours ago", "in 3 weeks"
function timeAgo(now, date) {
  var time = ''
  if (now - date > -1000 && now - date < 1000) {
    // within 1 second
    time = 'Now'
  }
  if (now - date > 1000 * 60 * 60 * 24 * 30) {
    // months ago, uses 30 days per month
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 30))
    if (time1 == 1) {
      time = time1 + ' month ago'
    } else {
      time = time1 + ' months ago'
    }
  } else if (now - date > 1000 * 60 * 60 * 24 * 7) {
    // weeks ago
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 7))
    if (time1 == 1) {
      time = time1 + ' week ago'
    } else {
      time = time1 + ' weeks ago'
    }
  } else if (now - date > 1000 * 60 * 60 * 24) {
    // days ago
    let time1 = Math.floor((now - date) / (1000 * 60 * 60 * 24))
    if (time1 == 1) {
      time = time1 + ' day ago'
    } else {
      time = time1 + ' days ago'
    }
  } else if (now - date > 1000 * 60 * 60) {
    // hours ago
    let time1 = Math.floor((now - date) / (1000 * 60 * 60))
    if (time1 == 1) {
      time = time1 + ' hour ago'
    } else {
      time = time1 + ' hours ago'
    }
  } else if (now - date > 1000 * 60) {
    // minutes ago
    let time1 = Math.floor((now - date) / (1000 * 60))
    if (time1 == 1) {
      time = time1 + ' minute ago'
    } else {
      time = time1 + ' minutes ago'
    }
  } else if (now - date > 1000) {
    // seconds ago
    let time1 = Math.floor((now - date) / 1000)
    if (time1 == 1) {
      time = time1 + ' second ago'
    } else {
      time = time1 + ' seconds ago'
    }
  } else if (now - date < -(1000 * 60 * 60 * 24 * 30)) {
    // in months, uses 30 days per month
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60 * 24 * 30))
    if (time1 == 1) {
      time = 'in ' + time1 + ' month'
    } else {
      time = 'in ' + time1 + ' months'
    }
  } else if (now - date < -(1000 * 60 * 60 * 24 * 7)) {
    // in weeks
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60 * 24 * 7))
    if (time1 == 1) {
      time = 'in ' + time1 + ' week'
    } else {
      time = 'in ' + time1 + ' weeks'
    }
  } else if (now - date < -(1000 * 60 * 60 * 24)) {
    // in days
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60 * 24))
    if (time1 == 1) {
      time = 'in ' + time1 + ' day'
    } else {
      time = 'in ' + time1 + ' days'
    }
  } else if (now - date < -(1000 * 60 * 60)) {
    // in hours
    let time1 = Math.floor((now - date) / -(1000 * 60 * 60))
    if (time1 == 1) {
      time = 'in ' + time1 + ' hour'
    } else {
      time = 'in ' + time1 + ' hours'
    }
  } else if (now - date < -(1000 * 60)) {
    // in minutes
    let time1 = Math.floor((now - date) / -(1000 * 60))
    if (time1 == 1) {
      time = 'in ' + time1 + ' minute'
    } else {
      time = 'in ' + time1 + ' minutes'
    }
  } else if (now - date < -1000) {
    // in seconds
    let time1 = Math.floor((now - date) / -1000)
    if (time1 == 1) {
      time = 'in ' + time1 + ' second'
    } else {
      time = 'in ' + time1 + ' seconds'
    }
  }

  return (time)

}


// creates a new list at the bottom
// params: list type
function newList(type) {
  let d = new Date()
  let newIndex = parseInt(Object.keys(list).length)
  if (type == 'default') {
    list[newIndex] = {
      "0": {
        "name": "Sublist",
      },
      "1": {
        "name": "Sublist",
      }, "2": {
        "name": "Sublist",
      },
      "name": "New List",
      "type": "default",
      "creationDate": d.getTime(),
      "locked": false,
      "lastEdited": 0
    }
  } else if (type == 'block') {
    list[newIndex] = {
      "0": {
        "data": "New List",
        "type": "text"
      },
      "name": "New Block List",
      "type": "block",
      "creationDate": d.getTime(),
      "locked": false,
      "lastEdited": 0
    }
  }
  selectedList = Object.keys(list).length - 1
  console.log(selectedList)
  writeJSON(list)
  generateList()
}

// returns how many children there are inside the list
// params: list index
function getListChildren(l) {
  // creationdate, type, locked, name, last edit date
  return (Object.keys(list[l]).length - 5)
}


// writing list.json
function writeJSON(data) {
  window.api.send('writeJSON', JSON.stringify(data))
}


// writing settings.json
function writeSettings(data) {
  window.api.send('writeSettings', JSON.stringify(data))
}


// helper to show alerts
// params: text, description, duration
function showAlert(text, dur, type) {
  let alertDiv = create('div', 'alert ' + type)
  let textElem = create('p', 'text')
  if (type != 'normal') {
    let icon = create('img', type)
    icon.src = '../assets/' + type + ".svg"
    alertDiv.append(icon)
  }
  textElem.innerHTML = text
  alertDiv.append(textElem)
  document.getElementById('info').append(alertDiv)
  let timeout = setTimeout(func, dur)
  alertDiv.onclick = function () {
    this.remove()
    clearTimeout(timeout)
  }
  function func() {
    alertDiv.remove()
  }
}


function gotoPage(me, l, listDiv, lockedDiv, listContent, pswd) {
  // -2 = no page selected
  // -1 = settings
  // >=0 = lists

  for (let p = 0; p < document.getElementsByClassName('sideListBtn').length; p++) {
    document.getElementsByClassName('sideListBtn')[p].classList.remove('active')
  }
  me.classList.add('active')
  for (let k = 0; k < document.getElementsByClassName('listDiv').length; k++) {
    document.getElementsByClassName('listDiv')[k].style.display = 'none'
  }
  document.getElementById('settings').style.display = 'none'
  document.getElementById('noListSelected').style.display = 'none'

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
    // you're going to the same list & its unlocked, bypass the lock
    if (l == selectedList) {
      console.log('bypassed lock')
      lockedDiv.style.display = 'none'
      listContent.style.display = null
      me.innerHTML = list[l]['name']
      me.classList.remove('locked')
      me.classList.add('unlocked')
    }

  }
  console.log('coming from list: ' + selectedList + ", going to list: " + l)
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
    console.log('deleted a list')
  }

  selectedList = l

}