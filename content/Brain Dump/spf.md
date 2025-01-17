---
title: "SPF"
author: ["4shen0ne"]
draft: false
---

SPF（Sender Policy Framework）记录是一种电子邮件验证机制，用于防止电子邮件地址伪
造和垃圾邮件。它通过 DNS 记录指定哪些服务器有权代表你的域名发送电子邮件，从而帮
助接收邮件的服务器验证邮件的来源是否合法。

由于 SPF 记录了域名相关的 IP 地址，可能被用来发现真实 IP、[绕 WAF](https://github.com/mmarting/unwaf) 等。


## 验证过程 {#验证过程}

1.  域名管理员在 DNS 记录中创建一条 SPF 记录，其中包含授权发送该域名电子邮件的 IP
    地址或主机名列表。

2.  当一台邮件服务器接收到一封声称来自某个域名的电子邮件时，它会查找该域名的 SPF
    记录，然后检查发件服务器的 IP 地址是否包含在 SPF 记录定义的授权列表中。

3.  根据 SPF 记录的验证结果，接收邮件的服务器可以决定是接受、标记为垃圾邮件，或者
    直接拒绝这封邮件。


## 格式 {#格式}

```text
v=spf1 ip4:192.168.1.1 include:_spf.google.com ~all
```

-   `v=spf1` -- 表示使用 SPF 版本 1
-   `ip4:192.168.1.1` -- 指定被授权发送邮件的 IPv4
-   `include:_spf.google.com` -- 授权通过 Google 的 SPF 记录中定义的所有 IP 地址发送邮件
-   `~all` -- 表示除上述地址外，所有其他来源的邮件都会被标记为软失败（即邮件可能会被
    接受，但会被标记为可疑）
