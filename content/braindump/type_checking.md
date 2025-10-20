---
title: "TYPE_CHECKING"
author: ["4shen0ne"]
tags: ["python"]
draft: false
---

经常在一些 python 代码中看到：

```python
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from mymodule import SomeType
```

其实很容易知道这段代码的作用是：在类型检查时（TYPE_CHECKING==True）导入某些类，而在运行时避免导入它们。

所以其作用一般有二：

1.  避免循环导入错误
2.  有些类只是为了做类型注解而不需要实际使用它们，可以避免在运行时导入从而减小开销
