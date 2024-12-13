---
title: "SOLID原则"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:58+08:00
draft: false
---

SOLID 原则是一组（五个）软件设计原则，用于指导软件开发人员设计和实现高质量的、易
于维护和扩展的软件。它是由罗伯特·C·马丁在其著作《Agile Software Development,
Principles, Patterns, and Practices》中提出的，是目前软件工程界被广泛接受的一种
软件设计理念。


## 单一职责原则（Single Responsibility Principle，SRP） {#单一职责原则-single-responsibility-principle-srp}

一个类应该只有一个引起它变化的原因，这意味着一个类应该只负责一件事情。

```python
class ShoppingCart:
    def __init__(self):
        self.items = []
        self.total = 0

    def add_item(self, item):
        self.items.append(item)
        self.total += item.price

    def remove_item(self, item):
        self.items.remove(item)
        self.total -= item.price

    def print_receipt(self):
        print('Items:')
        for item in self.items:
            print(f'{item.name} - ${item.price}')
        print(f'Total: ${self.total}')
```

例子中的 `ShoppingCart` 类同时负责处理购物车相关的任务和输出相关的任务，它的
`print_receipt()` 方法应该被拆分为一个独立的类别或方法，以实现单一职责原则。


## 开放封闭原则（Open-Closed Principle，OCP） {#开放封闭原则-open-closed-principle-ocp}

开闭原则指软件实体（类、模块、函数等）应该对扩展开放，对修改封闭。这意味着软件应
该设计成可以在不修改现有代码的情况下进行扩展，从而增加新功能。

假设我们有一个计算不同形状面积的程序：

```python
class AreaCalculator:
    def calculate_area(self, shape):
        if isinstance(shape, Rectangle):
            return shape.width * shape.height
        elif isinstance(shape, Circle):
            return 3.14 * shape.radius * shape.radius
        else:
            raise TypeError("Unknown shape!")

class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

class Circle:
    def __init__(self, radius):
        self.radius = radius
```

上述代码的问题在于，如果我们要添加一个新的形状，比如 `Triangle` ，我们需要修改
`AreaCalculator` 类中的 `calculate_area` 方法，这违反了开闭原则。

正确的做法是使用多态来实现对扩展开放的设计，使得添加新功能时只需要增加新的实现类
即可，不需要修改现有实体：

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def calculate_area(self):
        pass

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def calculate_area(self):
        return self.width * self.height

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def calculate_area(self):
        return 3.14 * self.radius * self.radius

class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height

    def calculate_area(self):
        return 0.5 * self.base * self.height

class AreaCalculator:
    def calculate_area(self, shape: Shape):
        return shape.calculate_area()
```


## <span class="org-todo todo TODO">TODO</span> 里氏替换原则（Liskov Substitution Principle，LSP） {#里氏替换原则-liskov-substitution-principle-lsp}

-   定义：子类型必须能够替换掉它们的父类型。
-   目的：增强程序的可维护性，通过保证子类可以替换父类而不影响程序的正确性，保持继
    承体系的一致性。


## 接口隔离原则（Interface Segregation Principle，ISP） {#接口隔离原则-interface-segregation-principle-isp}

客户端不应该被迫依赖于它不使用的接口，接口应该被拆分为更小和更具体的部分，以便客
户端只需要知道它们所需的部分。

下面是一段违反 ISP 的代码：

```python
class Machine:
    def print(self, document):
        pass

    def fax(self, document):
        pass

    def scan(self, document):
        pass

class MultiFunctionPrinter(Machine):
    def print(self, document):
        print("Printing")

    def fax(self, document):
        print("Faxing")

    def scan(self, document):
        print("Scanning")
```

示例中的 Machine 是一个代表机器的接口，包含了 print、fax 和 scan 三个方法。
MultiFunctionPrinter 是一个多功能打印机，必须实现的只有 print 方法，fax 和 scan
方法取决于打印机的种类，不是所有打印机都需要实现。但由于 Machine 接口中包含了所
有方法，MultiFunctionPrinter 被迫实现它可能不需要的 fax 和 scan 方法。

符合 ISP 的设计：

```python
class Printer:
    def print(self, document):
        pass

class Fax:
    def fax(self, document):
        pass

class Scanner:
    def scan(self, document):
        pass

class MultiFunctionDevice(Printer, Fax, Scanner):
    def print(self, document):
        print("Printing")

    def fax(self, document):
        print("Faxing")

    def scan(self, document):
        print("Scanning")
```

将 Machine 接口一分为三，打印机可以根据功能实现所需要的接口。


## <span class="org-todo todo TODO">TODO</span> 依赖倒置原则（Dependency Inversion Principle，DIP） {#依赖倒置原则-dependency-inversion-principle-dip}

-   定义：高层模块不应该依赖低层模块，两者都应该依赖于抽象；抽象不应依赖于细节，细
    节应依赖于抽象。
-   目的：减少类之间的直接依赖，通过依赖抽象而非具体实现来增强系统的可维护性和灵活
    性。
