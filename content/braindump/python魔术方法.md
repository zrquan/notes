---
title: "python魔术方法"
author: ["4shen0ne"]
draft: false
---

## new {#new}

`__new__` 是在一个对象实例化的时候所调用的第一个方法，它的第一个参数是这个类，其他
的参数是用来直接传递给 `__init__` 方法


## del {#del}

`__del__` 定义的是当一个对象进行垃圾回收时候的行为。一个对象在删除的时需要更多的清
洁工作的时候此方法会很有用，比如套接字对象或者是文件对象。注意，如果解释器退出的
时候对象还存存在，就不能保证 `__del__` 能够被执行


## 用于比较的魔术方法 {#用于比较的魔术方法}

-   __cmp__(self, other)：最基本的用于比较的魔术方法，它实际上实现了所有的比较符号
    (&lt;,==,!=,etc.)，但通常最好的一种方式是去分别定义每一个比较符号而不是一次性将他
    们都定义
-   __eq__(self, other)：定义了等号的行为，==
-   __ne__(self, other)：定义了不等号的行为，!=
-   __lt__(self, other)：定义了小于号的行为，&lt;
-   __gt__(self, other)：定义了大于等于号的行为，&gt;=


## 数值处理的魔术方法 {#数值处理的魔术方法}

-   __pos__(self)：实现正号的特性(比如 `+some_object`)
-   __neg__(self)：实现负号的特性(比如 `-some_object`)
-   __abs__(self)：实现内置 `abs()` 函数的特性
-   __invert__(self)：实现 ~ 符号的特性（<http://en.wikipedia.org/wiki/Bitwise_operation#NOT>）


## 普通算术操作符 {#普通算术操作符}

-   __add__(self, other)：实现加法
-   __sub__(self, other)：实现减法
-   __mul__(self, other)：实现乘法
-   __floordiv__(self, other)：实现 // 符号实现的整数除法
-   __div__(self, other)：实现 / 符号实现的除法
-   __truediv__(self, other)：实现真除法。前提条件：

    ```text
    from __future__ import division
    ```
-   __mod__(self, other)：实现取模算法 %
-   __divmod__(self, other)：实现内置 `divmod()` 算法
-   __pow__(self, other)：实现 使用 \*\* 的指数运算
-   __lshift__(self, other)：实现使用 &lt;&lt; 的按位左移动
-   __rshift__(self, other)：实现使用 &gt;&gt; 的按位左移动
-   __and__(self, other)：实现使用 &amp; 的按位与
-   __or__(self, other)：实现使用 | 的按位或
-   __xor__(self, other)：实现使用 ^ 的按位异或


## cheatsheet {#cheatsheet}

| 魔术方法                        | 调用方式                           | 解释                |
|-----------------------------|--------------------------------|-------------------|
| __new__(cls [,...])             | instance = MyClass(arg1, arg2)     | __new__在创建实例的时候被调用 |
| __init__(self [,...])           | instance = MyClass(arg1, arg2)     | __init__在创建实例的时候被调用 |
| __cmp__(self, other)            | self == other, self &gt; other, 等。 | 在比较的时候调用    |
| __pos__(self)                   | +self                              | 一元加运算符        |
| __neg__(self)                   | -self                              | 一元减运算符        |
| __invert__(self)                | ~self                              | 取反运算符          |
| __index__(self)                 | x[self]                            | 对象被作为索引使用的时候 |
| __nonzero__(self)               | bool(self)                         | 对象的布尔值        |
| __getattr__(self, name)         | self.name # name 不存在            | 访问一个不存在的属性时 |
| __setattr__(self, name, val)    | self.name = val                    | 对一个属性赋值时    |
| __delattr__(self, name)         | del self.name                      | 删除一个属性时      |
| __getattribute(self, name)      | self.name                          | 访问任何属性时      |
| __getitem__(self, key)          | self[key]                          | 使用索引访问元素时  |
| __setitem__(self, key, val)     | self[key] = val                    | 对某个索引值赋值时  |
| __delitem__(self, key)          | del self[key]                      | 删除某个索引值时    |
| __iter__(self)                  | for x in self                      | 迭代时              |
| __contains__(self, value)       | value in self, value not in self   | 使用 in 操作测试关系时 |
| __concat__(self, value)         | self + other                       | 连接两个对象时      |
| __call__(self [,...])           | self(args)                         | “调用”对象时        |
| __enter__(self)                 | with self as x:                    | with 语句环境管理   |
| __exit__(self, exc, val, trace) | with self as x:                    | with 语句环境管理   |
| __getstate__(self)              | pickle.dump(pkl_file, self)        | 序列化              |
| __setstate__(self)              | data = pickle.load(pkl_file)       | 序列化              |
