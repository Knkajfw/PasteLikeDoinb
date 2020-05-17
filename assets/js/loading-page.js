const { ipcRenderer, shell } = require('electron');
var statusBlock = document.getElementById('status-block');
var iconLink = document.getElementById('icon-link');

function openIconLinkExternally(event) {
  event.preventDefault();
  shell.openExternal('https://loading.io/spinner/ellipsis/');
}
function openCannotConnectHelpExternally(event) {
  event.preventDefault();
  shell.openExternal('https://indienost.gitee.io/paste-like-doinb/cannot-connect.html');
}
function replaceIconLinkWithCannotConnectHelp() {
  iconLink.innerHTML = "<small>Can't get connected? See help</small>";
  iconLink.removeEventListener('click', openIconLinkExternally);
  iconLink.addEventListener('click', openCannotConnectHelpExternally);
}

function reload(){
  ipcRenderer.send('reload');
}

ipcRenderer.on('loadStatus_SocketLinked', () => {
  statusBlock.innerText = "已建立连接，等待Check-in";
})

ipcRenderer.on('loadStatus_PCIdEmitted', () => {
  statusBlock.innerHTML = "已发送PC端ID<br>等待移动端链接信息";
})

ipcRenderer.on('loadStatus_MobileLinkReceived', () => {
  statusBlock.innerHTML = "已接收移动端信息<br>配置中";
})

iconLink.addEventListener('click', openIconLinkExternally);
setTimeout(replaceIconLinkWithCannotConnectHelp, 15000);