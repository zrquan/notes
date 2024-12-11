---
title: "HTTP 走私攻击"
author: ["4shen0ne"]
draft: false
---

首先需要了解 HTTP1.1 的两个特性--`Keep-Alive&Pipeline`

Keep-Alive - 就是在 HTTP 请求中增加一个特殊的请求头 `Connection: Keep-Alive` ，告诉
服务器，接收完这次 HTTP 请求后，不要关闭 TCP 链接，后面对相同目标服务器的 HTTP 请求，
重用这一个 TCP 链接，这样只需要进行一次 TCP 握手的过程，可以减少服务器的开销，节约资
源，还能加快访问速度。当然，这个特性在 HTTP1.1 中是默认开启的。

Pipeline - 意味着客户端可以像流水线一样发送自己的 HTTP 请求，而不需要等待服务器的
响应，服务器那边接收到请求后，需要遵循先入先出机制，将请求和响应严格对应起来，再
将响应发送给客户端。浏览器默认是不启用 Pipeline 的，但服务器一般都提供支持。

Keey-Alive 属性一般会在反向代理和源站服务器间使用，因为它们的 IP 地址相对固定，方便
重用 TCP 连接。


## CL 不为 0 的 GET 请求 {#cl-不为-0-的-get-请求}

假设前端代理服务器允许 GET 请求携带请求体，而后端服务器不允许 GET 请求携带请求体，它
会直接忽略掉 GET 请求中的 `Content-Length` 头，不进行处理。这就有可能导致请求走私。

比如构造以下请求

```nil
GET / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 44\r\n

GET / secret HTTP/1.1\r\n
Host: example.com\r\n
\r\n
```

前端服务器收到该请求，通过读取 `Content-Length` ，判断这是一个完整的请求，然后转发
给后端服务器，而后端服务器收到后，因为它不对 `Content-Length` 进行处理，由于
`Pipeline` 的存在，它就认为这是收到了两个请求，分别是

```nil
第一个
GET / HTTP/1.1\r\n
Host: example.com\r\n

第二个
GET / secret HTTP/1.1\r\n
Host: example.com\r\n
```


## CL-CL {#cl-cl}

在 RFC7230 的第 3.3.3 节中的第四条中，规定当服务器收到的请求中包含两个 Content-Length，
而且两者的值不同时，需要返回 400 错误。

但是总有服务器不会严格的实现该规范，假设中间的代理服务器和后端的源站服务器在收到
类似的请求时，都不会返回 400 错误，但是中间代理服务器按照第一个 Content-Length 的值
对请求进行处理，而后端源站服务器按照第二个 Content-Length 的值进行处理。

此时构造恶意请求:

```nil
POST / HTTP/1.1\r\n
Host: example.com\r\n
Content-Length: 8\r\n
Content-Length: 7\r\n

12345\r\n
a
```

代理服务器认为 Content-Length 是 8，而后端服务器则认为是 7，当读取完前 7 个字符后，后
端服务器认为已经读取完毕，然后生成对应的响应发送出去。而此时的缓冲区还剩余一个字
母 `a` ，对于后端服务器来说，这个 `a` 是下一个请求的一部分，但是还没有传输完毕。此时
恰巧有一个其他的正常用户对服务器进行了请求，假设请求如下所示。

```nil
GET /index.html HTTP/1.1\r\n
Host: example.com\r\n
```

这时候正常用户的请求就拼接到了字母 `a` 的后面，当后端服务器接收完毕后，它实际处理
的请求其实是

```nil
aGET /index.html HTTP/1.1\r\n
Host: example.com\r\n
```


## CL-TE {#cl-te}

所谓 CL-TE，就是当收到存在两个请求头的请求包时，前端代理服务器只处理
Content-Length 这一请求头，而后端服务器会遵守[RFC2616](https:tools.ietf.org/html/rfc2616#section-4.4)的规定，忽略掉 Content-Length，
处理 Transfer-Encoding 这一请求头。

chunk 传输数据格式如下，其中 size 的值由 16 进制表示。

```nil
[chunk size][\r\n][chunk data][\r\n][chunk size][\r\n][chunk data][\r\n][chunk size = 0][\r\n][\r\n]
```

将 `G` 走私到下一个 POST 请求的开头，构造出 GPOST 请求

{{< figure src="/ox-hugo/2021-01-15_19-16-10_2020-11-29_16-47-10_Snipaste_2020-11-29_16-45-42.png" >}}


## TE-CL {#te-cl}

和 `CL-TE` 类似，只是前端代理服务器处理 Transfer-Encoding 这一请求头，而后端服务器处
理 Content-Length 请求头。

构造 GPOST 请求

{{< figure src="/ox-hugo/2021-01-15_19-17-54_2020-11-29_17-24-34_Snipaste_2020-11-29_17-23-54.png" >}}


## TE-TE {#te-te}

当收到存在两个请求头的请求包时，前后端服务器都处理 Transfer-Encoding 请求头，这确
实是实现了 RFC 的标准。不过前后端服务器毕竟不是同一种，这就有了一种方法，我们可以
对发送的请求包中的 Transfer-Encoding 进行某种混淆操作，从而使其中一个服务器不处理
Transfer-Encoding 请求头。从某种意义上还是 CL-TE 或者 TE-CL。

比如通过无效的传输编码，使后端服务器忽略 TE 头而处理 CL 头，构成 `TE-CL` 攻击

{{< figure src="/ox-hugo/2021-01-15_19-18-18_2020-11-29_17-27-51_Snipaste_2020-11-29_17-25-45.png" >}}
