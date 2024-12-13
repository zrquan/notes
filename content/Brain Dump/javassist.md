---
title: "Javassist"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:17+08:00
tags: ["java"]
draft: false
---

Javassit 是一个用来操作 Java 字节码的库，通过操作字节码可以实现[反射]({{< relref "reflection.md" >}})，即在运行时
更改类的实现的能力，而且比起使用反射 API 性能更好


## 使用 {#使用}

1.  首先获取到 class 定义的容器 `ClassPool`
2.  通过 `ClassPool` 获取已经编译好的类(Compile time class)，并给这个类设置一个父类
3.  使用 writeFile 将这个类的定义写到磁盘，以便后面使用

<!--listend-->

```java
ClassPool pool = ClassPool.getDefault();
CtClass cc = pool.get("test.Rectangle");
cc.setSuperclass(pool.get("test.Point"));
cc.writeFile();
```


## CtClass 方法 {#ctclass-方法}

-   加载字节码
    ```java
      byte[] b = cc.toBytecode();
      Class clazz = cc.toClass();
    ```

-   定义新的类
    ```java
      ClassPool pool = ClassPool.getDefault();
      CtClass cc = pool.makeClass("Point");
    ```

-   通过 CtMethod 和 CtField 增加属性和方法
    ```java
      ClassPool pool = ClassPool.getDefault();
      CtClass cc = pool.makeClass("foo");
      CtMethod mthd = CtNewMethod.make("public Integer getInteger() { return null; }", cc);
      cc.addMethod(mthd);CtField f = new CtField(CtClass.intType, "i", cc);
      point.addField(f);clazz = cc.toClass(); Object instance = class.newInstance();
    ```
