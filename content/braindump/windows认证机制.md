---
title: "Windows认证机制"
author: ["4shen0ne"]
tags: ["windows"]
draft: false
---

## 本地认证 {#本地认证}


### 概述 {#概述}

Windwos 将本地所有用户的凭证信息存储在 `%SystemRoot%\system32\config\sam` 中，当用
户登录系统时，系统会读取 [sam]({{< relref "sam.md" >}}) 文件中的密码和用户输入的密码进行比对，如果相同则认
证成功。

Windows 不保存明文密码，而是保存密码的 Hash

认证流程：

1.  `winlogon.exe` 显示登录界面，接收用户输入；
2.  `lsass.exe` 接收用户输入的明文密码，将其转换成 `NTLM Hash` ，再和 sam 数据库进行比较。

Windows Logon Process（winlogon.exe），是 Windows NT 用户登录程序，用于管理用户登录和退出

[LSASS]({{< relref "lsass.md" >}}) 用于 Windows 本地安全和登录策略，该进程会缓存 `NTLM Hash` ，以便用户进行登录验证


### NTLM Hash {#ntlm-hash}

NTLM Hash 是 NTLM（NT LAN Manager）协议的根本凭证，在本地认证的过程中，就是将用
户输入的密码转换为 NTLM Hash 再与 sam 中的 NTLM Hash 进行比较。

密码 admin 的转换过程：

```nil
admin -> hex(16进制编码) = 61646d696e
61646d696e -> Unicode = 610064006d0069006e00
610064006d0069006e00 -> MD4 = 209c6174da490caeb422f3fa5a7ae634
```


## 网络认证 {#网络认证}


### NTLM 协议 {#ntlm-协议}

基于 Challenge/Response 认证机制的网络协议，只支持 Windows。

认证过程：

1.  协商 -- 主要用于确认双方协议版本；

2.  质询 -- `Challenge/Response` 认证机制的主要作用过程；
    1.  客户端向服务器发送用户信息，若用户不存在即认证失败；

    2.  服务端生成一个 16 位的随机数（Challenge），使用登录用户对应的 NTLM Hash 加密
        Challenge 得到 Challenge1（Net NTLM Hash），然后将 Challenge 返回给客户端；

    3.  客户端使用 NTLM Hash 加密 Challenge 生成 Response，将 Response 发送至服务
        端，服务端比较 Response 和 Challenge1 是否相等。

3.  验证，在质询完成后，验证结果。

从上述过程可以看出，客户端只需要 NTLM Hash 就可以完成整个认证流程，而不需要知道
明文密码，这就是 PTH 攻击技术出现的原因。


#### NTLM v1 vs NTLM v2 {#ntlm-v1-vs-ntlm-v2}

|              | NTLM v1 | NTLM v2  |
|--------------|---------|----------|
| Challenge 长度 | 8 位    | 16 位    |
| 加密算法     | DES     | HMAC-MD5 |


## Windows Access Token {#windows-access-token}

Access Token 是一个描述进程安全上下文的对象，不同用户登录计算机后都会生成
一个 Access Token，该 Token 在用户创建进程或线程时被使用、拷贝。

Access Token 包括两个部分：一是令牌所表示的用户，用户标识符（[SID]({{< relref "sid.md" >}})），用户所属的用
户组等；二是令牌具有的权限（Privilege）。

进程访问安全对象时，会用到 SID，根据安全对象的访问控制表（ACL）和进程的 SID，决
定进程是否可以访问该对象。 **Privilege 并不能决定是否能访问某个安全对象** ，而是决定
进程是否能进行某些系统操作，比如关闭系统、修改系统时间、加载设备驱动等。

Access Token 分为主令牌和模拟令牌，用户注销后系统将其主令牌切换成模拟令牌，系统
重启后才会清除令牌。

每个进程创建时都会根据登录会话权限由 LSA（Local Security Authority）分配一个
Token。如果 CreaetProcess 时自己指定了 Token，LSA 会用该 Token，否则就用父进程
Token 的一份拷贝。
