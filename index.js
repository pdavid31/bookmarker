const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;

function createWindow() {
  win = new BrowserWindow({show: false});

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  //win.toggleDevTools();

  win.setMenu(null);

  win.once('ready-to-show', () => {
    win.show();
  });

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  // quit program, as long as not on mac
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // restore app on mac
  if (win === null) {
    createWindow();
  }
});
