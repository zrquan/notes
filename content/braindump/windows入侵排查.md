---
title: "Windows入侵排查"
author: ["4shen0ne"]
draft: false
---

常见的应急响应事件类型：

1.  Web 入侵：网页挂马、主页篡改、Webshell
2.  系统入侵：病毒木马、勒索软件、远控后门
3.  网络攻击：DDOS 攻击、DNS 劫持、ARP 欺骗


## 排查思路 {#排查思路}


### 检查系统帐号 {#检查系统帐号}

1.  查看服务器是否有弱口令，远程管理端口是否对公网开放
2.  查看服务器是否存在可疑账号、新增账号
    在 CMD 运行 lusrmgr.msc 命令，查看管理员群组的（Administrators）是否有新增账户
3.  查看服务器是否存在隐藏账号、克隆账号
    -   打开注册表 ，查看管理员对应键值
    -   使用 D 盾查杀工具，集成了对克隆账号检测的功能
4.  结合日志，查看管理员登录时间、用户名是否存在异常
    运行 eventvwr.msc 打开事件查看器，导出重要日志后用 [Log Parser](https://www.microsoft.com/en-us/download/details.aspx?id=24659) 分析


### 检查端口和进程 {#检查端口和进程}

1.  检查远程连接和端口监听情况
    -   使用 netstat -ano 查看目前的网络连接，定位可疑的 ESTABLISHED
    -   用 netstat 找到可以连接的 PID，使用 tasklist | findstr "PID" 定位进程
2.  检查可疑进程
    -   运行 msinfo32，在“软件环境 - 正在运行任务”可以看到进程详细信息
    -   打开 D 盾查杀工具，进程查看，关注没有签名信息的进程
    -   通过微软官方提供的 Process Explorer 等工具进行排查
    -   查找可疑进程时关注以下几个点
        1.  没有签名验证信息的进程
        2.  没有描述信息的进程
        3.  进程的属主
        4.  进程的路径是否合法
        5.  CPU 或内存资源占用长时间过高的进程
3.  小技巧
    -   查看端口对应 PID：netstat -ano | findstr "port"
    -   查看进程对应的 PID：tasklist | findstr "PID"
    -   查看进程对应的程序位置：任务管理器 - 选择对应进程 - 右键打开文件位置
    -   tasklist /svc，进程 - PID - 服务
    -   查看 Windows 服务所对应的端口：%systemroot%/system32/drivers/etc/services


### 检查启动项、计划任务、服务 {#检查启动项-计划任务-服务}

1.  检查启动项
    -   开始 -&gt; 所有程序 -&gt; 启动
    -   运行 -&gt; msconfig
    -   检查以下注册表项
        ```nil
             HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\run
             HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run
             HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Runonce
        ```
    -   查看组策略：gpedit.msc
2.  检查计划任务：【开始】&gt;【设置】&gt;【控制面板】&gt;【任务计划】
3.  检查自启动服务：services.msc


### 检查系统信息 {#检查系统信息}

1.  查看系统版本以及补丁信息：systeminfo
2.  查找可疑文件和目录
    -   查看最近打开的文件：运行 %UserProfile%\Recent
    -   检查回收站、浏览器下载目录、浏览器历史记录
    -   修改时间在创建时间之前的为可疑文件
3.  找到 webshell 和木马后，查找同一时间范围创建的文件
    -   使用 [Registry Workshop](http://www.torchsoft.com/en/rw_information.html) 的搜索功能
    -   使用计算机自带文件搜索功能，指定修改时间进行搜索
