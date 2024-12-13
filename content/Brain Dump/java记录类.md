---
title: "Java 记录类"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:18+08:00
tags: ["java"]
draft: false
---

从 Java 14 开始，提供新的 `record` 关键字，可以非常方便地定义 Data Class：

1.  使用 record 定义的是不变类；
2.  可以编写 Compact Constructor 对参数进行验证；
3.  可以定义静态方法。

使用 record 关键字定义数据类：

```java
public record Point(int x, int y) {}
```

使用传统方法定义数据类：

```java
public final class Point extends Record {
    private final int x;
    private final int y;

    public Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public int x() {
        return this.x;
    }

    public int y() {
        return this.y;
    }

    public String toString() {
        return String.format("Point[x=%s, y=%s]", x, y);
    }

    public boolean equals(Object o) {
        ...
    }
    public int hashCode() {
        ...
    }
}
```

可以看出记录类有点向 kotlin 中的数据类，不过类的属性是不变的
