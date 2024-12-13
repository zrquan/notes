---
title: "上溯转型"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:08+08:00
tags: ["java"]
draft: false
---

上溯转型是将子类对象赋值给父类句柄的操作，它在 Java 多态性的一种体现。

```java
class People {...}
class Man extends People {...}
People man = new Man();
```

使用上溯转型是为了减少重复代码，专注于和基础类(父类)打交道，同时也提高了系统扩展
性。

虽然我们在编码时通过上溯转型得到的是父类句柄，但实际上 Java 的变量绑定是发生在运
行时的(动态绑定)，所以具体执行哪个方法取决于对象的真实类型而不是句柄类型。
