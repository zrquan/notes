---
title: "Django漏洞总结"
author: ["4shen0ne"]
tags: ["vuln"]
draft: false
---

## Django &lt; 2.0.8 任意 URL 跳转漏洞 {#django-2-dot-0-dot-8-任意-url-跳转漏洞}

当配置了 `django.middleware.common.CommonMiddleware` 且 APPEND_SLASH 为 True 时
（默认配置）漏洞就会触发。

CommonMiddleware 是 Django 中的一个通用中间件，实质上是一个类，位于
`site-packages/django/middleware/common.py` ，会执行一些 HTTP 请求的基础操作。

CommonMiddleware 其中一个功能是 URL rewriting：如果设置了 `APPEND_SLASH=True` 并且
初始 URL 没有以斜杠结尾，并且在 urlpatterns 中找不到它，则通过在末尾附加斜杠来形
成新的 URL。如果在 urlpatterns 中找到此新 URL，则将 HTTP 重定向到新 URL。

在 path 开头为 `//example.com` 的情况下 Django 没做处理，导致浏览器认为目的地址是
绝对路径，最终造成任意 URL 跳转漏洞。


## RCE {#rce}

link: <https://xz.aliyun.com/t/8333>
