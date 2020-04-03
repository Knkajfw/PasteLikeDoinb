const { ipcRenderer, shell } = require('electron');
const pldVersion = 440389;
var statusBlock = document.getElementById('status-block');
var iconLink = document.getElementById('icon-link');
var infobar = document.getElementById('top-info-bar');
var infobar2 = document.getElementById('top-info-bar-2');
var topInfoBarLink1 = document.getElementById('top-info-bar-link1');

function openIconLinkExternally(event) {
  event.preventDefault();
  shell.openExternal('https://loading.io/spinner/ellipsis/');
}
function openCannotConnectHelpExternally(event) {
  event.preventDefault();
  shell.openExternal('https://knkajfw.github.io/paste-like-doinb/cannot-connect.html');
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
infobar.innerHTML = info;

if (info2TargetVersion >= pldVersion) {
  infobar2.innerHTML = info2;
}

if (topInfoBarLink1) {
  topInfoBarLink1.addEventListener('click', (e)=>{e.preventDefault();shell.openExternal(infoLink)});
}

if (socketServerAddress) {
  ipcRenderer.send('socketServerInfo', socketServerAddress);
  statusBlock.innerText = "已取得服务器地址，连接中";
}