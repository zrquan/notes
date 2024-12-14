---
title: "Buffer Overflow"
author: ["4shen0ne"]
draft: false
---

由于没有对 buffer 长度进行检查，导致写入的数据可以超过 buffer 容量，覆盖后续的数
据

根据 buffer 的位置可以分为：

-   stack base (stack smashing)
-   data base
-   heap base

危险函数：gets, scanf, strcpy, sprintf, memcpy, strcat

保护机制（Linux 平台）：

-   ASLR: 内存位置随机变化，主要是 stack, heap, library
-   DEP(NX): 可写的 segment 不可执行，可执行的 segment 不可写
-   PIE: 开启之后，data 和 code 也会跟着 ASLR 随机变化
-   StackGuard: function call 时在栈中插入一个随机数（canary), 如果 return 时检查
    到这个数被修改过就会终止程序
-   RELRO: 控制 .got/.got.plt 的写权限
