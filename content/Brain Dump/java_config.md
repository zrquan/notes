---
title: "Java Config"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:16+08:00
tags: ["java"]
draft: false
---

Spring JavaConfig 是 Spring 社区的产品，从 Spring 3.0 引入，它提供了使用纯 Java 代
码配置 Spring IOC 容器的方法，助于避免使用 XML 配置。使用 JavaConfig 的优点在于：

1.  面向对象的配置。由于配置被定义为 JavaConfig 中的类，因此用户可以充分利用 Java
    中的面向对象功能。一个配置类可以继承另一个，重写它的 @Bean 方法等。

2.  减少或消除 XML 配置，实际上可以只是用 JavaConfig 配置类来配置容器，但很多人觉
    得将 JavaConfig 与 XML 混合匹配更理想。

3.  类型安全和重构友好。JavaConfig 提供了一种类型安全的方法来配置 Spring 容器。由
    于 Java 5.0 对泛型的支持，现在可以按类型而不是按名称检索 bean，不需要任何强制
    转换或基于字符串的查找。

常用的注解：

-   @Configuration：在类上打上写下此注解，表示这个类是配置类
-   @ComponentScan：在配置类上添加 @ComponentScan 注解，该注解默认会扫描该类所在的
    包下所有的配置类，相当于之前的 `<context:component-scan >`
-   @Bean：bean 的注入，相当于以前的 `<bean id="objectMapper" class="org.codehaus.jackson.map.ObjectMapper" />`
-   @EnableWebMvc：相当于 xml 的 `<mvc:annotation-driven >`
-   @ImportResource：相当于 xml 的 `<import resource="applicationContext-cache.xml">`
