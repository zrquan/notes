---
title: "Unsafe类"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

`sun.misc.Unsafe` 是 Java 底层 API(仅限 Java 内部使用，[反射]({{< relref "reflection.md" >}})可调用)提供的一个神奇的 Java
类，Unsafe 提供了非常底层的内存、CAS、线程调度、类、对象等操作、Unsafe 正如它的名
字一样它提供的几乎所有的方法都是不安全的。

Unsafe 是 Java 内部 API，外部是禁止调用的，在编译 Java 类时如果检测到引用了 Unsafe 类也
会有禁止使用的警告：Unsafe 是内部专用 API, 可能会在未来发行版中删除。

Unsafe 代码片段：

```java
import sun.reflect.CallerSensitive;
import sun.reflect.Reflection;

public final class Unsafe {

    private static final Unsafe theUnsafe;

    static {
        theUnsafe = new Unsafe();
        ......
    }

    private Unsafe() {
    }

    @CallerSensitive
    public static Unsafe getUnsafe() {
        Class var0 = Reflection.getCallerClass();
        if (var0.getClassLoader() != null) {
            throw new SecurityException("Unsafe");
        } else {
            return theUnsafe;
        }
    }

    ......
}
```

由于构造函数是私有的，不能通过 new 获取实例，且在 getUnsafe 方法中会检测[类加载器]({{< relref "classloader.md" >}})，默
认只允许 Bootstrap Classloader 调用

通过反射获取 Unsafe 类的两种方法：

```java
// 反射获取Unsafe的theUnsafe成员变量
Field theUnsafeField = Unsafe.class.getDeclaredField("theUnsafe");
// 反射设置theUnsafe访问权限
theUnsafeField.setAccessible(true);
// 反射获取theUnsafe成员变量值
Unsafe unsafe = (Unsafe) theUnsafeField.get(null);
```

```java
// 获取Unsafe无参构造方法
Constructor constructor = Unsafe.class.getDeclaredConstructor();
// 修改构造方法访问权限
constructor.setAccessible(true);
// 反射创建Unsafe类实例，等价于 Unsafe unsafe1 = new Unsafe();
Unsafe unsafe1 = (Unsafe) constructor.newInstance();
```
