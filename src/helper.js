

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

// creates a new account
function newAccount(l) {
  list['children'][l]['children'].push({
    "name": "",
    "fields": []
  })
}

function newAccountField(l, i) {
  list['children'][l]['children'][i]['fields'].push({
    "title": "",
    "value": ""
  })
}

function deleteAccountField(l, i, e) {
  list['children'][l]['children'][i]['fields'].splice(e, 1);
  writeJSON(list)
  generateList()
}

function deleteAccount(l, i) {
  list['children'][l]['children'].splice(i, 1);
  writeJSON(list)
  generateList()
}

// creates a new sublist
function newSublist(l) {
  list['children'][l]['children'].push({
    "name": "SUBLIST",
    "children": []
  })
}

function newChecklistSublist(l) {
  let d = new Date()
  list['children'][l]['children'].push({
    "name": "SUBLIST",
    "children": [{ "text": "", "checked": false, "creationDate": d.getTime() }]
  })
}

// deletes a block in text list
function deleteBlock(l, a) {
  list['children'][l]['children'].splice(a, 1);
  writeJSON(list)
  generateList()
}

// creates a new item at the top of a block list
function newItemToTop(l, i) {
  // add new item in index 0
  let d = new Date()
  list['children'][l]['children'][i]['children'].unshift({
    title: "",
    media: [],
    description: "",
    color: 3,
    starred: false,
    link: "",
    creationDate: d.getTime(),
  })
  writeJSON(list)
  generateList()
}

// creates a new item at the top of a checklist list
function newChecklistItemToBottom(l, i) {
  // add new item in index 0
  let d = new Date()
  list['children'][l]['children'][i]['children'].push({
    text: "",
    checked: false,
    creationDate: d.getTime(),
  })
  writeJSON(list)
  generateList()
}


// delete item in checklist
function deleteChecklistItem(l, i, e) {
  list['children'][l]['children'][i]['children'].splice(e, 1);
  writeJSON(list)
  generateList()
}

// delete item in block list
function removeItem(l, i, e) {
  list['children'][l]['children'][i]['children'].splice(e, 1);
  writeJSON(list)
  generateList()
}

// delete a list
function removeList(l) {

  list['children'].splice(l, 1);

  selectedList = -2
  writeJSON(list)
  generateList()
}

function listEdited(l) {
  d = new Date()
  list['children'][l]['lastEdited'] = d.getTime()

  let temp = list['children'][selectedList]

  list['children'].sort((a, b) => Number(b.lastEdited) - Number(a.lastEdited));

  selectedList = list['children'].indexOf(temp)

  generateList()
  document.querySelectorAll('.sideListBtn')[1].click()
}

// helper to create elements
function create(type, className) {
  let temp = document.createElement(type)
  if (className) {
    temp.className = className
  }
  return (temp)
}


// creates a tooltip element
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

// creates a new list at the bottom
// params: list type
function newList(type) {
  let d = new Date()
  if (type == 'block') {
    list['children'].unshift({
      "children": [
        { "name": "SUBLIST", "children": [] },
        { "name": "SUBLIST", "children": [] },
        { "name": "SUBLIST", "children": [] }
      ],
      "name": "New List",
      "type": "block",
      "creationDate": d.getTime(),
      "locked": false,
      "lastEdited": d.getTime()
    })
  } else if (type == 'text') {
    list['children'].unshift({
      "children": [{ "data": "", "type": "text" }],
      "name": "New Text List",
      "type": "text",
      "creationDate": d.getTime(),
      "locked": false,
      "lastEdited": d.getTime()
    })
  }
  else if (type == 'checklist') {
    list['children'].unshift({
      "children": [
        { "name": "SUBLIST", "children": [{ "text": "", "checked": false, "creationDate": d.getTime() }] }
      ],
      "name": "New Checklist",
      "creationDate": d.getTime(),
      "type": "checklist",
      "locked": false,
      "lastEdited": d.getTime()
    })
  }
  else if (type == 'accounts') {
    list['children'].unshift({
      "children": [],
      "name": "Accounts",
      "creationDate": d.getTime(),
      "type": "accounts",
      "locked": false,
      "lastEdited": d.getTime()
    })
  }
  selectedList = Object.keys(list).length - 1
  console.log(selectedList)
  writeJSON(list)
  generateList()
}
// writing list.json
function writeJSON(data) {
  window.api.send('writeJSON', JSON.stringify(data))
}


// writing settings.json
function writeSettings(data) {
  window.api.send('writeSettings', JSON.stringify(data))
}


// show alerts
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
  function func() {
    alertDiv.remove()
  }
}

// takes in an hour 0-24 and returns if that's am or pm in 12 hour time
function getAmPm(time) {
  let mod = ''
  if (time.getHours() > 11) {
    mod = 'PM'
  } else {
    mod = 'AM'
  }
  return (mod)
}

// sends item to the top of that sublist
function sendItemToTop(l, i, e) {
  list['children'][l]['children'][i]['children'].unshift(list['children'][l]['children'][i]['children'].splice(e, 1)[0]);
}

// deletes a sublist
function deleteSublist(l, a) {
  list['children'][l]['children'].splice(a, 1);
  writeJSON(list)
  generateList()
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