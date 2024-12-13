---
title: "JDBC Attack"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:18+08:00
tags: ["java"]
draft: false
---

<https://su18.org/post/jdbc-connection-url-attack/>

JDBC 通过 URL/URI 连接指定的数据库，URL 由三个部分组成：driver name, 地址，以及
参数。其中 autoDeserialize 参数会让 JDBC 客户端自动反序列化服务端返回的数据（执
行 getObject 方法）

比如， `mysql-connector-java 8.0.14` 中的 ResultSetImpl 类实现了
java.sql.ResultSet 并且重写了 getObject 方法，当设置了 autoDeserialize 参数就反
序列化服务端返回的数据并且执行 readObject

{{< figure src="/ox-hugo/_20220516_142159screenshot.png" >}}

但是默认情况下 JDBC 不会执行 getObject 方法，研究人员发现了一条利用链可以利用
ServerStatusDiffInterceptor 执行 getObject 方法：

```nil
ServerStatusDiffInterceptor.preProcess()
  -> ServerStatusDiffInterceptor.populateMapWithSessionStatusValues()
    -> ResultSetUtil.resultSetToMap()
      -> rs.getObject()
```

{{< figure src="/ox-hugo/_20220516_142941screenshot.png" >}}
