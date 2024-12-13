---
title: "RabbitMQ"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:45+08:00
draft: false
---

RabbitMQ 是一个开源的 [AMQP]({{< relref "amqp.md" >}}) 实现，服务器端用 Erlang 语言编写，支持多种客户端，如：
Python、Ruby、.NET、Java、JMS、C、PHP、ActionScript、XMPP、STOMP 等，支持 AJAX。
用于在分布式系统中存储转发消息，在易用性、扩展性、高可用性等方面表现不俗。

应用场景：

1.  异步处理
2.  应用解耦
3.  流量削峰


## 基本概念 {#基本概念}


### Message {#message}

消息，消息是不具名的，它由消息头和消息体组成。消息体是不透明的，而消息头则由一系
列的可选属性组成，这些属性包括 routing-key（路由键）、priority（相对于其他消息的
优先权）、delivery-mode（指出该消息可能需要持久性存储）等。


### Publisher {#publisher}

消息的生产者，也是一个向交换器发布消息的客户端应用程序。


### Exchange {#exchange}

交换器，用来接收生产者发送的消息并将这些消息路由给服务器中的队列。


### Routing Key {#routing-key}

路由关键字，exchange 根据这个关键字进行消息投递。


### Binding {#binding}

绑定，用于消息队列和交换器之间的关联。一个绑定就是基于路由键将交换器和消息队列连
接起来的路由规则，所以可以将交换器理解成一个由绑定构成的路由表。


### Queue {#queue}

消息队列，用来保存消息直到发送给消费者。它是消息的容器，也是消息的终点。一个消息
可投入一个或多个队列。消息一直在队列里面，等待消费者连接到这个队列将其取走。


### Connection {#connection}

网络连接，比如一个 TCP 连接。


### Channel {#channel}

信道，多路复用连接中的一条独立的双向数据流通道。信道是建立在真实的 TCP 连接内地
虚拟连接，AMQP 命令都是通过信道发出去的，不管是发布消息、订阅队列还是接收消息，
这些动作都是通过信道完成。因为对于操作系统来说建立和销毁 TCP 都是非常昂贵的开销，
所以引入了信道的概念，以复用一条 TCP 连接。


### Consumer {#consumer}

消息的消费者，表示一个从消息队列中取得消息的客户端应用程序。


### Virtual Host {#virtual-host}

虚拟主机，表示一批交换器、消息队列和相关对象。虚拟主机是共享相同的身份认证和加密
环境的独立服务器域。每个 vhost 本质上就是一个 mini 版的 RabbitMQ 服务器，拥有自
己的队列、交换器、绑定和权限机制。vhost 是 AMQP 概念的基础，必须在连接时指定，
RabbitMQ 默认的 vhost 是 `/` 。


### Broker {#broker}

表示消息队列服务器实体。它提供一种传输服务,它的角色就是维护一条从生产者到消费者
的路线，保证数据能按照指定的方式进行传输,
