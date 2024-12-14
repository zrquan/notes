---
title: "@overload装饰器"
author: ["4shen0ne"]
lastmod: 2024-12-14T14:30:38+08:00
tags: ["python"]
draft: false
---

Python 中 `@overload` 注解可以用来描述一个方法/函数的重载，但是这里的重载和 Java 中
的重载概念不同，在 Python 中仅仅用于描述更具体的类型关系。

假设有以下函数：

```python
def double(input_: int | list[int]) -> int | list[int]:
    if isinstance(input_, list):
        return [i * 2 for i in input_]
    return input_ * 2
```

从实现我们可以看出函数的返回类型和参数类型是绑定的，不存在输入 int 返回 list 的
情况，但 python 的类型系统无法知道这一点，只能通过 type hint 判断返回类型为
`int | list` 。

这时候我们就可以使用 `@overload` 来描述更具体的类型关系：

```python
@overload
def double(input_: int) -> int:
    ...

@overload
def double(input_: list[int]) -> list[int]:
    ...

def double(input_: int | list[int]) -> int | list[int]:
    if isinstance(input_, list):
        return [i * 2 for i in input_]
    return input_ * 2
```

上述代码的前两个 double 函数的实现用 `...` 省略，只用于描述函数签名，这时候如果我
们传入的是 int 参数，python 就会知道返回的也是 int 类型。
