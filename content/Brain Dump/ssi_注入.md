---
title: "SSI 注入"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:02+08:00
draft: false
---

SSI（Server Side Includes）是嵌入 HTML 页面中的指令，在页面被提供时由服务器进行
运算，以对现有 HTML 页面增加动态生成的内容，而无须通过 CGI 程序提供其整个页面，
或者使用其他动态技术。

从技术角度上来说，SSI 就是在 HTML 文件中，可以通过注释行调用的命令或指针，即允许
通过在 HTML 页面注入脚本或远程执行任意代码。

注入条件:

-   Web 服务器已支持 SSI（服务器端包含）
-   Web 应用程序未对相关 SSI 关键字做过滤
-   Web 应用程序在返回响应的 HTML 页面时，嵌入用户输入

[SSI 注入常用命令](https:www.owasp.org/index.php/Server-Side_Includes_(SSI)_Injection)
