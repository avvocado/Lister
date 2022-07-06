
// receiving data from main.js

window.api.receive("list", (args) => {
  list = args
  generateList()
})

window.api.receive("settings", (args) => {
  // settings json
  settings = args

  // load settings
  document.getElementById('alwaysOnTopCheckbox').checked = settings['alwaysOnTop']
  window.api.send('alwaysOnTop', settings['alwaysOnTop']);

  document.getElementById('bwtrayiconCheckbox').checked = settings['bwTrayIcon']
  window.api.send('trayIcon', settings['bwTrayIcon']);

  // block list item media width
  document.getElementById('blockListItemMediaWidth').value = settings['blockListItemMediaWidth'] / 10
  document.querySelector('#mediaWidthTitle').innerHTML = 'Media Width (' + (settings['blockListItemMediaWidth']) + '%)'
  for (let i = 0; i < document.querySelectorAll('.itemMedia').length; i++) {
    document.querySelectorAll('.itemMedia')[i].style.width = settings['blockListItemMediaWidth'] + '%'
  }

  // checked item style
  document.querySelectorAll(".checkedItemStyleBtn")[settings['checkedItemStyle']].click()

  // spellcheck
  document.getElementById('spellcheckToggle').checked = settings['spellcheck']


  document.getElementById('password').value = settings['password']
  console.log(settings)
  generateList()
})

window.api.receive("media", (args) => {
  list['children'][currImgIndex[0]]['children'][currImgIndex[1]]['children'][currImgIndex[2]]['media'].push(args)
  writeJSON(list)
  generateList()
})

window.api.receive("defaultSettings", (args) => {
  defaultSettings = args
})

window.api.receive("system", (args) => {
  system = args

  // do system info in settings
  let idv = document.querySelector('#appinfo')
  idv.innerHTML += '<p>Lister: 0.0.0</p>'
  idv.innerHTML += '<p>Running:</p>'
  idv.innerHTML += '<p>Electron: ' + system.versions.electron + '</p>'
  idv.innerHTML += '<p>Chromium: ' + system.versions.chrome + '</p>'
  idv.innerHTML += '<p>Node: ' + system.versions.node + '</p>'

  console.log(system)
})

window.api.receive("touchID", (args) => {
  if (args == true) {
    document.querySelectorAll('.listDiv')[awaitUnlock].children[0].children[2].value = settings['password']
    //                                               .lockedDiv  .pswdInput
    document.querySelectorAll('.listDiv')[awaitUnlock].children[0].children[3].click()
    //                                               .lockedDiv  .pswdSubmit
    // does a fake unlock where it sets the password input text to the correct password then clicks submit
  }
})

window.api.receive("openSettings", (args) => {
  document.querySelector('#settingsBtn').click()
})