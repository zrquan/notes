---
title: "servlet容器"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

Servlet 容器指的是支持 协议的 Web 服务器，容器会监听端口，接收请求。将接
收到的报文转换为 ServletRequest 对象传递给 Servlet 对象，等待 Servlet 对象处理完
逻辑后，把返回的 ServletResponse 对象组装成响应报文返回给客户端。
