const { app, BrowserWindow } = require('electron');
const log = require('electron-log');
const ipc = require('electron').ipcMain
const isDev = require('electron-is-dev');
const {autoUpdater} = require("electron-updater");
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

if (isDev) {
  console.log('Running in development');
} else {
  console.log('Running in production');
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});


let win
let child

function createWindow () {
  // Create the browser window.
	win = new BrowserWindow({
		width: 1200,
		height: 900,
		webPreferences: {
		nodeIntegration: true
		}
  })
  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

function createChild(){
  child = new BrowserWindow({
    width: 800,
    height: 300,
    parent: win, 
    modal: true, 
    frame: false,
		webPreferences: {
      nodeIntegration: true
    }
  })
  child.loadFile('child.html')
  child.once('ready-to-show', () => {
    child.show()
  })
  child.on('closed',function(event){
    event.preventDefault();
    win.reload();
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  autoUpdater.checkForUpdatesAndNotify();
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  } else app.exit()
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

let todos = [
  {
      id: 0,
      data: "study flutter",
      status: "active"
  },
  {
      id: 1,
      data: "buy soap",
      status: "active"
  },
  {
      id: 2,
      data: "eat steak",
      status: "complete"
  },
];
let id_cnt = 3;

function addTodo(ctx){
  todos.push({
      id: id_cnt,
      data: ctx.data,
      status: 'active'
  });
  id_cnt++;
}
function completeTodo(ctx){
  let todo = todos.filter((item) => {return item.id === ctx.id});
  todo[0].status = 'complete';
}
function activeTodo(ctx){
  let todo = todos.filter((item) => {return item.id === ctx.id});
  todo[0].status = 'active';
}
function deleteTodo(ctx){
  todos = todos.filter((item) => {return item.id !== ctx.id});
}
function getActiveTodo(){
  return todos.filter((item) => {return item.status === 'active'});
}
function getCompletedTodo(){
  return todos.filter((item) => {return item.status === 'complete'});
}

ipc.on('getTodo', (event, args) => {
  let items = {};
  if(args === 'active'){
    items = getActiveTodo();
    event.reply('activeReply', items);
  } else if(args === 'complete'){
    items = getCompletedTodo();
    event.reply('completeReply', items);
  } else {
    items.active = getActiveTodo();
    items.complete = getCompletedTodo();
    event.reply('overviewReply', items);
  }
});

ipc.on('actionTodo', (event, args) => {
  switch (args.action){
    case 'create':
        addTodo({data: args.data});
        break;
    case 'active':
        activeTodo({id: args.id});
        break;
    case 'complete':
        completeTodo({id: args.id});
        break;
    case 'delete':
        deleteTodo({id: args.id});
        break;
    default:
        break;
  }
  event.reply('actionReply');
});
ipc.on('newTodo', (event, args) => {
  createChild();
});