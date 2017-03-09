const url = require('url')
const { app, BrowserWindow, shell } = require('electron')

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')()

// prevent window being garbage collected
let mainWindow

function onClosed () {
  // dereference the window
  // for multiple windows store them in an array
  mainWindow = null
}

// Open external links on default browser
function onNewWindow (event, newURL, frameName, disposition, options) {
  const urlObject = url.parse(newURL, true)

  // Any external link will be sent to the default browser
  if (urlObject.hostname !== 'l.messenger.com') {
    event.preventDefault()
    return shell.openExternal(urlObject.href)
  }
  // Change width and height to something better
  options.width = 1280
  options.height = 800

  // Messenger has some interesting views for some pages
  const targetURL = url.parse(urlObject.query.u)

  // Allowed targets
  if (targetURL.hostname === 'media.giphy.com' ||         // Giphy
      targetURL.href.match(/google\.\w{1,3}\/maps\//i) || // Google Maps
      targetURL.href.match(/goo.gl\/maps\//i)             // Google Maps
  ) {
    return true
  }

  // If it's not known, don't show it
  event.preventDefault()
  return shell.openExternal(urlObject.href)
}

function createMainWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false
    }
  })

  win.loadURL('https://messenger.com')

  win.on('closed', onClosed)
  win.webContents.on('new-window', onNewWindow)

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
