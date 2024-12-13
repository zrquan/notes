---
title: "AccessController"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:01+08:00
tags: ["java"]
draft: false
---

AccessController（访问控制器）是一个在 Java Security API 中非常关键的类，用于在
Java 安全模型中控制访问权限。它允许应用程序通过安全管理器执行权限检查，以确保在
执行敏感操作之前有适当的权限。

AccessController 的工作原理基于以下几点：

1.  CodeSource, 代码源

    CodeSource 类封装了访问控制器要装载的类的地址、签名等相关信息，最终由类装载器
    负责装载和管理。

2.  Permission, 权限

    Permission 是一个抽象类，其不同的实现类在安全策略文件中体现为不同的权限类型，
    每个实例代表一个特定的权限。

    通过继承 Permission 可以自定义权限类，它的抽象方法如下：
    ```java
       public abstract boolean implies(Permission permission);
       public abstract boolean equals(Object obj);
       public abstract int hashCode();
       public abstract String getActions();
    ```

3.  Policy, 策略

    Policy 类是对安全策略的定义，访问控制器需要确定权限应用于哪些代码源，从而为其
    提供相应的功能，这就是所谓的安全策略。

    默认的安全策略类由 `sun.security.provider.PolicyFile` 提供，该类基于 JDK 中配置
    的策略文件(`%JAVA_HOME%/jre/lib/security/java.policy`)对特定代码源进行权限配置。

4.  ProtectionDomain, 保护域

    保护域就是一个授权项，可以理解为是代码源和对应权限的组合。JVM 中每个类都属于
    且仅属于一个保护域，由代码源指定的地址装载得到，同时代码源所在保护域包含的权
    限集规定了一些权限，这个类就拥有这些权限。
