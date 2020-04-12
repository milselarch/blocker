'use strict'

import { app, BrowserWindow } from 'electron'
const NativeImage = require('electron').nativeImage
const path = require('path')
const DEBUG = false
// import '../renderer/store'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
global.__static = path.join(__dirname, 'static').replace(/\\/g, '\\\\')
const iconPath = path.resolve(__static, 'images/icon-border.png')
const iconImage = NativeImage.createFromPath(iconPath)

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

console.log('DIRNAME', iconPath, iconImage)

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 620,
    useContentSize: true,
    width: 1000,
    icon: iconPath
  })

  setTimeout(() => {
    if (DEBUG) {
      mainWindow.webContents.openDevTools({mode: 'detach'})
    }
  }, 1000)

  mainWindow.on('close', (e) => {
    // mainWindow.hide()
    if (!DEBUG && (
      (process.env.NODE_ENV === 'production') ||
      (process.env.LIVE === 'true')
    )) {
      e.preventDefault()
      mainWindow.minimize()
      console.log('Window hiddnen')
      return false
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
