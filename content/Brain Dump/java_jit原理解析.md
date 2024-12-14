---
title: "Java JIT原理解析"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

JIT(Just In Time)，即时编译器，通过将代码编译成本地代码来提高程序的运行效率

Java 程序的运行过程中存在解释执行和编译执行两种情况，解释执行由解释器直接运行
class 字节码，而随着时间推移，越来越多的热点代码会被 JIT 编译器编译成本地代码，
提高这部分代码的执行效率

{{< figure src="../.images/_20220609_192038ba83857ecf9f344e4972fd551c4973d653952.png" >}}


## JIT Compiler (HotSpot VM) {#jit-compiler--hotspot-vm}


### Client Compiler {#client-compiler}

Client 编译器也叫 C1 编译器，它的启动速度比较快但是编译质量较差，C1 会做的三件事：

1.  局部简单可靠的优化，比如字节码上进行的一些基础优化，方法内联、常量传播等，放
    弃许多耗时较长的全局优化
2.  将字节码构造成高级中间表示（High-level Intermediate Representation, HIR），
    HIR 与平台无关，通常采用图结构，更适合 JVM 对程序进行优化
3.  最后将 HIR 转换成低级中间表示（Low-level Intermediate Representation, LIR），在
    LIR 的基础上会进行寄存器分配、窥孔优化等操作，最终生成机器码


### Server Compiler {#server-compiler}

通常指 C2 编译器，主要关注一些编译耗时较长的全局优化，甚至会还会根据程序运行的信
息进行一些不可靠的激进优化。其性能通常比 C1 高 30% 以上

从 JDK 9 开始，Hotspot VM 中集成了一种新的 Server compiler——Graal 编译器，使用 Java 编
写，且峰值性能比 C2 更好。通过 `-XX:+UnlockExperimentalVMOptions
-XX:+UseJVMCICompiler` 参数启用
