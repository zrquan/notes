---
title: "Go slice"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:13+08:00
tags: ["go"]
draft: false
---

1.  切片是数组的一个引用，因此切片是引用类型。但自身是结构体，值拷贝传递。
2.  切片的长度可以改变，因此切片是一个可变的数组。
3.  切片遍历方式和数组一样，可以用 `len()` 求长度。表示可用元素数量，读写操作不能超过该限制。
4.  cap 可以求出 slice 最大扩张容量，不能超出数组限制。 `0 <= len(slice) <= len(array)` ，其中 array 是 slice 引用的数组。
5.  切片的定义：var 变量名 []类型

    ```text
    var str []string
    var arr []int。
    ```
6.  如果 slice == nil，那么 len、cap 结果都等于 0。
