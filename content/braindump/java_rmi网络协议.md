---
title: "Java RMI网络协议"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

## Overview {#overview}

RMI 协议使用了两种其他协议用于网络通信：Java 序列化和 HTTP。序列化协议用于执行
marshal call 和返回数据，而 HTTP 用于“提交”远程方法调用并在需要的时候获取返回数
据。

link: <https://docs.oracle.com/javase/9/docs/specs/rmi/protocol.html>


## Format of an Output Stream {#format-of-an-output-stream}

An output stream in RMI consists of transport Header information followed by a
sequence of Messages. Alternatively, an output stream can contain an invocation
embedded in the HTTP protocol.

-   Out:
    Header Messages
    HttpMessage
-   Header:
    0x4a 0x52 0x4d 0x49 Version Protocol
-   Version:
    0x00 0x01
-   Protocol:
    StreamProtocol
    SingleOpProtocol
    MultiplexProtocol
-   StreamProtocol:
    0x4b
-   SingleOpProtocol:
    0x4c
-   MultiplexProtocol:
    0x4d
-   Messages:
    Message
    Messages Message


## Format of an Input Stream {#format-of-an-input-stream}

There are currently three types of input messages: ReturnData, HttpReturn and
PingAck. ReturnData is the result of a "normal" RMI call. An HttpReturn is a
return result from an invocation embedded in the HTTP protocol. A PingAck is the
acknowledgment for a Ping message.

-   In:
    ProtocolAck Returns
    ProtocolNotSupported
    HttpReturn
-   ProtocolAck:
    0x4e
-   ProtocolNotSupported:
    0x4f
-   Returns:
    Return
    Returns Return
-   Return:
    ReturnData
    PingAck
-   ReturnData:
    0x51 ReturnValue
-   PingAck:
    0x53
