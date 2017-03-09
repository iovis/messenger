'use strict'

const {app, BrowserWindow} = require('electron')

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')()

// prevent window being garbage collected
let mainWindow

function onClosed () {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null
}

function createMainWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false
    }
  })

  win.loadURL('https://messenger.com')
  win.on('closed', onClosed)

  // Inject CSS
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      div[role="banner"],
      div[role="main"] > div:nth-child(2) {
        padding-top: ${8 + 25}px;
        height: ${50 + 8 + 25}px;
        -webkit-app-region: drag;
        -webkit-user-select: none;
      }
    `)
  })

  return win
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow()
  }
})

app.on('ready', () => {
  mainWindow = createMainWindow()
})
