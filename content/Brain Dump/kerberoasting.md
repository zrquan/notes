---
title: "Kerberoasting"
author: ["4shen0ne"]
draft: false
---

Kerberos 认证过程中，DC 返回的 TGS 使用目标服务实例的 NTLM hash 生成，加密算法是
RC4-HMAC. 如果该服务是用户帐号注册的，破解hash可得到用户明文密码

<https://3gstudent.github.io/%E5%9F%9F%E6%B8%97%E9%80%8F-Kerberoasting>
