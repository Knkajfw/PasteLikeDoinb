![PLD Logo](https://i.loli.net/2020/03/20/EFXrBngtQH41zuq.png)

# 概述 Summary
记录对手的闪现时间，并一键发送Doinb风格的沟通信息到游戏聊天（类似“mid1230 sup1504”）。  
Record your opponents' Summoner Spell CD and communicate with your teammates with an auto-generated game chat msg.

# 下载 Download
请移步[Release页面](https://github.com/Knkajfw/PasteLikeDoinb/releases)下载安装包。  
[国内镜像](https://plddownload-1300643516.file.myqcloud.com/update/pastelikedoinb_webinstaller_2.0.1.exe)

Head over to [Release Page](https://github.com/Knkajfw/PasteLikeDoinb/releases) to download the installer.  
[CN Mirror](https://plddownload-1300643516.file.myqcloud.com/update/pastelikedoinb_webinstaller_2.0.1.exe)

# 截图 Screenshots
#### 游戏内 In-game

![In-game](https://i.loli.net/2020/06/04/dbPNK6nw5fyq3WG.gif)

#### Windows端 Windows Client
和LOL运行在同一台电脑上，负责接收指令，将记录语句发送到游戏聊天里。  
Run with LOL on the same PC. It receives commands from the web console and will handle the message-sending part.

![PC端截图](https://i.loli.net/2020/06/04/TwtQDdScfHNPvMC.png)

#### 移动端控制台 Mobile Console
在此处记录对手的技能CD，查看cd情况，指示PC端发送消息。  
Record here when you see an opponent uses his summoner spell and instruct the PC client to send an in-game message.

<img src="https://i.loli.net/2020/06/04/Vvx5UYCIWDOXkLr.jpg" style="margin-right: 20px">
<img src="https://i.loli.net/2020/06/04/YFCOEyt8hwWcH5n.jpg">

详细的使用说明[在这](https://jingyan.baidu.com/article/f79b7cb3b90f6cd044023ef9.html)

# 声明 Declaration
### 1.关于账号安全 Account Safety
#### *如果你是中国的英雄联盟玩家*
本程序在拳头的Dev Portal已完成注册，并已获得Riot官方人员确认并不违规。下方有注册和工作人员答复的截图。
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

This product has been registered on Riot Dev Portal and has been approved. Gene@Riot has confirmed there is no violence of their ToS. It is unlikely that using this tool will get you banned.

![Approved on Dev Portal](https://i.loli.net/2020/03/20/eLIJXuT3sBoPhwV.png)
![Confirmation from Gene](https://i.loli.net/2020/03/20/Jlf2OQedC8v9TxA.png)

### 2.Windows客户端需要提权 Please accept the Windows client to be run as admin role
请知悉，Windows客户端需要以管理员权限来运行以实现向《英雄联盟》的游戏内聊天输入内容。如果你没有所用设备的管理员权限，程序可能无法正常工作。管理员权限仅供完成上述功能，无任何恶意行为。本程序源代码已公开。

Please note that the Windows client needs to be run as admin in order to type the generated message into the game. Please allow the elevation request when you are prompted by Windows. This program has no malicious feature. You can check the source code yourself and build an exact copy from it.

# FAQ
#### 1.页面计时器和游戏内时间不同步了？
如果web控制台不在前台的时间较长，页面加载的js可能会停止工作，计时也就会跟不上。

#### 2.使用同步功能，但发现位置不正确，比如Mid的位置上其实是对方上单？
游戏内按tab键的话，会出现能看到所有玩家装备的面板，在这个面板通过拖动把对方玩家按上单/打野/中单/ad/辅助的顺序排好，再同步一次即可。  

#### 3.访问web控制台让手机电量消耗得很快？
为了方便快速记录，使用了[NoSleep.js](https://github.com/richtr/NoSleep.js/)模块来实现计时期间手机不休眠和屏幕一直点亮。上述特性确实会对电池续航造成影响，建议手机插电使用。把计时器暂停/重置之后，NoSleep就不会起作用了，不再会消耗额外电量。

#### 4.在游戏内PLD似乎无法正常打字，但游戏外，比如记事本里，是可以的？
请检查软件是否是以管理员权限运行的。  
PLD会试图请求管理员权限。在您遇到“是否允许该应用更改您的设备”弹窗时，请选择允许。  
如果你并没有遇到弹窗，可以手动将PLD设置为以管理员权限运行（exe右键菜单 > 属性 > 兼容性 > 勾选以管理员身份运行）。

#### 5.其他问题？
在Github提交issue即可。此外中文用户有一个交流群699702899，新版本会率先在群内测试。

## Build
1.Install Node & Git  
[Node Official Site](https://nodejs.org/en/)  
[Git Official Site](https://git-scm.com/)  
This project was developed under node v12.13.0

2.Clone this repo  
Under the directory that you want to clone this to:  
`git clone https://github.com/Knkajfw/PasteLikeDoinb.git`

3.Install the dependencies  
```
cd PasteLikeDoinb
npm install
```

4.Rebuild RobotJs for Electron  
See this [page](https://github.com/octalmage/robotjs/wiki/Electron)

5.Start the program  
`npm start`

## 赞助
#### 开发不易，确实有帮到你的话，请一定用小半个皮肤的价格支持一下！感谢感谢！
<img src="https://i.loli.net/2020/06/02/oIRQBOg54a1cp2v.png">

#### 感谢以下用户的赞助支持：
<a title="NGA论坛@我跟你描述一个灵魂" href="https://bbs.nga.cn/nuke.php?func=ucp&uid=38983727"><img src='https://i.loli.net/2020/03/24/f1H78RurPmvS4zT.jpg' alt='UserIcon'></a>
<img src='https://i.loli.net/2020/03/24/f1H78RurPmvS4zT.jpg' alt='UserIcon' title="h*y">
<img src='https://i.loli.net/2020/04/25/ojbDdfagcM6BxtP.jpg' alt='UserIcon' title="渣男" style="border-radius: 10px">
<img src='https://i.loli.net/2020/04/25/k6JwxS8UmHV3ifh.jpg' alt='UserIcon' title="&#x1f621" style="border-radius: 10px">
<img src='https://i.loli.net/2020/04/25/CTXRoYUwyu62bke.jpg' alt='UserIcon' title="驼驼安" style="border-radius: 10px">
<img src='https://i.loli.net/2020/05/01/2taO87Vgc1srFjE.png' alt='UserIcon' title="陈二狗" style="border-radius: 10px">
<img src='https://i.loli.net/2020/03/24/f1H78RurPmvS4zT.jpg' alt='UserIcon' title="k*)">
