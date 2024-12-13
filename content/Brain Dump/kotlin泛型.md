---
title: "Kotlin 泛型"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:29+08:00
draft: false
---

[Kotlin]({{< relref "kotlin.md" >}}) 中的泛型参数如果能从上下文推导，则可以省略，比如：

```kotlin
val box: Box<Int> = Box<Int>(1)
val box = Box(1) // 1 具有类型 Int，所以编译器推算出它是 Box<Int>
```

Kotlin 没有 Java 中的通配符类型，而是使用声明处型变（declaration-site variance）
与类型投影（type projections）


## 为什么 Java 需要通配符类型 {#为什么-java-需要通配符类型}

首先，Java 中的泛型是不型变的，这意味着 List&lt;String&gt; 并不是 List&lt;Object&gt; 的子类
型，因此 API 的灵活性低，和数组没什么区别

以下代码可以通过编译，但是导致运行时异常：

```java
List<String> strs = new ArrayList<String>();
List<Object> objs = strs; // ！！！此处的编译器错误让我们避免了之后的运行时异常。
objs.add(1); // 将一个整数放入一个字符串列表
String s = strs.get(0); // ！！！ ClassCastException：无法将整数转换为字符串
```

通配符类型参数 `? extends E` 表示此方法接受 E 或者 E 的一个子类型对象的集合，而不
只是 E 自身。这意味着我们可以安全地从其中（该集合中的元素是 E 的子类的实例）读取
E，但不能写入，因为我们不知道什么对象符合那个未知的 E 的子类型。反过来，该限制可
以得到想要的行为： `Collection<String>` 表示为 `Collection<? extends Object>` 的子类
型。简而言之，带 extends 限定（上界）的通配符类型使得类型是协变的（covariant）

理解为什么这能够工作的关键相当简单：如果只能从集合中获取元素，那么使用 String 的
集合，并且从其中读取 Object 也没问题。反过来，如果只能向集合中放入元素，就可以用
Object 集合并向其中放入 String：在 Java 中有 `List<? super String>` 是
`List<Object>` 的一个超类

后者称为逆变性（contravariance），并且对于 `List <? super String>` 你只能调用接受
String 作为参数的方法（例如，你可以调用 add(String) 或者 set(int, String)），如
果调用函数返回 `List<T>` 中的 T，你得到的并非一个 String 而是一个 Object
