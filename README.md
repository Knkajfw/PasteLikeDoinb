# 概述
记录对手的闪现时间，并一键发送Doinb风格的记录到游戏聊天（类似“mid1230 sup1504”）。

Record your opponents' Flash CD and automatically type the Doinb-style-string (e.g. "mid1230 sup1504") into game chat. 

# 下载 Download
请移步[Release页面](https://github.com/Knkajfw/PasteLikeDoinb/releases)下载zip压缩包。  
应用已上架Windows应用商店，也可[点此](https://www.microsoft.com/store/apps/9NTFQT7XWQW7)前往安装。  
也可通过百度网盘下载：
链接: https://pan.baidu.com/s/1wFCobhuU64Ocwz6lvcSsjw 提取码: 67ax  

Head over to [Release Page](https://github.com/Knkajfw/PasteLikeDoinb/releases) to download the Windows client.  
The app has also been submitted to Windows Store. Install it [here](https://www.microsoft.com/store/apps/9NTFQT7XWQW7).


# 截图 Screenshots
#### 游戏内截图

![游戏内截图](https://i.loli.net/2020/03/10/MOwG4At2k5PFTDH.png)

#### PC端截图
在运行英雄联盟游戏的PC上驻留后台，负责接收指令，将记录语句发送到游戏聊天里。

![PC端截图1](https://i.loli.net/2020/02/29/xVmj4k3LuD1bcJy.png) 
![PC端截图2](https://i.loli.net/2020/02/29/hiHfx1w47eNLP3j.png)

#### 移动端截图
用手机或别的设备扫码访问指定的页面，在此处记录对手何时使用了闪现，查看cd情况，指示发送记录语句。

![移动端截图](https://i.loli.net/2020/02/29/gzVyFjThswEfacP.png)



# FAQ
#### 1.Windows商店下载慢？
国内商店连接不稳定，过会再试试或者用代理吧。


#### 2.打出来的消息是乱码？
记得把输入法调整到英文模式哦。

#### 3.安装包体积怎么有60多M？
图省事，JS写完用electron框架适配Windows，安装包体积大是通病了..

#### 4.安装完了但是找不到打开的方式？
如果是通过windows商店安装的话，可以通过Win键+S打开全局搜索，搜索“记闪现”，或者在"开始"菜单中浏览。

#### 5.源码在哪？
源码仓库pastelikedoinb-client，为了方便通过搜索引擎找到本仓库，暂时设置了private。需要查看的话请[联系我](mailto:oncewecanown@prontonmail.com)。

# 声明 Disclaim
#### 使用本程序理论安全，但无法保证一定安全
腾讯客服对于第三方插件咨询的回复是："我们会对任何恶意第三方插件进行监控，出现修改游戏代码、破坏游戏平衡，造成他人恶劣游戏体验以及其他非法行为绝不手软，都将进行相应的处罚。"  

使用本程序时，对闪现记录完全是手动的，不涉及自动探测、自动提示等影响游戏平衡的功能。程序亦不读取/修改任何游戏收发数据/游戏目录文件/游戏内部代码，不与游戏程序进行直接交互。游戏内聊天的自动键入通过Windows键盘事件API实现，与用户的其他键盘输入本质相同，唯一风险在于腾讯是否会仅凭“键盘输入速率不够自然”一项标准，将使用此程序认定为恶意行为。从此前官方对于鼠标宏/键盘宏的包容态度来看，暂时不必太过担心，但风险确实存在，毕竟实际的执行尺度不可预知。如果您要使用本程序，则作者认为您已知悉以上风险。

目前作者也正寻找方式和腾讯方面直接联系确认，有进展会更新。

#### 使用本程序需要授权管理员权限
请知悉，程序需要以管理员权限来运行以向《英雄联盟》的游戏内聊天自动输入内容。如果你没有所用设备的管理员权限，可能功能无法实现。

管理员权限仅供完成上述功能，无任何恶意行为，源代码repo见FAQ，并已通过微软应用商店审核。详见[商店详情页](https://www.microsoft.com/store/apps/9NTFQT7XWQW7)的隐私政策。

[点此直接查看](https://Knkajfw.github.io/paste-like-doinb/PrivacyPolicy.html)