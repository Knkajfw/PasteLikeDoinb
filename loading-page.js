const { ipcRenderer, shell} = require('electron');
var statusBlock = document.getElementById('status-block');

var iconLink = document.getElementById('icon-link');

function openIconLinkExternally(event) {
  event.preventDefault();
  shell.openExternal('https://loading.io/spinner/ellipsis/');
}
function openCannotConnectHelpExternally(event) {
  event.preventDefault();
  shell.openExternal('https://knkajfw.github.io/paste-like-doinb/cannot-connect.html');
}
function replaceIconLinkWithCannotConnectHelp() {
  iconLink.innerHTML = '<small>不能连接请点我</small>';
  iconLink.removeEventListener('click', openIconLinkExternally);
  iconLink.addEventListener('click', openCannotConnectHelpExternally);
}

iconLink.addEventListener('click', openIconLinkExternally);
setTimeout(replaceIconLinkWithCannotConnectHelp, 15000);
document.getElementById('top-info-bar').innerHTML = info;
var topInfoBarLink1 = document.getElementById('top-info-bar-link1');
if (topInfoBarLink1) {
  topInfoBarLink1.addEventListener('click', (e)=>{e.preventDefault();shell.openExternal(infoLink)});
}

if (socketServerAddress) {
  ipcRenderer.send('socketServerInfo', socketServerAddress);
  statusBlock.innerText = "已取得服务器地址，连接中";
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

