---
title: "MBean"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

MBean 是 Managed Bean 的简称，在 JMX 中 MBean 代表一个被管理的资源实例，其模型和
[JavaBean]({{< relref "javabean.md" >}}) 相同，不过遵循一些额外的规则方便 MBeanServer 对其生命周期进行监控和管理

1.  必须是公共的，非抽象的类
2.  必须有至少一个公共的构造器
3.  必须实现它自己相应的 MBean 接口或者实现 javax.management.DynamicMBean 接口
4.  可选的，一个 MBean 可以实现 javax.management.NotificationBroadcaster 接口
