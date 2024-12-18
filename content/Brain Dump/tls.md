---
title: "TLS"
author: ["4shen0ne"]
draft: false
---

## 简介 {#简介}

传输层安全性协议（Transport Layer Security，TLS）是一种介于传输层和应用层之间的
网络协议，目的是为应用层协议（比如 HTTP、FTP、Telnet 等）提供透明的安全保护机制，
包括数据加密、身份认证、保障数据完整性等。

TLS 的前身为安全套接层协议（Secure Sockets Layer，SSL），SSL 经历了三个版本的更
迭，最后的 SSL3.0 在 RFC-7568 标准中被弃用。[IETF](https://zh.wikipedia.org/wiki/%E4%BA%92%E8%81%94%E7%BD%91%E5%B7%A5%E7%A8%8B%E4%BB%BB%E5%8A%A1%E7%BB%84) 在 RFC-2246 中将 SSL 标准化，并
将其称为 TLS。

{{< figure src="/ox-hugo/_20240713_201540screenshot.png" caption="<span class=\"figure-number\">Figure 1: </span>时间线" >}}


## 协议格式 {#协议格式}

SSL/TLS 协议有一个高度模块化的架构，分为很多子协议，这些子协议也可以细分为握手层
和记录层，如下图所示：

{{< figure src="/ox-hugo/_20240713_203226screenshot.png" >}}


## 工作流程 {#工作流程}

对应 SSL/TLS 协议的架构，其工作流程也被设计为两个阶段——握手阶段和应用阶段。

-   握手阶段：也称协商阶段，这一阶段主要目标是协商安全参数和算法套件、身份认证（基
    于[数字证书](https://aws.amazon.com/cn/what-is/ssl-certificate/)），以及进行密钥交换生成后续加密通信所使用的密钥。
-   应用阶段：双方使用握手阶段协商好的密钥进行安全通信。

{{< figure src="/ox-hugo/_20240713_204206screenshot.png" >}}
