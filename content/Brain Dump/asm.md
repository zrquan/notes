---
title: "ASM"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

使用 ASM 可以动态修改类、方法，甚至可以重新定义类，连 CGLib 底层都是用 ASM 实现的。
相应的，门槛也比较高，需要对 Java 的字节码文件有所了解，熟悉 JVM 的编译指令。

在 ASM 的代码实现里，最明显的就是访问者模式，ASM 将对代码的读取和操作都包装成一
个访问者，在解析 <span class="underline">JVM 加载到的字节码</span> 时调用。

ClassReader 是 ASM 代码的入口，通过它解析二进制字节码，实例化它时，我们需要传入
一个 ClassVisitor，在这个 Visitor 里，我们可以实现
visitMethod()/visitAnnotation() 等方法，用以定义对类结构(如方法、字段、注解)的访
问方法。

ClassWriter 接口继承了 ClassVisitor 接口，我们在实例化类访问器时，将 ClassWriter
“注入” 到里面，以实现对类写入的声明。
