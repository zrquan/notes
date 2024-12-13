---
title: "Java Native Interface"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:16+08:00
tags: ["java"]
draft: false
---

JNI（Java Native Interface，Java 本地接口）是一种编程框架，使得 JVM 中的 Java 程
序可以调用本地应用或库，也可以被其他程序调用。本地程序一般是用其它语言（C、C++或
汇编语言等）编写的，并且被编译为基于本机硬件和操作系统的程序。


## 示例：通过 JNI 调用 C 函数 {#示例-通过-jni-调用-c-函数}

```java
public class HelloWorld {
    // 声明本地方法
    public native void printHelloWorld();

    static {
        // 加载本地库
        System.loadLibrary("hello");
    }

    public static void main(String[] args) {
        new HelloWorld().printHelloWorld();
    }
}
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  Java 代码
</div>

```c
#include <jni.h>
#include <stdio.h>
#include "HelloWorld.h"  // 通过 javac 生成的头文件

// 实现本地方法
JNIEXPORT void JNICALL Java_HelloWorld_printHelloWorld(JNIEnv *env, jobject obj) {
    printf("Hello, World from C!\n");
}
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 2:</span>
  C 代码
</div>


### 编译和运行 {#编译和运行}

1.  编译 Java 代码

    ```text
    javac HelloWorld.java
    ```

2.  生成 C 头文件

    ```text
    javac -h . HelloWorld.java
    ```

3.  编译 C 代码为共享库

    在 Linux 和 macOS 上，使用 gcc 或 clang 编译 C 代码：

    ```text
    gcc -shared -o libhello.so -fPIC HelloWorld.c -I${JAVA_HOME}/include -I${JAVA_HOME}/include/linux
    ```

    在 Windows 上，使用 cl 编译器：

    ```text
    cl /LD HelloWorld.c /I"%JAVA_HOME%\include" /I"%JAVA_HOME%\include\win32" /Fehello.dll
    ```

    这将生成一个共享库文件，在 Linux 和 macOS 上是 libhello.so，在 Windows 上是
    hello.dll。

4.  运行 Java 程序

    ```text
    java -Djava.library.path=. HelloWorld
    ```
