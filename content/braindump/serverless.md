---
title: "Serverless"
author: ["4shen0ne"]
tags: ["cloud"]
draft: false
---

Serverless 即无服务器架构，也称为轻服务，它包含 FaaS 和 BaaS 两个部分。

{{< figure src="/ox-hugo/_20240615_135654screenshot.png" >}}


## 函数即服务（FaaS: Function as a Service） {#函数即服务-faas-function-as-a-service}

函数即服务提供的是计算能力。原有的计算能力，无论是容器也好，虚拟机也好都承载在一
定的操作系统之上，函数即服务把计算能力进行了进一步抽象。


## 后端即服务（BaaS: Backend as a Service） {#后端即服务-baas-backend-as-a-service}

后端设施是指数据库、消息队列、日志、存储，等等这一类用于支撑业务逻辑运行，但本身
无业务含义的技术组件，这些后端设施都运行在云中，无服务中称其为“后端即服务”。[^fn:1]

[^fn:1]: <https://icyfenix.cn/architecture/architect-history/serverless.html>
