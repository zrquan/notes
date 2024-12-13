---
title: "Re基础知识"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:48+08:00
draft: false
---

## x86 架构-寄存器 {#x86-架构-寄存器}

| 通用寄存器 | EAX    | 常用来存放返回数据 |
|-------|--------|-----------|
|         | EBX    | 存储器指针       |
|         | ECX    | 循环计数器       |
|         | EDX    | 用作乘除法操作数和返回值 |
|         | ESI    | 原数据指针寄存器 |
|         | EDI    | 目的数据指针寄存器 |
|         | ESP    | 栈指针           |
|         | EBP    | 指向栈上的数据   |
| ......  | ...    | ......           |
| 指令指针寄存器 | EIP    | 指向下一条将要执行的指令 |
| 标志寄存器 | EFLAGS | 一组状态，控制，系统标志位的集合 |


## x86_64 架构 {#x86-64-架构}

-   12 个数据寄存器(RAX、RBX、RCX、RDX、R8-R15)
-   2 个变址指针寄存器(RSI 和 RDI) 2 个指针寄存器(RSP 和 RBP)
-   6 个段寄存器(ES、CS、SS、DS、FS 和 GS)
-   1 个指令指针寄存器(RIP) 1 个标志寄存器(RFlags)


## 函数调用过程 {#函数调用过程}

函数调用过程：

1.  函数参数入栈
2.  EIP 入栈，同时 EIP 指向函数入口
3.  EBP 入栈
4.  抬高栈顶

函数返回过程：

1.  mov esp,ebp
2.  pop ebp
3.  ret
4.  add esp,x

{{< figure src="/ox-hugo/_20231209_093812screenshot.png" >}}


## 脱壳 {#脱壳}

无论怎么加密，压缩代码，最终还是要跳到程序的最初始的起点处执行！所以当跳到真正的
OEP（入口点）的时候，说明已经解密完成了

常见 OEP 标志：

-   命令行程序：
    GetVersion、GetCommandLineA
-   GUI 程序：
    GetVersion、GetCommandLineA、GetModuleHandleA

2~4 次的 push，然后 call 本地函数


### 压缩壳：压缩资源，减小体积 {#压缩壳-压缩资源-减小体积}

UPX、ASPack、PECompact


### 加密壳：提供保护，提供功能 {#加密壳-提供保护-提供功能}

ASProtect、Armadillo、EXECryptor


### 虚拟机壳：提供增强保护 {#虚拟机壳-提供增强保护}

VMProtect、Themida
