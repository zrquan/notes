---
title: "Kotlin"
author: ["4shen0ne"]
draft: false
---

JetBrains 开发的现代 jvm 语言，比 Java 写法更简洁、特性更丰富、语法更灵活，同时
也可以无缝调用 Java 代码

```kotlin
fun main() = println("Hello Kotlin")
```


## lambda 和匿名函数的区别 {#lambda-和匿名函数的区别}

lambda 表达式语法缺少一个东西——指定函数的返回类型的能力，用匿名函数可以这样表示：

```kotlin
fun(x: Int, y: Int): Int = x + y
```

Lambda 表达式与匿名函数之间的另一个区别是非局部返回的行为。一个不带标签的 return
语句总是在用 fun 关键字声明的函数中返回。这意味着 <span class="underline">lambda 表达式中的 return 将从
包含它的函数返回</span> ，而匿名函数中的 return 将从匿名函数自身返回


## kotlin [尾递归优化]({{< relref "尾递归优化.md" >}}) {#kotlin-尾递归优化--尾递归优化-dot-md}

Kotlin 支持一种称为尾递归的函数式编程风格。在某些算法中它会将你的递归调用转换成
循环的形式，避免栈溢出。当一个函数用 tailrec 修饰符标记并满足所需的形式条件时，
编译器会优化该递归， 留下一个快速而高效的基于循环的版本：

```kotlin
val eps = 1E-10 // "good enough", could be 10^-15

tailrec fun findFixPoint(x: Double = 1.0): Double =
    if (Math.abs(x - Math.cos(x)) < eps) x else findFixPoint(Math.cos(x))
```

要符合 tailrec 修饰符的条件的话，函数必须将其自身调用作为它执行的最后一个操作。
在递归调用后有更多代码时， 不能使用尾递归，不能用在 try/catch/finally 块中，也不
能用于 open 的函数


## kotlin 函数类型 {#kotlin-函数类型}

<https://book.kotlincn.net/text/lambdas.html>


## 函数字面值 {#函数字面值}

函数字面值即没有声明而是立即做为表达式传递的函数，比如 lambda 表达式和匿名函数，

例子：

```kotlin
max(strings, { a, b -> a.length < b.length })
```

函数 `max` 是一个高阶函数，因为它接受一个函数作为第二个参数。 其第二个参数是一个表
达式，它本身是一个函数，称为函数字面值，它等价于以下具名函数：

```kotlin
fun compare(a: String, b: String): Boolean = a.length < b.length
```
