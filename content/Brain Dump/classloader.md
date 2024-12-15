---
title: "Java ClassLoader"
author: ["4shen0ne"]
tags: ["jvm", "java"]
draft: false
---

众所周知 Java 是编译型语言，需要先将源代码编译成字节码文件后，再通过 JVM 执行。
ClassLoader 的作用就是将字节码文件中的 Java 类加载到 JVM(内存)中。

java 类加载方式有两种：

1.  隐式装载，程序在运行过程中当碰到通过 new 等方式生成对象时，隐式调用类装载器加
    载对应的类到 jvm 中
2.  显式装载，通过 `class.forname()` 等方法，显式加载需要的类

类加载机制体现了 java 的动态性——程序启动时不需要将所有类一次性加载到 jvm 中，只需要
加载基础类，其他类等到 jvm 用到时再加载，节省了内存开销。


## 委托机制 {#委托机制}

Java 装载类使用“全盘负责委托机制”。

“全盘负责”是指当一个 ClassLoder 装载一个类时，除非显式使用另外一个 ClassLoder，否则
该类所依赖及引用的类也由这个 ClassLoder 载入

委托机制也称为双亲委派，是指先委托父类装载器寻找目标类，只有在找不到的情况下才从
自己的类路径中查找并装载目标类。这一点是从安全方面考虑的，试想如果一个人写了一个
恶意的基础类(如 `java.lang.String`)并加载到 JVM，将会引起严重的后果。但由于委托机
制的存在，java.lang.String 永远是由根装载器来装载

双亲委派只是一种推荐的策略，并不是强制的，实际上有不少打破双亲委派的应用场景，比
如 [OSGi]({{< relref "osgi.md" >}})


## JVM 内置加载器 {#jvm-内置加载器}

1.  Bootstrp ClassLoader

    用 `C++` 语言写的，在 Java 虚拟机启动后初始化，它主要负责加载 `%JAVA_HOME%/jre/lib`
    、-Xbootclasspath 参数指定的路径以及 `%JAVA_HOME%/jre/classes` 中的类。

    Bootstrap Loader 是用 `C++` 实现的，在 java 的逻辑中不存在此加载器的实体，试图打印
    其内容时会输出 null。

2.  Extension ClassLoader

    Bootstrp loader 加载 ExtClassLoader，并且将 ExtClassLoader 的父加载器设置为
    Bootstrp loader。

    ExtClassLoader 是用 Java 写的，具体来说是 `sun.misc.Launcher$ExtClassLoader` ，
    ExtClassLoader 主要加载 `%JAVA_HOME%/jre/lib/ext` 路径下的所有 classes 目录以及
    `java.ext.dirs` 系统变量指定路径中的类库。

3.  Application ClassLoader

    Bootstrp loader 加载完 ExtClassLoader 后，就会加载 AppClassLoader，并且将
    AppClassLoader 的父加载器指定为 ExtClassLoader。

    AppClassLoader 也是用 Java 写成的，它的实现类是 `sun.misc.Launcher$AppClassLoader`
    ，另外我们知道 ClassLoader 中有个 getSystemClassLoader 方法，此方法返回的正是
    AppclassLoader。AppClassLoader 主要负责加载 classpath 所指定的位置的类或者是 jar
    文档，它也是 Java 程序默认的类加载器。
