---
title: "SOAP"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:56+08:00
draft: false
---

SOAP 即 Simple Object Access Protocol，简单对象访问协议，它提供了类似 RPC 的作用，
可以在不同的主机间远程访问对象，和 RPC 不同的是它使用 HTTP 协议作为载体，用 XML
格式来作为请求和响应的标准，因为 HTTP 协议使用广泛、兼容性好、而且通常不会被防火
墙拦截。

基本结构：

```xml
<?xml version="1.0"?>
<soap:Envelope
xmlns:soap="http://www.w3.org/2001/12/soap-envelope"
soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">

<soap:Header>
  ...
  ...
</soap:Header>

<soap:Body>
  ...
  ...
  <soap:Fault>
    ...
    ...
  </soap:Fault>
</soap:Body>

</soap:Envelope>
```

Envelope 是根元素，用来指定当前 XML 文档是 SOAP 消息；Header 包含 SOAP 程序的一
些专用信息，比如认证和支付等等；Body 是实际发送的消息内容；Fault 用来指示错误信息。
