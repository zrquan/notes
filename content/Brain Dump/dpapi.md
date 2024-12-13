---
title: "DPAPI"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:10+08:00
draft: false
---

DPAPI 英文全称：Data Protection API，顾名思义就是用来保护数据的接口。这个接口在
windows 中大量的使用来加密数据，比如 chrome 的 cookies 和 login data

-   DPAPI 使用了叫做 Master Key 的东西，用来解密和加密。Master Key 并不会存在在磁
    盘上，是通过用户的密码 HASH 加密生成

-   Master Key 有两种生成方式：
    1.  用用户 NTLM Hash 来加密。由于 NTLM Hash 在 Windows 中有着各种重要的作用，而
        且 NTLM Hash 是存储在 SAM 文件中，只要攻击者获取到 Hash 就可以用来生成
        Master Key 来解密数据了
    2.  直接用用户密码生成，函数：SHA1(UTF16LE(user_password))。就算攻击者获取到
        NTLM Hash，如果不能解密出用户的密码仍不能生成 Master Key
