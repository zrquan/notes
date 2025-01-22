---
title: "Kotlin协程"
author: ["4shen0ne"]
tags: ["kotlin"]
draft: false
---

## 协程的定义 {#协程的定义}

业界对协程一直没有一个清晰同一的界定，所以不同语言的协程实现也各有不同。但归根到
底，协程的核心概念是：函数或者一段程序可以被挂起，稍后能在挂起的地方恢复执行；并
且挂起和恢复的逻辑是由程序所控制的，协程通过主动挂起来让出执行权，实现异步执行


## 协程的分类 {#协程的分类}


### 按照调用栈 {#按照调用栈}

-   有栈协程：和线程相似，每个协程都有自己的调用栈来保存运行状态，主要的区别在于调
    度方式的不同。优点是可以嵌套调用，缺点是内存消耗比较大，不过还得看优化的程度

-   无栈协程：协程没有自己的调用栈，主要通过状态机和闭包等语法实现


### 按照调度方式分类 {#按照调度方式分类}

-   对称协程：任何一个协程都是平等的，调度权可以在各个协程间任意转移

-   非对称协程：协程调度权出让的目标只能是它的调用者，即协程间存在调度和被调度的关
    系。不过只要加入一个第三方的调度中心，依然能实现对称协程的功能


## Kotlin 协程的构造 {#kotlin-协程的构造}

协程体的实现关系：

```plantuml
interface Continuation
abstract SuspendLambda {
    invokeSuspend()
}
class SafeContinuation {
    Continuation delegate
}
class anonymous {
    invokeSuspend()
}
() suspend_lambda

SuspendLambda --> Continuation
SafeContinuation --> Continuation
anonymous --> SuspendLambda
anonymous --> SafeContinuation
suspend_lambda --> anonymous
```
