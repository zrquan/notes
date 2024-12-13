---
title: "this表达式"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:07+08:00
tags: ["kotlin"]
draft: false
---

tags
: [kotlin]({{< relref "kotlin.md" >}})

this 表达式表示当前接收者：

-   在类成员中，this 指该类的当前对象
-   在扩展函数或带有接收者的函数字面值中，this 表时点左侧传递的接收者参数

默认 this 指的是最内层的包含它的作用域，但可以使用标签限定符来引用其他作用域


## 限定的 this {#限定的-this}

要访问来自外部作用域的 this 可以使用 this@label，其中 @label 是一个代指 this 来源
的标签：

```kotlin
class A { // 隐式标签 @A
    inner class B { // 隐式标签 @B
        fun Int.foo() { // 隐式标签 @foo
            val a = this@A // A 的 this
            val b = this@B // B 的 this

            val c = this // foo() 的接收者，一个 Int
            val c1 = this@foo // foo() 的接收者，一个 Int

            val funLit = lambda@ fun String.() {
                val d = this // funLit 的接收者
            }

            val funLit2 = { s: String ->
                // foo() 的接收者，因为它包含的 lambda 表达式
                // 没有任何接收者
                val d1 = this
            }
        }
    }
}
```
