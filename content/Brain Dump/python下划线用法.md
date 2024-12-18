---
title: "python下划线用法"
author: ["4shen0ne"]
tags: ["python"]
draft: false
---

1.  `_var`

    貌似有两种说法，一是指 \_var 视为私有变量，或者把 \_var 等同于 java 的 protected
    变量（仅同 package 和子类可见），但无论如何 python 并不会实际妨碍开发者访问该
    变量

2.  `__var`

    指 __var 为私有变量，python 在编译时会修改成 \_classname\__var 来避免冲突（通过
    修改后的名称依旧可以访问）

3.  `__var__`

    一些特殊的变量或方法，对变量可见性没有影响，一般不需要这样命名

4.  `var_`

    如果变量名字被用了，可以用这种方式避免覆盖前面的变量
