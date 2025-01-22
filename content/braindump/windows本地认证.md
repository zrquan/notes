---
title: "Windows本地认证"
author: ["4shen0ne"]
draft: false
---

本地认证的用户名密码校验过程使用系统中存储的用户数据（SAM 文件）完成，不需要网络
通信，工作组使用的认证方式就是本地认证。

大致流程：

```text
winlogon.exe -> 用户输入 -> lsass.exe -> NTLM Hash 比对
```

1.  winlogon.exe 进程接收用户输入的用户名和密码，该进程是 Windows NT 用户登录程序，
    用于管理用户的登录和退出，以及显示登录界面。

2.  lsass.exe 进程（Local Security Authority Service）将明文密码转换为 [NTLM Hash]({{< relref "ntlm_hash.md" >}})。
    该进程用于本地安全和登录策略，包括密码策略、账户策略、用户权限、域策略等等。
    同时它还负责对用户进行身份验证以确保只有授权的用户才能访问系统资源。

    同时 lsass.exe 会在内存中备份用户的明文密码（mimikatz 抓取密码的原理），但是
    在 Windows10 或 Windons Server 2012R2 以上的版本中被禁止了。

3.  将转换后的 NTLM Hash 和 SAM（Security Account Manager）文件中存储的 NTLM Hash
    比较，如果通过就将 GroupSid 和 UserSid 发送给 winlogon.exe 让用户登录，否则登
    录失败。

    SAM 文件位于 `%SystemRoot%\system32\config\sam` 。
