---
title: "WSGI"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:14+08:00
tags: ["python"]
draft: false
---

WSGI，即 Web Server Gateway Interface，是一个 Python 标准，定义了使用 Python 编写的
Web 应用程序与 Web 服务器之间的通用接口（类似于 Java 的 [Servlet]({{< relref "servlet.md" >}})）。意味着任意一个兼
容 WSGI 的 Web 应用可以运行在任意兼容 WSGI 的 Web 服务器上。

WSGI 规范主要包含两部分：

1.  应用程序接口：这是一个可调用的对象（callable），它接收两个参数——环境（一个包
    含请求信息的字典）和一个用于发送 HTTP 状态和响应头的回调函数。
    ```python
       def application(environ, start_response):
           start_response('200 OK', [('Content-Type', 'text/html')])
           return [b'<h1>Hello, web!</h1>']
    ```
    <div class="src-block-caption">
      <span class="src-block-number">Code Snippet 1:</span>
      hello.py
    </div>

2.  服务器/网关接口：负责接收 HTTP 请求，将其转换成 WSGI 所需要的格式，并调用应用
    程序接口，然后将响应返回给客户端。
