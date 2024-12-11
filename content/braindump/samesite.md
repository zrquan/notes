---
title: "SameSite"
author: ["4shen0ne"]
draft: false
---

SameSite 是从 Chrome 51 开始引入的一个 Cookie 属性，用来防止 CSRF 攻击和用户追踪，
该属性有三个可选值来限制第三方 Cookie(即非当前域的 Cookie):

1.  Strict, 完全禁止携带第三方 Cookie
2.  Lax, 大多数情况不携带第三方 Cookie, 但 GET 请求除外
3.  None, 显式禁用 SameSite 属性，不过前提是必须同时设置 Secure 属性（Cookie 只能通
    过 HTTPS 协议发送）

在 Chrome 80 之后，SameSite 的属性默认为 Lax, 因此会导致大部分 CSRF 利用失败。在
Chrome 8x 版本可以访问 将该默认特性
禁用

不过自 Chrome 91 起 `same-site-by-default-cookies` 和
`cookies-without-same-site-must-be-secure` 这两个 flag 就删除了，Chrome 94 之后命
令行参数-disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure
也删除了，建议使用其他浏览器测试 CSRF
