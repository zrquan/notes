---
title: "val and const"
author: ["4shen0ne"]
tags: ["kotlin"]
draft: false
---

## val {#val}

定义：val 关键字用于定义运行时的不可变变量，其值在首次赋值后不可更改，但赋值可以在运行时确定

类型限制：可以是任何类型

使用范围：可以在类中、函数中或任何其他位置使用

```kotlin
val name = "Alice"  // 局部变量
class User {
    val userId: String = generateUserId()  // 类成员变量
}
```


### 使用场景 {#使用场景}

-   当你需要定义一个不可变的变量，其值在初始化时可能依赖于一些计算或其他变量时，使用 val
-   适用于那些只在创建后不需要改变，但其值在编译时无法确定的场合，如从函数返回的结果或在构造函数中计算的值


## const {#const}

定义：const 关键字用于定义编译时常量，意味着它的值必须在编译时就已知且不可更改

类型限制：只能用于基本类型，如String, Int, Float, Boolean等

使用范围：const 变量只能定义在对象的顶层或作为对象的成员（通常在伴生对象中定义），不能在函数内部或任何其他块结构中定义

```kotlin
const val MAX_COUNT = 100  // 对象顶层常量
object Config {
    const val BASE_URL = "https://api.example.com"  // 伴生对象中的常量
}
```


### 使用场景 {#使用场景}

-   当你需要定义全局常量，且这些常量的值在编译时就已知并且不会改变时，使用 const
-   常用于定义配置常量，如 API 端点、配置参数等
