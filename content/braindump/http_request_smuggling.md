---
title: "HTTP request smuggling"
author: ["4shen0ne"]
tags: ["http"]
draft: false
---

HTTP 请求走私主要是利用代理服务器（比如 Nginx）和后端 Web 服务器在处理 HTTP 请求
时的差异，使一些本应该被代理服务器拦截的请求“走私”到后端服务器，达到绕过安全策略、
未授权访问、劫持连接等目的。

所谓“处理 HTTP 请求时的差异”通常指服务器是根据 `Content-Length` (CL) 还是
`Transfer-Encoding` (TE) 来区分请求边界。


## Keep-Alive &amp; Pipeline {#keep-alive-and-pipeline}

Keep-Alive 机制允许使用一个 TCP 连接来收发多个 HTTP 请求，以此来减少创建/销毁 TCP
连接的开销，可以通过 HTTP 头 `Connection: Keep-Alive` 来开启。此机制也被称为 HTTP 长
连接。（在 HTTP 1.1 中默认开启）

Pipeline 指 HTTP 流水线，是将多个 HTTP 请求批量发送的技术，而在发送过程中不需要先
等待服务器的回应。该技术依赖于 Keep-Alive 机制，多个 HTTP 请求会在同一个 TCP 连
接上批量发送，然后 `按照发送的顺序依次接收` ，因此存在队头阻塞（HOL blocking）问题。

上述技术常用于代理服务器和后端 Web 服务器的通信中，代理服务器通过 HTTP 长连接来
处理客户端和服务端的请求/响应转发，以此来提高性能。

{{< figure src="/ox-hugo/_20240629_171417screenshot.png" >}}

在此场景下，利用 HTTP 请求走私甚至可以影响其他客户端的请求的处理过程。

{{< figure src="/ox-hugo/_20240629_171753screenshot.png" >}}


## CL 不为 0 的 GET 请求 {#cl-不为-0-的-get-请求}

假设代理服务器允许 GET 请求携带请求体，而后端服务器不允许 GET 请求携带请求体，它
会直接忽略 GET 请求中的 `Content-Length` ，这就有可能导致请求走私。

比如攻击者构造以下请求：

```nil
GET / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 44\r\n

GET /secret HTTP/1.1\r\n
Host: example.com\r\n
\r\n
```

代理服务器会读取 `Content-Length` ，判断这是一个完整的请求，然后转发给后端服务器；
而后端服务器收到后，因为它不对 `Content-Length` 进行处理，就认为这是 pipeline 中的
两个不同的请求。

```nil
GET / HTTP/1.1\r\n
Host: example.com\r\n
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  request-1
</div>

```nil
GET /secret HTTP/1.1\r\n
Host: example.com\r\n
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 2:</span>
  request-2
</div>


## CL-CL {#cl-cl}

[在 RFC7230 的第 3.3.3 节中](https://datatracker.ietf.org/doc/html/rfc7230#section-3.3.3)，规定了当请求中包含多个不同值的 `Content-Length` 时，服
务器应该将其视为非法请求，并返回 `400 Bad Request` 。

虽然规定是这么规定，开发者是否遵守就是另一回事了。事实上一些服务器并不会拒绝包含
多个 CL 头的请求，个别服务器会处理第一个 CL 头，而个别服务器会处理最后一个 CL 头，
这些差异导致了 HTTP 请求走私漏洞。

假设代理服务器处理第一个 CL 头，而后端的 Web 服务器处理第二个 CL 头，以下请求就会
将字母 `a` “走私”到 pipeline 的下一个请求中。

```nil
POST / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 8\r\n
Content-Length: 7\r\n

12345\r\n
a
```

Pipeline 中的下一个 HTTP 请求可能会被视为：

```nil
aGET / HTTP/1.1\r\n
Host: example.com\r\n
```


## CL-TE {#cl-te}

该情况指的是：请求中同时存在 `Content-Length` 和 `Transfer-Encoding` 请求头，代理服
务器根据 `Content-Length` 处理请求，而后端服务器按照规范（[RFC2616 第 4.4 节](https://datatracker.ietf.org/doc/html/rfc2616#section-4.4)）根据
`Transfer-Encoding` 处理请求。

以下请求将 `G` 走私到 pipeline 中下一个 POST 请求的开头：

{{< figure src="/ox-hugo/_20240701_215435screenshot.png" >}}


## TE-CL {#te-cl}

和 CL-TE 同理，但代理服务器处理 `Transfer-Encoding` ，而后端服务器处理
`Content-Length` 。

以下请求篡改了下一个 HTTP 请求的首行：

{{< figure src="/ox-hugo/_20240701_215837screenshot.png" >}}


## TE-TE {#te-te}

代理服务器和后端服务器都优先处理 `Transfer-Encoding` 头，这种情况依然可以通过混淆
TE 头使某台服务器去处理 `Content-Length` 。

以下请求用 `Transfer-Encoding: null` 进行混淆，使后端服务器根据 `Content-Length` 处
理请求，导致请求走私：

{{< figure src="/ox-hugo/_20240701_220906screenshot.png" >}}

可用于混淆的 TE 头：

```nil
Transfer-Encoding: xchunked
Transfer-Encoding[空格]: chunked
Transfer-Encoding: chunked
Transfer-Encoding: x
Transfer-Encoding:[tab]chunked
[空格]Transfer-Encoding: chunked
X: X[\n]Transfer-Encoding: chunked
Transfer-Encoding
: chunked
```
