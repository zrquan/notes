---
title: "SOA架构"
author: ["4shen0ne"]
draft: false
---

SOA(Service Oriented Architecture)，面向服务架构，并不是一种具体的技术，而是一种
设计模式，其中业务应用由各种服务组成。它拥有领导制定技术标准的组织 Open CSA；有
清晰软件设计的指导原则，譬如服务的封装性、自治、松耦合、可重用、可组合、无状态，
等等。同时明确了采用 [SOAP]({{< relref "soap.md" >}}) 作为远程调用的协议，利用一个被称为企业服务总线
（Enterprise Service Bus，ESB）的消息管道来实现各个子系统之间的通信交互，令各服
务间在 ESB 调度下无须相互依赖却能相互通信。
