---
title: "C Sharp"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:04+08:00
draft: false
---

## C#/.NET/ASP.NET 的关系 {#c-dot-net-asp-dot-net-的关系}

.NET 是微软下的一个跨语言开发平台，为 C#、f#、C++、VB 等多种语言提供运行环境，其
核心是 .NET Framework。.NET Framework 由两部分组成：

1.  CLR，Common Language Runtime：公共语言运行时，提供内存管理，代码安全性检测等功能。
    -   CLS：公共语言规范，将各种语言转换成统一的语言规范。
    -   CTS：通用类型规范，将各种语言中的数据类型转换成统一的类型。
    -   JIT：即时编译器，将中间语言转换成二进制，交给 CPU 执行。

2.  FLC，.NET Framework Class Library：提供大量应用类库，提高开发效率。

C# 是一个 .NET 平台下的一个面向对象的编程语言，运行在 .NET CLR 上。

ASP.NET 是 .NET 中专门用来做 Web 开发的一组类库，或者说应用模型，通常由 VB 或者
C# 编写。


## 基本语法 {#基本语法}

C# 是面向对象的语言，一个 Rectangle 类的实现如下：

```c
using System;  // using 关键字用于包含一个命名空间
namespace RectangleApplication
{
    class Rectangle
    {
        // 成员变量
        double length;
        double width;
        public void Acceptdetails()
        {
            length = 4.5;
            width = 3.5;
        }
        public double GetArea()
        {
            return length * width;
        }
        public void Display()
        {
            Console.WriteLine("Length: {0}", length);
            Console.WriteLine("Width: {0}", width);
            Console.WriteLine("Area: {0}", GetArea());
        }
    }

    class ExecuteRectangle
    {
        static void Main(string[] args)
        {
            Rectangle r = new Rectangle();
            r.Acceptdetails();
            r.Display();
            Console.ReadLine();
        }
    }
}
```


## using 用法 {#using-用法}

1.  using 指令：引入命名空间

<!--listend-->

```c
using System;
using Namespace1.SubNameSpace;
```

1.  using static 指令：指定无需指定类型名称即可访问其静态成员的类型

```text
using static System.Math;var = PI; // 直接使用 System.Math.PI
```

1.  起别名

```text
using Project = PC.MyCompany.Project;
```

1.  using 语句：将实例与代码绑定

<!--listend-->

```c
using (Font font3 = new Font("Arial", 10.0f),
            font4 = new Font("Arial", 10.0f))
{
    // Use font3 and font4.
}
```


## @ {#518ed2}

1.  使 C# 关键字用作标识符：

<!--listend-->

```c
string[] @for = { "John", "James", "Joan", "Jamie" };
```

1.  指示将原义解释字符串，不会解析字符串中的转义符号，类似 python 的 r""


## 特性 Attribute {#特性-attribute}

特性用于添加元数据，是在运行时传递程序中各种元素的行为信息的声明性标签，类似于
Java 的注解。 `.NET` 框架提供了两种特性：预定义特性和自定义特性。

语法大致如下：

```c
[attribute(positional_parameters, name_parameter = value, ...)]
element
```

Doc: <https://www.runoob.com/csharp/csharp-attribute.html>
