---
title: "JNI"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

JNI（Java Native Interface，Java 本地接口）是一种编程框架，使得 JVM 中的 Java 程
序可以调用本地应用或库，也可以被其他程序调用。本地程序一般是用其它语言（C、C++或
汇编语言等）编写的，并且被编译为基于本机硬件和操作系统的程序

JNI 调用 C 代码的例子：

```java
public class HelloJNI {
    static {
        // 将本地动态库加载到内存（hello.dll 或者 libhello.so）
        // 该库中包含一个 sayHello 方法
        System.loadLibrary("hello");
    }

    // 通过 native 关键字声明一个本地方法，不需要方法体
    private native void sayHello();

    public static void main(String[] args) {
        // 实际会调用从本地库中载入的方法
        new HelloJNI().sayHello();
    }
}
```

接下来还需要用 C 实现 sayHello 方法，用 `javac -h . HelloJNI.java` 生成头文件
HelloJNI.h, 文件中包含 sayHello 方法的声明：

```c
/*
 * Class:     HelloJNI
 * Method:    sayHello
 * Signature: ()V
 */
JNIEXPORT void JNICALL Java_HelloJNI_sayHello(JNIEnv *, jobject);
```

然后在 C 程序文件 HelloJNI.c 文件中引入这个头文件，并实现 Java_HelloJNI_sayHello
方法。最后根据不同平台将 HelloJNI.c 编译成对应的本地库

-   <https://www3.ntu.edu.sg/home/ehchua/programming/java/JavaNativeInterface.html>
-   <https://tttang.com/archive/1622/>
