---
title: "new()和make()的区别"
author: ["4shen0ne"]
tags: ["go"]
draft: false
---

`new(T)` 和 `make(T,args)` 是 Go 语言内建函数，用来分配内存，但适用的类型不同

`new(T)` 会为 T 类型的新值分配已置零的内存空间，并返回地址（指针），即类型为 \*T 的
值。换句话说就是，返回一个指针，该指针指向新分配的、类型为 T 的零值。适用于值类
型，如数组、结构体等

`make(T,args)` 返回初始化之后的 T 类型的值，这个值并不是 T 类型的零值，也不是指针
\*T，是经过初始化之后的 T 的引用。make 函数只适用于 slice、map 和 channel
