// main.js

// Modules to control application life and create native browser window
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  shell,
  ipcMain,
  dialog,
  ShareMenu,
  systemPreferences,
  nativeTheme,
} = require("electron");
const path = require("path");
const fs = require("fs");

let win;
var tray;
const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      webSecurity: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    resizable: true,
    frame: false,
    icon: path.join(__dirname, "../", "/assets", "/appicons", "appicon_1024x1024.png"),
    backgroundColor: "#181b1f",
    darkTheme: true,
    show: false,
    titleBarStyle: "hidden" /* inset the macos buttons */,
  });

  // and load the index.html of the app.
  win.loadFile(__dirname + "/index.html");

  app.setAppUserModelId(app.name);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  console.log("created main window");
};

win = null;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      console.log("2nd instance opened, focusing main one");
      if (win.isMinimized()) {
        win.restore();
      }
      win.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

ipcMain.on("minimize", (evt, args) => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on("close", (evt, args) => {
  // kill tray icon
  tray.destroy();

  // quit the app
  app.quit();

  //win.hide()
  // new Notification({ title: 'Lister Minimized to Tray', body: '',}).show()
});

ipcMain.on("requestFiles", (evt, args) => {
  fs.readFile(path.join(__dirname, "../", "/resources/", "files.json"), (err, data) => {
    // return the contents of files.json
    try {
      win.webContents.send("files", JSON.parse(data));
    } catch (err) {
      win.webContents.send("error", 'Error in "files.json":<br>' + err);
    }
  });
});

ipcMain.on("requestDrafts", (evt, args) => {
  fs.readFile(path.join(__dirname, "../", "/resources/", "drafts.json"), (err, data) => {
    // return the contents of drafts.json
    try {
      win.webContents.send("drafts", JSON.parse(data));
    } catch (err) {
      win.webContents.send("error", 'Error in "drafts.json":<br>' + err);
    }  });
});

ipcMain.on("requestSettings", (evt, args) => {
  fs.readFile(path.join(__dirname, "../", "/resources/", "settings.json"), (err, data) => {
    // return the contents of settings.json
    try {
      win.webContents.send("settings", JSON.parse(data));
    } catch (err) {
      win.webContents.send("error", 'Error in "settings.json":<br>' + err);
    }  });
});

ipcMain.on("writeFiles", (evt, args) => {
  fs.writeFile(path.join(__dirname, "../", "/resources/", "files.json"), args, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

ipcMain.on("writeDrafts", (evt, args) => {
  fs.writeFile(path.join(__dirname, "../", "/resources/", "drafts.json"), args, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

ipcMain.on("writeSettings", (evt, args) => {
  fs.writeFile(path.join(__dirname, "../", "/resources/", "settings.json"), args, (err) => {
    if (err) {
      console.log(err);
    }
  });
});

ipcMain.on("createTray", (evt, args) => {
  if (tray != null) {
    tray.destroy();
  }
  if (process.platform == "win32") {
    tray = new Tray(path.join(__dirname, "../", "/assets/appicons/appicon_1024x1024.png"));
  } else if (process.platform == "darwin") {
    tray = new Tray(path.join(__dirname, "../", "/assets/appicons/trayicon@2x.png"));
  } else {
    tray = new Tray(path.join(__dirname, "../", "/assets/appicons/appicon_1024x1024.png"));
  }

  // open on left click on windows
  if (process.platform == "win32") {
    tray.on("click", function () {
      tray.popUpContextMenu();
    });
  }

  let menu = Menu.buildFromTemplate([
    {
      label: "Lister",
      click: function () {
        win.show();
      },
    },
    {
      label: "Settings",
      click: function () {
        win.show();
        win.webContents.send("settingspage", null);
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: function () {
        app.quit();
      },
      //icon: path.join(__dirname, '../', '/assets/', '/', 'quit.png')
    },
  ]);

  tray.setContextMenu(menu);
  tray.setToolTip("Lister");
});

ipcMain.on("requestSystem", (evt, args) => {
  win.webContents.send("system", {
    dirname: path.join(__dirname, "../"),
    os: process.platform,
    versions: process.versions,
    touchid: process.platform == "darwin" ? systemPreferences.canPromptTouchID() : false,
    darktheme: nativeTheme.shouldUseDarkColors,
    highcontrast: nativeTheme.shouldUseHighContrastColors,
    accentcolor: systemPreferences.getAccentColor(),
    username: process.env.LOGNAME,
  });
});

ipcMain.on("openResources", (evt, args) => {
  // required to select a file to highlight, highlight files.json
  shell.showItemInFolder(path.join(__dirname, "../", "/resources/", "files.json"));
});
