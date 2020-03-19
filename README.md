# 概述 Summary
记录对手的闪现时间，并一键发送Doinb风格的信息到游戏聊天（类似“mid1230 sup1504”）。
Record your opponents' Flash CD and share it via generated game chat msg(e.g. "mid1230 sup1504" with one click.

# 下载 Download
请移步[Release页面](https://github.com/Knkajfw/PasteLikeDoinb/releases)下载zip压缩包。  
应用已上架Windows应用商店，[点此](https://www.microsoft.com/store/apps/9NTFQT7XWQW7)前往安装。  
百度网盘下载：
链接: https://pan.baidu.com/s/1wFCobhuU64Ocwz6lvcSsjw 提取码: 67ax  

Head over to [Release Page](https://github.com/Knkajfw/PasteLikeDoinb/releases) to download the Windows client.  
The app has also been submitted to Windows Store. Install it [here](https://www.microsoft.com/store/apps/9NTFQT7XWQW7). (Some markets only.)


# 截图 Screenshots
#### 游戏内截图 In-game

![游戏内截图](https://i.loli.net/2020/03/10/MOwG4At2k5PFTDH.png)

#### Windows端截图 Windows Client
在运行英雄联盟游戏的PC上驻留后台，负责接收指令，将记录语句发送到游戏聊天里。每次启动后会给出一个移动端控制台链接。
Run the client in background. It receives the command to type from the web console, the link to which will be given everytime you start the client.

![PC端截图1](https://i.loli.net/2020/02/29/xVmj4k3LuD1bcJy.png) 
![PC端截图2](https://i.loli.net/2020/02/29/hiHfx1w47eNLP3j.png)

#### 移动端控制台 Mobile Console
用手机扫码访问，在此处记录对手何时使用了闪现，查看cd情况，指示发送到游戏聊天。
You can also scan the QR Code to access your web console. Here you can record it when an opponent uses Flash and see the remaining cooldown time. Click the green button to indicate the Windows client to send a msg into the game chat.

![移动端截图](https://i.loli.net/2020/02/29/gzVyFjThswEfacP.png)

# 声明 Disclaim
#### 使用本程序理论安全，但无法向您保证一定安全
腾讯客服对于第三方插件咨询的回复是："我们会对任何恶意第三方插件进行监控，出现修改游戏代码、破坏游戏平衡，造成他人恶劣游戏体验以及其他非法行为绝不手软，都将进行相应的处罚。"  

使用本程序时，对闪现记录完全是手动的，不涉及自动探测、自动提示等影响游戏平衡的功能。程序亦不读取/修改任何游戏收发数据/游戏目录文件/内存内容，不与游戏程序进行直接交互。游戏内聊天的自动键入通过Windows层级的模拟按键实现，与用户的其他键盘输入本质相同。但是，由于腾讯官方尺度变化的不可预知，无法向您保证100%安全。如果您要使用本程序，则作者认为您已知悉以上风险。

以下为腾讯官方[列举](https://kf.qq.com/faq/161223EN7j2i161223neURbE.html)的会导致账号受到封禁处罚的情况。使用本程序不符合其中任何一项:
![哪些情况会被封号惩罚？](https://i.loli.net/2020/03/11/C3uphM69K8LqWNr.png)

目前作者也正寻找方式和腾讯方面直接联系确认，有进展会更新。
The author is in the process to register this product on Riot Dev Portal. The result will be updated soon.

#### 本程序需要授权 Please accept the UAC warning
请知悉，程序需要以管理员权限来运行以向《英雄联盟》的游戏内聊天自动输入内容。如果你没有所用设备的管理员权限，可能功能无法实现。

管理员权限仅供完成上述功能，无任何恶意行为，已通过微软应用商店审核。源代码已公开，可以通过[electron-packager](https://github.com/electron/electron-packager)自行打包&编译。

Please note that the Windows client needs to be run as admin in order to type the generated msg into the game. Please allow the elevation when you are prompted by Windows. The program has no malicious feature and has been certificated by Microsoft Store. You can also choose to build from the source code with the help of something like [electron-packager](https://github.com/electron/electron-packager).

# FAQ
#### 1.Windows商店下载慢？
国内商店连接不稳定，可以过会再试试，注意不用代理很可能会更快。

#### 2.打出来的消息是乱码？
记得把输入法调整到英文模式哦。

#### 3.安装包体积怎么有60多M？
图省事，JS写完用electron框架适配Windows，安装包体积大是通病了..

#### 4.安装完了但是找不到打开的方式？
如果是通过windows商店安装的话，可以通过Win键+S打开全局搜索，搜索“记闪现”，或者在"开始"菜单中浏览。

#### 5.访问web控制台让手机电量消耗得很快？
为了方便快速记录，使用了[NoSleep.js](https://github.com/richtr/NoSleep.js/)模块来实现计时期间手机不休眠和屏幕一直点亮。上述特性确实会对电池续航造成影响，建议手机插电使用。当web控制台被关闭，或不在前台一段时间后，网页加载的各种js会停止工作，不会再消耗额外电量。

#### 6.时间和游戏内时间不同步了？
如果web控制台不在前台的时间较长，页面加载的js可能会停止工作，计时也就会跟不上。