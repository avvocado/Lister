// main.js

// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  shell,
  ipcMain, dialog
} = require("electron");
const path = require("path");
const fs = require("fs");

let win

app.on('before-quit', function () {
  isQuiting = true;
});

const createWindow = () => {
  // create tray
  var tray = new Tray(path.join(__dirname, "/assets", 'icon.png'));

  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Show App', click: function () {
        win.show();
      }
    },
    {
      label: 'Quit', click: function () {
        isQuiting = true;
        app.quit();
      }
    }
  ]));
  tray.setToolTip('Lister BETA Release 4')


  // Create the browser window.
  win = new BrowserWindow({
    width: 860,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
    icon: path.join(__dirname, "/assets", "icon.png"),
    backgroundColor: '#181B23',
    show: false,
    darkTheme: true,
  })


  // and load the index.html of the app.
  win.loadFile(__dirname + '/index.html')

  // open devtools

  // show window when is completely loaded, so it isn't plain white while waiting to load
  win.once('ready-to-show', () => {
    win.show()
    console.log('done loading main window, now showing it')
  })

  if (process.platform === 'win32') {
    app.setAppUserModelId(app.name);
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  })

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
      if (win.isMinimized()) win.restore()
      if (!win.isVisible) win.show() // SHOULD RESTORE FROM TRAY WHEN OPENING ANOTHER INSTANCE
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

ipcMain.on("toMain", (evt, args, args1) => {
  if (args == 'requestJSON') {
    fs.readFile(__dirname + '/list.json', (error, data) => {
      // Do something with file contents
      // Send result back to renderer process
      win.webContents.send("toRenderer", "json", JSON.parse(data));
    });
  } else if (args == 'minimizeToTray') {
    win.hide()
    // new Notification({ title: 'Lister Minimized to Tray', body: '',}).show()
  } else if (args == 'minimize') {
    BrowserWindow.getFocusedWindow().minimize()
  } else if (args == 'writeJSON') {
    fs.writeFile(__dirname + "/list.json", args1, err => {
      if (err) {
        console.log(err)
      }
    })
  } else if (args == 'refresh') {
    win.reload()
  } else if (args == 'alwaysOnTop') {
    win.setAlwaysOnTop(args1, 'screen');
  } else if (args == 'uploadMedia') {
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
        fs.copyFile(filePath, (__dirname + "/media/" + fileName), (err) => {
          if (err) throw err;
          console.log(filePath + " copied to " + (__dirname + "/media/" + fileName));
          win.webContents.send("toRenderer", "media", fileName);
        });
      }
    });
  } else if (args == 'openPath') {
    // open media folder
    // doesn't open the folder...
    shell.showItemInFolder(path.join(__dirname, '/media/', args1));

  } else if (args == 'openFile') {
    // open the media of an item with default windows program
    shell.openPath(path.join(__dirname, '/media/', args1));
  }



  console.log('main process received [' + args + '], [' + args1 + '] from renderer process')
});



app.on('window-all-closed', () => {
  // close app if all windows are closed
  app.quit()
})