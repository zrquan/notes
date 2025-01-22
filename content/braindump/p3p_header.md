---
title: "P3P Header"
author: ["4shen0ne"]
draft: false
---

P3P Header 是 W3C 制定的一项关于隐私的标准，全称 The Platform for Privacy
Preferences

主要用于类似广告等需要跨域访问的 iframe 页面。iframe 页面的 Cookie 作为第三方
Cookie，在 IE 浏览器（其他浏览器还没查）默认是禁止读取的，这时候就需要设置 P3P 协
议头来支持访问第三方 Cookie

一些安全问题：

-   浏览器可能会拦截向第三方网站发送 Cookie，以此来降低 CSRF 攻击的威力，但如果响
    应设置了 P3P 头，将允许浏览器发送第三方 Cookie
-   P3P 将影响整个域的所有页面
