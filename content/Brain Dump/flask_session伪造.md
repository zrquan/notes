---
title: "flask session伪造"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:12+08:00
tags: ["ctf"]
draft: false
---

Flask 中的 session 通过 cookie 进行传递，类似于 jwt 通过加密算法防止内容被篡改，
它在生成 session 时会使用 `app.config['SECRET_KEY']` 中的值作为 salt 对 session 进
行一个简单处理

只要想办法得到 secret_key 就可以伪造任意 session 值，相关工具：<https://github.com/noraj/flask-session-cookie-manager>

获取 secret_key 一般有两种思路：

1.  通过信息泄露漏洞直接获取 key
2.  存在任意文件读取时，可以读取 /proc/self/mem 文件来获取程序的变量
    （app.config['SECRET_KEY']），但由于 mem 文件比较大而且有不可打印字符，直接读
    取会 500, 所以一般先读取 /proc/self/maps 获取程序的堆栈分布（文件读取点会接收
    start, end 参数来截取文件内容）

link: <https://www.freebuf.com/articles/web/354448.html>
