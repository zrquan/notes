---
title: "JavaBean"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

JavaBean 是 Java 中的一种特殊类，主要用于封装多个对象或数据项成为一个对象。这是
一种标准的编程约定，通常用于在复杂的应用程序中传递数据消息。

以下是一些关于 JavaBean 的关键特征：

1.  序列化：JavaBeans 必须实现 `Serializable` 接口，这使得它们的实例可以轻松地保存
    和恢复，特别是在网络传输或持久化时。
2.  无参数构造函数：JavaBeans 必须提供一个无参数的构造函数。这使得可以在不提供任
    何初始化数据的情况下实例化。
3.  属性访问方法：JavaBeans 通过 getter 和 setter 方法来访问它们的属性。
4.  封装性：通常，JavaBeans 的属性将被设置为 private，通过 getter 和 setter 方法来
    访问，这符合封装原则，即隐藏对象的具体实现细节。

内省 (Introspector) 是 Java 语言对 JavaBean 类属性、事件的一种缺省处理方法。其中
的 propertiesDescriptor 实际上来自于对 Method 的解析。
