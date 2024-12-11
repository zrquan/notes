---
title: "ESI注入攻击"
author: ["4shen0ne"]
draft: false
---

ESI 注入攻击（Edge Side Includes Injection）是一种针对网页缓存服务器的攻击方法，
攻击者通过注入 [ESI]({{< relref "esi.md" >}}) 标签来影响所有访问该缓存服务器的用户。

主要步骤：

1.  在输入数据中包含 ESI 标签，类似 SSTI、XSS 攻击；
2.  如果输入未经充分过滤直接被缓存，这些恶意代码会在缓存服务器处理 ESI 标签时执行；
3.  每当其他用户请求相同的缓存页面时，他们的会话都会受到恶意代码的影响，可能导致
    数据泄露、会话劫持等安全问题。

{{< figure src="/ox-hugo/_20240524_215854screenshot.png" >}}
