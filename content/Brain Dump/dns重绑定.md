---
title: "DNS重绑定"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:10+08:00
draft: false
---

## 场景 {#场景}

当普通用户不小心访问到恶意网站 malicious.website，恶意网站无法向银行网站
bank.com 发送标准的 XMLHttpRequest 请求，因为他们的“源”不同。

实际上，每个网站都有对应的 IP，malicious.website 可能位于 34.192.228.43，
bank.com 可能位于 171.159.228.150。DNS 会帮我们完成 url 到 IP 的转换，从而访问到
服务器。问题在于现代浏览器使用 url 来评估同源策略限制，而不是 IP 地址。如果
malicious.website 的 IP 从 34.192.228.43 快速更改为 171.159.228.150，会发生什么？
从浏览器上看，没有任何改变。但现在，你的浏览器实际上正在与 bank.com 交谈，而不是
与恶意网站所在的服务器。问题出现了，我们可以通过滥用 DNS 来诱骗浏览器与他们不想
要的服务器进行通信，而在浏览器看来，“源”并没有发生改变。


## 攻击步骤 {#攻击步骤}

1.  攻击者控制恶意 DNS 服务器来回复域查询，比如 rebind.network；
2.  诱导用户访问 http[s]://rebind.network；
3.  恶意 DNS 服务器收到请求后，回复 rebind.network 的真实 IP 地址 34.192.228.43，
    并将 TTL 设置为 1，避免浏览器长时间缓存；
4.  受害者成功访问到恶意网站 rebind.network，网站的恶意 js 在反复发送一些请求，比
    如：http[s]://rebind.network/attack；
5.  过了一段时间，浏览器需要再次查询 DNS 服务器，更新一下本地缓存，而这次恶意 DNS
    返回的 IP 是 171.159.228.15；
6.  这时浏览器会去访问 http[s]://171.159.228.15/attack ，而且同源策略会失效，因为
    浏览器以为自己访问的依然是 http[s]://rebind.network 这个源。
