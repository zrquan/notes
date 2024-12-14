---
title: "Oracle MySQL JDBC XXE 漏洞"
author: ["4shen0ne"]
lastmod: 2024-12-14T17:49:14+08:00
tags: ["java"]
draft: false
---

这个漏洞是由于 MySQL JDBC 8.0.27 版本之前，存在 `getSource()` 方法未对传入的 XML
数据做校验，导致攻击者可以在 XML 数据中引入外部实体，造成 XXE 攻击。

getSource 方法，判断当 clazz 是 DOMSource 类型时，使用 DocumentBuilder 解析 XML
数据：

{{< figure src="/ox-hugo/2021-12-09_11-28-24_screenshot.png" >}}

fix: 在 MySQL JDBC 8.0.27 版本开始设置了安全属性，在对象实例化之前做了校验：

{{< figure src="/ox-hugo/2021-12-09_11-28-55_screenshot.png" >}}
