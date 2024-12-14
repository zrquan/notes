---
title: "CORS"
author: ["4shen0ne"]
lastmod: 2024-12-14T18:38:36+08:00
draft: false
---

CORS 是一个 W3C 标准机制，全称是“跨域资源共享”（Cross-origin resource sharing）

-   它使用额外的 HTTP 头来告诉浏览器，让运行在一个 origin (domain) 上的 Web 应用被准
    许访问来自不同源服务器上的指定的资源。

-   它允许浏览器向跨源(协议 + 域名 + 端口)服务器，发出 XMLHttpRequest 请求，从而克服
    了 [AJAX]({{< relref "ajax.md" >}}) 只能同源使用的限制。

    {{< figure src="/ox-hugo/_20240524_175121screenshot.png" >}}
