---
title: "python dataclass"
author: ["4shen0ne"]
draft: false
---

dataclass 的定义位于[PEP-557](https://www.python.org/dev/peps/pep-0557/)，根据定义一个 dataclass 是指“一个带有默认值的可变的
namedtuple”，广义的定义就是有一个类，它的属性均可公开访问，可以带有默认值并能被
修改，而且类中含有与这些属性相关的类方法，那么这个类就可以称为 dataclass。再通俗
点讲，dataclass 就是一个含有数据及操作数据方法的容器

乍一看可能会觉得这个概念不就是普通的 class 么，然而还是有几处不同：

1.  相比普通 class，dataclass 通常不包含私有属性，数据可以直接访问
2.  dataclass 的 repr 方法通常有固定格式，会打印出类型名以及属性名和它的值
3.  dataclass 拥有 `__eq__` 和 `__hash__` 魔法方法
4.  dataclass 有着模式单一固定的构造方式，或是需要重载运算符，而普通 class 通常无
    需这些工作


## dataclass 继承 {#dataclass-继承}

python3.7 引入 dataclass 的一大原因就在于相比 namedtuple，dataclass 可以享受继承带来
的便利

dataclass 装饰器会检查当前 class 的所有基类，如果发现一个 dataclass，就会把它的字段
按顺序添加进当前的 class，随后再处理当前 class 的 field。所有生成的方法也将按照这一
过程处理，因此如果子类中的 field 与基类同名，那么子类将会无条件覆盖基类。子类将会
根据所有的 field 重新生成一个构造函数，并在其中初始化基类
