---
title: "Choosing Between == and is"
author: ["4shen0ne"]
tags: ["python"]
draft: false
---

Python 中的 `==` 用来比较两个对象的值，而 `is` 则用来比较对象本身，值相同不代表是同一个对象。

大部分情况下会使用 `==` ，因为我们一般更关心值（数据），而在对单例对象进行比较时才使用 `is` ，常见的单例对象就是 `None`

`is` 的性能会比 `==` 更好，因为后者是可以重载的，解释器需要先找到正确的函数，所以更推荐使用 `xx is None` 而不是 `xx == None`
