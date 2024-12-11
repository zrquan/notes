---
title: "HTTP/2"
author: ["4shen0ne"]
draft: false
---

HTTP/2 标准于 2015 年 5 月以 RFC 7540 正式发表，它保留了 HTTP/1.1 的大部分语义，例
如请求方法、状态码乃至 URI 和绝大多数 HTTP 头字段一致。同时，HTTP/2 采用了新的方法来
编码和传输数据，可以有效减少网络延迟，提高浏览器加载页面的速度。

新特性：

1.  头部使用 HPACK 算法压缩。

2.  将一个 TCP 连接分为若干个流（Stream），每个流中可以传输若干消息（Message），每
    个消息由若干最小的二进制帧（Frame）组成。每个用户的操作行为被分配了一个流编号
    （Stream ID），这意味着用户与服务端之间建立了一个 TCP 通道。

3.  引入了服务器推送，即服务端向客户端发送比客户端请求更多的数据。这允许服务器直
    接提供浏览器渲染页面所需资源，而无须浏览器在收到、解析页面后再提起一轮请求，
    节约了加载时间。


## 头部压缩 {#头部压缩}

HTTP 报文可以分为 `Header` 和 `Body` 两部分，在 HTTP/1.1 中可以通过 `Content-Encoding`
头指定 `Body` 的压缩方式，比如 gzip 压缩。而在 HTTP/2 中，引入了 HPACK 算法来对
`Header` 部分进行压缩，进一步节约带宽。

{{< figure src="/ox-hugo/_20240705_225204screenshot.png" >}}


### HPACK {#hpack}


#### 静态字典 {#静态字典}

客户端与服务端根据 RFC 7541 的附录 A，维护一份共同的静态字典（Static Table）。

{{< figure src="/ox-hugo/_20240705_222355screenshot.png" >}}

如上图所示，字典中预设了 61 组数据，包括常见的 HTTP 头、请求方法等等。而且有些数
据中包含键值对，有些数据只有键没有值，因为这部分值并不是固定的，这些值会经过
Huffman 编码后再发送。

下面以一个 server 头为例子，它在 HTTP/1.1 的形式如下：

```text
server: nghttpx\r\n
```

算上冒号空格和末尾的 `\r\n` ，共占用了 17 字节；而使用了静态字典和 Huffman 编码，
可以将它压缩成 8 字节，压缩率大概 47%。

{{< figure src="/ox-hugo/_20240705_223251screenshot.png" caption="<span class=\"figure-number\">Figure 1: </span>HTTP/2 网络包" >}}

上图中，第一个字节表示 server 头在字典中的索引为 54（110110，前面的 01 为固定值）；
第二个字节的首个比特位表示 Value 是否经过 Huffman 编码，后 7 位表示 Value 编码后
的长度；剩下 6 个字节就是 `nghttpx` 经过 Huffman 编码后的值（末尾用 1 填充）。

{{< figure src="/ox-hugo/_20240705_224113screenshot.png" caption="<span class=\"figure-number\">Figure 2: </span>头部二进制格式" >}}

{{< figure src="/ox-hugo/_20240705_224213screenshot.png" >}}


#### 动态字典 {#动态字典}

客户端和服务端根据先入先出的原则，维护一份可动态添加内容的共同动态字典（Dynamic
Table），当 HTTP 头不在静态字典的 61 个预设数据中时，可以从 62 开始动态更新字典。

由于客户端和服务端需要 <span class="underline">同时更新字典</span> ，才能使后续请求用索引代替具体的数据，所以动
态表必须作用在同一个连接上，而且要重复传输完全相同的 HTTP 头（如果数据变化了字典
也会更新）。

当动态字典越大，占用的内存也就越大，可能会影响服务器性能，因此 Web 服务器都会提
供类似 `http2_max_requests` 的配置，用于限制一个连接上能够传输的请求数量。


## 二进制帧 {#二进制帧}

有别于 HTTP/1.1 在连接中的明文请求，HTTP/2 将一个 TCP 连接分为若干个流（Stream），
每个流中可以传输若干消息（Message），每个消息由若干二进制帧（Frame）组成。

HTTP/2 把报文数据划分成两类帧， `Headers Frame` 和 `Data Frame` ，分别对应 HTTP/1.1
中的请求头和请求体。

{{< figure src="/ox-hugo/_20240705_233059screenshot.png" >}}

单个二进制帧的结构如下：

{{< figure src="/ox-hugo/_20240705_234851screenshot.png" >}}

在帧头中有一个字节用来表示帧的类型，分为数据帧和控制帧两大类：

{{< figure src="/ox-hugo/_20240705_235141screenshot.png" >}}


## 多路复用 {#多路复用}

前面提到过 HTTP/2 中的 Stream、Message、Frame 间的关系，具体如下图所示：

{{< figure src="/ox-hugo/_20240708_212023screenshot.png" >}}

{{< figure src="/ox-hugo/_20240708_212118screenshot.png" >}}

从图中可以看到，客户端和服务端的同一个请求和响应会在一个 Stream 中完成，而在一个
TCP 连接中可以存在多个 Stream，实现数据传输的多路复用。而且 HTTP/2 为每个用户的
操作行为分配了一个 Stream ID，因此不同的 Stream 在一个 TCP 连接中不需要按照顺序
来收发，只要根据 ID 就能正确处理各个 Stream 的数据（同一 Stream 内的帧必须是严格
有序的）。

{{< figure src="/ox-hugo/_20240708_215403screenshot.png" >}}

由于不同的 Stream 不需要按照顺序传输，解决了 HTTP/1.x 中的[队头阻塞](https://zh.wikipedia.org/wiki/%E9%98%9F%E5%A4%B4%E9%98%BB%E5%A1%9E)问题。

客户端和服务器双方都可以建立 Stream，因为服务端可以主动推送资源给客户端，客户端
建立的 Stream ID 必须是奇数，而服务器建立的 Stream ID 必须是偶数。

{{< figure src="/ox-hugo/_20240708_215547screenshot.png" >}}

同一个 TCP 连接中的 Stream ID 是不能复用的，只能顺序递增，所以当 Stream ID 耗尽
时，需要发一个控制帧 `GOAWAY` 用来关闭 TCP 连接。


## 服务器推送 {#服务器推送}

HTTP/1.1 不支持服务器主动推送资源给客户端，所有资源都需要由客户端发起请求来获取，
比如客户端访问 HTML 页面，页面中使用的所有 CSS、JavaScript 等资源都需要浏览器来
请求获取。而在 HTTP/2 中，服务器可以将这些页面使用到的资源主动推送给客户端，节省
发起请求带来的消耗。

{{< figure src="/ox-hugo/_20240708_220243screenshot.png" >}}

在 Nginx 中，如果希望客户端访问 `/test.html` 时，服务器直接推送 `/test.css` ，可以这
样配置：

```nil
location /test.html {
  http2_push /test.css;
}
```
