// main.js

// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  ipcMain, dialog
} = require("electron");
const path = require("path");
const fs = require("fs");

let win
var tray
const createWindow = () => {
  // create tray
  tray = new Tray(path.join(__dirname, '../', "/assets/", '/appIcons/', 'icon18x18.png'));


  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    resizable: true,
    frame: false,
    icon: path.join(__dirname, '../', "/assets", '/appIcons', "icon.png"),
    backgroundColor: '#1B1D26',
    darkTheme: true,
    show: false
  })


  // and load the index.html of the app.
  win.loadFile(__dirname + '/index.html')

  app.setAppUserModelId(app.name);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  })

  if (process.platform !== 'darwin') {
    win.once('ready-to-show', () => {
      win.show()
    })
  } else {
    win.show()
  }


  console.log('created main window')
}

win = null
const gotTheLock = app.requestSingleInstanceLock()


if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) {
        win.restore()
      }
      win.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

ipcMain.on("close", (evt, args) => {
  app.quit();

  //win.hide()
  // new Notification({ title: 'Lister Minimized to Tray', body: '',}).show()
})

ipcMain.on("minimize", (evt, args) => {
  BrowserWindow.getFocusedWindow().minimize()
})

ipcMain.on("requestList", (evt, args) => {
  fs.readFile(path.join(__dirname, '../', '/resources/', 'list.json'), (error, data) => {
    win.webContents.send("toRenderer", "list", JSON.parse(data));
  });
})
ipcMain.on("requestSettings", (evt, args) => {
  fs.readFile(path.join(__dirname, '../', '/resources/', 'settings.json'), (error, data) => {
    win.webContents.send("toRenderer", "settings", JSON.parse(data));
  });
})

ipcMain.on("requestDefaultSettings", (evt, args) => {
  fs.readFile(path.join(__dirname, '../', '/resources/', 'defaultSettings.json'), (error, data) => {
    win.webContents.send("toRenderer", "defaultSettings", JSON.parse(data));
  });
})

ipcMain.on("writeJSON", (evt, args) => {
  console.log('wrote list.json file')
  fs.writeFile(path.join(__dirname, '../', '/resources/', 'list.json'), args, err => {
    if (err) {
      console.log(err)
    }
  })
})

ipcMain.on("writeSettings", (evt, args) => {
  fs.writeFile(path.join(__dirname, '../', '/resources/', 'settings.json'), args, err => {
    if (err) {
      console.log(err)
    }
  })
})

ipcMain.on("requestDirname", (evt, args) => {
  win.webContents.send('toRenderer', 'dirname', path.join(__dirname, '../'))
})


ipcMain.on("alwaysOnTop", (evt, args) => {
  win.setAlwaysOnTop(args);
})
ipcMain.on("uploadMedia", (evt, args) => {
  // opens a window to choose file
  dialog.showOpenDialog({
    properties: ['openFile'], filters: [
      {
        name: "",
        extensions: ['png', 'jpeg', 'jpg', 'webp', 'gif', 'mp4', 'webm', 'ogg', 'wav', 'mp3']
      },],
  }).then(result => {

    // checks if window was closed
    if (result.canceled) {
      console.log("no file was selected")
      win.webContents.send("toRenderer", null);
    } else {

      // get first element in array which is path to file selected
      let filePath = result.filePaths[0];

      // get file name
      let fileName = path.basename(filePath);

      // copy file from original location to app data folder
      fs.copyFile(filePath, path.join(__dirname, '../', '/resources/', '/media/', fileName), (err) => {
        if (err) throw err;
        win.webContents.send("toRenderer", "media", fileName);
      });
    }
  });
})
ipcMain.on("openPath", (evt, args) => {
  shell.showItemInFolder(path.join(__dirname, '../', '/resources/', args));
})
ipcMain.on("openFile", (evt, args) => {
  shell.openPath(path.join(__dirname, '../', 'resources', '/media/', args));
})

ipcMain.on("maximize", (evt, args) => {
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize();
  }
})


ipcMain.on("trayIcon", (evt, args) => {
  tray.destroy()
  if (args == true) {
    // black and white
    tray = new Tray(path.join(__dirname, '../', "/assets/", '/appIcons/', 'icon18x18BW.png'));

  } else {
    // color
    tray = new Tray(path.join(__dirname, '../', "/assets/", '/appIcons/', 'icon18x18.png'));
  }

  // open on left click on windows
  if (process.platform == 'win32') {
    tray.on('click', function () {
      tray.popUpContextMenu();
    })
  }


  let menu = Menu.buildFromTemplate([
    {
      label: 'Lister', click: function () {
        win.show();
      }
    },
    {
      label: 'Settings', click: function () {
        win.show();
        win.webContents.send("toRenderer", "openSettings", "");
      }
    },
    { type: 'separator' },
    {
      label: 'Quit', click: function () {
        app.quit();
      }
    }
  ])

  tray.setContextMenu(menu);
  tray.setToolTip('Lister')
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})