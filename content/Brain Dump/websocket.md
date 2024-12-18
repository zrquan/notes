---
title: "websocket"
author: ["4shen0ne"]
draft: false
---

WebSocket 协议是基于 TCP 协议上的独立的通信协议，在建立 WebSocket 通信连接前，需
要使用 HTTP 协议进行握手，从 HTTP 连接升级为 WebSocket 连接。浏览器和服务器只需
要完成一次握手，两者之间就直接可以创建持久性的连接，并进行双向数据传输。

WebSocket 定义了两种 URI 格式, `ws://` 和 `wss://` ，类似于 HTTP 和 HTTPS, `ws://` 使
用明文传输，默认端口为 80， `wss://` 使用 TLS 加密传输，默认端口为 443。

握手阶段涉及的 HTTP 头:

| Header                   | 必须   | 解释                         |
|--------------------------|------|----------------------------|
| Host                     | 是     | 服务端主机名                 |
| Upgrade                  | 是     | 固定值，“websocket”          |
| Connection               | 是     | 固定值，“Upgrade”            |
| Sec-WebSocket-Key        | 是     | 客户端临时生成的 16 字节随机值, base64 编码 |
| Sec-WebSocket-Version    | 是     | WebSocket 协议版本           |
| Origin                   | 否     | 可选, 发起连接请求的源       |
| Sec-WebSocket-Accept     | 是(服务端) | 服务端识别连接生成的随机值   |
| Sec-WebSocket-Protocol   | 否     | 可选，客户端支持的协议       |
| Sec-WebSocket-Extensions | 否     | 可选， 扩展字段              |

优点：

-   较少的控制开销：数据包头部协议较小，不同于 http 每次请求需要携带完整的头部
-   更强的实时性：相对于 http 请求需要等待客户端发起请求服务端才能响应，延迟明显更少
-   保持创连接状态：创建通信后，可省略状态信息，不同于 http 每次请求需要携带身份验证
-   更好的二进制支持：定义了二进制帧，更好处理二进制内容
-   支持扩展：用户可以扩展 websocket 协议、实现部分自定义的子协议
-   更好的压缩效果：websocket 在适当的扩展支持下，可以沿用之前内容的上下文，在传递
    类似的数据时，可以显著地提高压缩率
