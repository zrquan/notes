---
title: "Zerologon"
author: ["4shen0ne"]
tags: ["域渗透", "ad"]
draft: false
---

该漏洞的产生来源于 [Netlogon 服务]({{< relref "netlogon服务.md" >}})认证的加密模块存在缺陷，导致攻击者可以在没有凭证
的情况情况下通过认证。该漏洞的最稳定利用是调用 netlogon 中 RPC 函数
NetrServerPasswordSet2 来重置域控的密码，从而以域控的身份进行 [DCSync]({{< relref "dcsync.md" >}}) 获取域管权限


## 利用步骤 {#利用步骤}

1.  定位域控
    -   可以通过端口扫描定位，同时开放 135, 445, 53 端口的很可能是域控
    -   知道域名的情况下可以用 dns 查询，不过需要当前主机和域共享一套 dns
    -   如果当前主机在域内可以使用以下命令查询
        ```nil
             net time /domain
             net group "Domain controllers" /domain
             dsquery server -o rdn
             adfind -sc dclist
             Nltest /dclist:域名
             nslookup -type=SRV _ldap._tcp
        ```

2.  重置域控密码

    这里重置的是域控主机的机器密码（本地用户名为 SYSTEM）而不是域管密码，机器用户
    是不能直接登录的，但是具备 DCSync 特权，我们可以滥用该特权来进行 DCSync

3.  恢复脱域的域控

    在攻击过程中，我们将机器的密码置为空，这一步会导致域控脱域。其本质原因是机器
    用户在 AD 中的密码(存储在 ntds.dic)与本地的注册表 /lsass 里面的密码不一致。所
    以要将其恢复，我们需要将 AD 中的密码与注册表 /lsass 里面的密码保持一致
