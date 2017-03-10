const url = require('url')
const menuTemplateBuilder = require('./lib/menu')
const { app, BrowserWindow, Menu, shell } = require('electron')

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
  event.preventDefault()

  // Change width and height to something better
  options.width = 1280
  options.height = 720

  // Messenger has some interesting views for some pages
  if (urlObject.hostname === 'l.messenger.com' ||
      urlObject.hostname === 'l.facebook.com'
  ) {
    const targetURL = url.parse(urlObject.query.u, true)

    // Allowed targets
    if (targetURL.hostname === 'media.giphy.com' ||         // Giphy
        targetURL.href.match(/google\.\w{1,3}\/maps\//i) || // Google Maps
        targetURL.href.match(/goo.gl\/maps\//i)             // Google Maps
    ) {
      return createNewWindow(targetURL.href, options)
    } else if (targetURL.hostname === 'www.youtube.com') {
      return createNewWindow(`https://www.youtube.com/embed/${targetURL.query.v}`, options)
    }
  // Show YouTube video in an embedded window
  } else if (urlObject.hostname === 'www.youtube.com') {
    return createNewWindow(`https://www.youtube.com/embed/${urlObject.query.v}`, options)
  }

  // Any external link will be sent to the default browser
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

  const menu = menuTemplateBuilder(app, shell)
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

  win.webContents.on('new-window', onNewWindow)
  win.on('closed', onClosed)

  return win
}

function createNewWindow (url, options) {
  const win = new BrowserWindow(options)

  // win.loadURL(`https://www.youtube.com/embed/${urlObject.query.v}`)
  win.loadURL(url)
  win.webContents.on('new-window', onNewWindow)
  win.on('closed', onClosed)

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
