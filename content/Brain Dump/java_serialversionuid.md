---
title: "Java serialVersionUID"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:16+08:00
tags: ["java"]
draft: false
---

当一个类实现了 Serializable 接口时，IDE 通常会提示声明一个 serialVersionUID 静态
常量：

```java
private static final long serialVersionUID = 1L;
```

serialVersionUID 是 Java 为每个序列化类产生的版本标识，可用来保证在反序列时，发
送方发送的和接受方接收的是可兼容的对象。如果接收方接收的类的 serialVersionUID 与
发送方发送的 serialVersionUID 不一致，进行反序列时会抛出 InvalidClassException

Java 会给可序列化的类生成一个默认的 serialVersionUID 值，但是默认生成的值很可能
因为 jdk 版本不同或者类中的一些成员差异而不同，导致无法兼容。所以建议开发者根据
实际需求显式声明 serialVersionUID

使用 `@SuppressWarnings("serial")` 可以关闭警告
