---
title: "elisp symbol"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:10+08:00
tags: ["emacs"]
draft: false
---

标识符直接在 Lisp 代码中出现，会被读取为一个符号（symbol）， 然后在不同的上下文中，
Lisp 求值器会看情况取出 value cell 或者 function cell 的内容， 作为该符号（symbol）的
值（value）

一般编程语言没有符号（symbol）这个概念，它是一个 Lisp 对象，由 4 个部分组成：

1.  name: 符号的名字
2.  value cell: 作为一个动态变量，符号的值
3.  function cell: 作为一个函数，函数的值
4.  property list: 属性列表

ref: <https://zhuanlan.zhihu.com/p/34106283>
