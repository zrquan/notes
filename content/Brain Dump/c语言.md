---
title: "C语言"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:08+08:00
draft: false
---

## C 中的变量声明 {#c-中的变量声明}

变量声明向编译器保证变量以指定的类型和名称存在，这样编译器在不需要知道变量完整细
节的情况下也能继续进一步的编译。变量声明只在编译时有它的意义，在程序连接时编译器
需要实际的变量声明。

变量声明的两种情况：

1.  需要建立存储空间的。例如：int a 在声明的时候就已经建立了存储空间。
2.  不需要建立存储空间的，通过使用extern关键字声明变量名而不定义它。 例如：extern
    int a 其中变量 a 可以在别的文件中定义的。


## C 位域 {#c-位域}

如果一个结构体中包含多个开关量（只有 true/false），比如：

```c
struct
{
  unsigned int widthValidated;
  unsigned int heightValidated;
} status;
```

这种结构需要 8 字节的内存空间，但在实际上，在每个变量中我们只存储 0 或 1。

在这种情况下，C 语言提供了一种更好的利用内存空间的方式。如果您在结构内使用这样的
变量，您可以定义变量的宽度来告诉编译器，您将只使用这些字节。例如，上面的结构可以
重写成：

```c
struct
{
  unsigned int widthValidated : 1;
  unsigned int heightValidated : 1;
} status;
```

现在status 变量将占用 4 个字节的内存空间，但是只有 2 位被用来存储值，当存储的变
量超过 32 个（4 字节）时内存空间才会扩展为8 个字节


## kotlin/native 和 c 交互 {#kotlin-native-和-c-交互}

1.  通过 `.def` 文件描述需要绑定的 c 库（bindings）
2.  使用 cinterop 工具生成 kotlin bindings
3.  使用 kotlin/native 编译器生成可执行文件

<https://kotlinlang.org/docs/native-c-interop.html>

但通常不需要自己构建 bindings, 可以用 kotlin 提供的平台库：POSIX on Linux/macOS
platforms, Win32 on Windows platform, or Apple frameworks on macOS/iOS
