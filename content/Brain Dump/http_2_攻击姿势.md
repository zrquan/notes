---
title: "HTTP/2 攻击姿势"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:14+08:00
draft: false
---

## 和 http/1.1 的一些区别 {#和-http-1-dot-1-的一些区别}

1.  pseudo-headers
    http1.1 请求中的第一行包含方法、路径、协议，在 http2 中使用一系列
    pseudo-headers 来代替，如下：

<!--listend-->

```nil
:method - 请求方法
:path - 资源路径，但是不包含请求参数
:authority - 类似于 Host 头
:scheme - 协议，http 或 https
:status - 响应码
```

1.  结构
    虽然它们都是应用层的协议，但是 http/1.1 是基于文本的协议，它的结构就像我们看
    到的一样，而 http/2 在 TCP 层之上抽象出一层分帧层(?)，以字节为单位，通过规范
    的偏移来确定请求中的数据。


## H2.CL {#h2-dot-cl}

在 http/2 中每个数据帧都有固定的长度，所以不需要 Content-Length 头，但是在 http
降级的情况下，前端服务器需要自己添加 CL 头，因此可以通过自行添加一个数值小的 CL
头来走私请求给后端服务器。


## H2C {#h2c}

[HTTP2]({{< relref "http_2.md" >}}) Cleartext，讲解一些 HTTP/2 明文协议基础上的走私攻击

HTTP/1.1 可以通过协商请求来升级当前协议，类似于 WebSocket 协议，当服务端返回 101 即可
完成升级，并重用当前连接发送升级后的 H2C 请求

{{< figure src="/ox-hugo/2021-09-01_17-05-06_screenshot.png" >}}

协议升级完成后前后端会维持一条 TCP 隧道进行通信，而这时候代理服务器不在监控这条通
道的信息，这可能导致一些拦截绕过的问题，比如通过升级 ws 协议来走私请求

有点懵，之后有空再看吧：<https://labs.bishopfox.com/tech-blog/h2c-smuggling-request-smuggling-via-http/2-cleartext-h2c>
