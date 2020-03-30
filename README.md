![PLD Logo](https://i.loli.net/2020/03/20/EFXrBngtQH41zuq.png)

# 概述 Summary
记录对手的闪现时间，并一键发送Doinb风格的信息到游戏聊天（类似“mid1230 sup1504”）。  
Record your opponents' Flash CD and share it with an auto-generated game chat msg("mid1230 sup1504") in one click.

# 下载 Download
请移步[Release页面](https://github.com/Knkajfw/PasteLikeDoinb/releases)下载zip压缩包。  
百度网盘下载：
链接: https://pan.baidu.com/s/1iTCADtRa48hpTTHFa3sg2A 提取码: s1qe

Head over to [Release Page](https://github.com/Knkajfw/PasteLikeDoinb/releases) to download the Windows client.  
Baidu NetDisk: https://pan.baidu.com/s/1iTCADtRa48hpTTHFa3sg2A Code:s1qe

# 截图 Screenshots
#### 游戏内截图 In-game

![游戏内截图](https://i.loli.net/2020/03/10/MOwG4At2k5PFTDH.png)

#### Windows端截图 Windows Client
在PC上驻留后台，负责接收指令，将记录语句发送到游戏聊天里。每次启动后会给出一个移动端控制台链接。  
Run the client in background. It receives the command to type from the web console, the link to which will be given everytime you start the client.

![PC端截图1](https://i.loli.net/2020/02/29/xVmj4k3LuD1bcJy.png) 
![PC端截图2](https://i.loli.net/2020/02/29/hiHfx1w47eNLP3j.png)

#### 移动端控制台 Mobile Console
用手机扫码访问，在此处记录对手何时使用了闪现，查看cd情况，指示发送到游戏聊天。  
You can also scan the QR Code to access your web console. Here you can record it when an opponent uses Flash and see the remaining cooldown time. Click the green button to indicate the Windows client to send a msg into the game chat.

![移动端截图](https://i.loli.net/2020/02/29/gzVyFjThswEfacP.png)

详细的使用说明[在这](https://jingyan.baidu.com/article/f79b7cb3b90f6cd044023ef9.html)

# 声明 Declaration
### 1.关于账号安全 Account Safety
#### *如果你是中国的英雄联盟玩家*
本程序在拳头的Dev Portal已完成注册，并已获得Riot官方人员确认并不违规。
当然，英雄联盟国服是由腾讯代理的，我们还需要参考腾讯的态度。

腾讯客服对于第三方插件咨询的回复是："我们会对任何恶意第三方插件进行监控，出现修改游戏代码、破坏游戏平衡，造成他人恶劣游戏体验以及其他非法行为绝不手软，都将进行相应的处罚。"  

使用本程序时，玩家手动记录闪现时间，不涉及自动探测、自动记录等影响游戏平衡的功能。  
程序不读取/修改任何游戏收发数据/游戏目录文件/内存内容，不与游戏程序进行直接交互。  
游戏内聊天的自动键入是通过系统层面的键盘事件一个字母一个字母打出来的，与用户的正常键盘输入无异。
与此原理类似的是游戏鼠标/游戏键盘上常见的宏指令功能，腾讯对此并不禁止，不认为是外挂行为。  
但是，由于腾讯官方尺度变化的不可预知，无法向您保证100%账号安全，作者在此声明不承担有关后果。

以下为腾讯官方[列举](https://kf.qq.com/faq/161223EN7j2i161223neURbE.html)的会导致账号受到封禁处罚的情况。使用本程序不符合其中任何一项:
![哪些情况会被封号惩罚？](https://i.loli.net/2020/03/11/C3uphM69K8LqWNr.png)

#### *If you play LOL in a region where Riot has direct control*

This product has been registered on Riot Dev Portal and has been approved. Riot#Gene has confirmed non-violence of their ToS. It is unlikely that using this tool will get you banned.  

![Approved on Dev Portal](https://i.loli.net/2020/03/20/eLIJXuT3sBoPhwV.png)
![Confirmation from Gene](https://i.loli.net/2020/03/20/Jlf2OQedC8v9TxA.png)

### 2.Windows客户端需要提权 Please accept the Windows client to be run as admin
请知悉，Windows客户端需要以管理员权限来运行以实现向《英雄联盟》的游戏内聊天输入内容。如果你没有所用设备的管理员权限，程序可能无法正常工作。管理员权限仅供完成上述功能，无任何恶意行为，已通过微软应用商店审核。源代码已公开，可以参考Electron的[文档](https://www.electronjs.org/docs/tutorial/application-packaging)自行Build。

Please note that the Windows client needs to be run as admin in order to type the generated msg into the game. Please allow the elevation when you are prompted by Windows. The program has no malicious feature and has been certificated by Microsoft Store. You can also choose to build from source. See Electron's [document](https://www.electronjs.org/docs/tutorial/application-packaging) for help.

# FAQ
#### 1.Windows商店下载慢？
国内商店连接不稳定，可以过会再试试，注意不用代理很可能会更快。

#### 2.客户端连接不上服务器？
国内连接问题请先参看[这个页面](https://knkajfw.github.io/paste-like-doinb/CNConnection.html)。  

#### 3.安装包体积怎么有60多M？
程序在Electron框架下运行，而大多数用户的电脑上并没有，因此安装包中包含了这个框架。如果你之前已在使用Electron，可以clone本仓库 -> npm install -> npm start 来启动。

#### 4.安装完了但是找不到打开的方式？
如果是通过Windows商店安装的话，可以通过Win键+S打开全局搜索，搜索“记闪现”，或者在"开始"菜单中浏览。

#### 5.访问web控制台让手机电量消耗得很快？
为了方便快速记录，使用了[NoSleep.js](https://github.com/richtr/NoSleep.js/)模块来实现计时期间手机不休眠和屏幕一直点亮。上述特性确实会对电池续航造成影响，建议手机插电使用。当web控制台被关闭，或不在前台一段时间后，网页加载的各种js会停止工作，不会再消耗额外电量。

#### 6.时间和游戏内时间不同步了？
如果web控制台不在前台的时间较长，页面加载的js可能会停止工作，计时也就会跟不上。

#### 7.其他问题？
加入QQ群699702899和作者/其他用户一起讨论这个软件吧！

## Build
1.Install Node  
[Official Site](https://nodejs.org/en/)  
This project was developed under node v12.13.0

2.Clone this repo  
Under the directory that you want to clone this to:  
`git clone https://github.com/Knkajfw/PasteLikeDoinb.git`

3.Install the dependencies  
```
cd PasteLikeDoinb
npm install
```

4.Modify the source code of RobotJs(one of the dependencies)  
See this [issue](https://github.com/octalmage/robotjs/issues/530#issuecomment-570795846).

5.Rebuild RobotJs for Electron  
See this [page](https://github.com/electron/electron-rebuild)

6.Start the program  
`npm start`

## 赞助
有帮到你的话，给我的晚饭加个鸡腿吧~！
- [微信支付](https://i.loli.net/2020/03/23/FrDkPLMWT6GEQcm.png)
- [支付宝](https://i.loli.net/2020/03/21/9vq5wsBTU6lNXZr.jpg)

感谢以下同学的赞助支持：

<a href='https://bbs.nga.cn/nuke.php?func=ucp&uid=38983727'><img src='https://i.loli.net/2020/03/24/f1H78RurPmvS4zT.jpg' alt='UserIcon'>NGA论坛@我跟你描述一个灵魂</a>
<p><img src='https://i.loli.net/2020/03/24/f1H78RurPmvS4zT.jpg' alt='UserIcon'>h*y</p>