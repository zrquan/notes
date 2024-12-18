---
title: "Wire Protocol"
author: ["4shen0ne"]
draft: false
---

在 RPC 过程中，两个服务的 Endpoint 之间通过网络相互操作和交换数据，但是除了业务
所需的序列化数据之外，RPC 还需要其他信息来维持通信过程的可靠性，比如异常、超时、
安全、认证、授权、事务，等等，都可能产生双方交换信息的需求。而这一行为依赖的通信
协议在计算机科学中称为 Wire Protocol。

常见的 Wire Protocol 有：

-   [Java RMI]({{< relref "java_rmi.md" >}}) 的 Java Remote Message Protocol（JRMP，也支持 RMI-IIOP）
-   CORBA 的 Internet Inter ORB Protocol（[IIOP]({{< relref "iiop.md" >}})，是 GIOP 协议在 IP 协议上的实现版本）
-   DDS 的 Real Time Publish Subscribe Protocol（RTPS）
-   Web Service 的 Simple Object Access Protocol（[SOAP]({{< relref "soap.md" >}})）
