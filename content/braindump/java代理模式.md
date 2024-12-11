---
title: "Java代理模式"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

代理模式，就是为其他对象(接口)提供一个代理对象，用来控制对这个对象(接口)的访问或
增强其某个方法的功能，比如对传递的消息进行预处理、过滤，打印日志等等。实现这个需
求的最直接的方式是静态代理，但由于需要为每个被代理的目标类都编写一个代理类，增加
了编码的工作量，而动态代理则改善了这一点不足


## 静态代理 {#静态代理}

通过给某个目标类实现一个代理类，在不修改目标类代码的前提下增强其功能

假如现在有一个需求，要在现有类的所有方法前后打印日志，具体做法：

1.  为现有的每一个类都编写一个对应的代理类，并且让它实现和目标类相同的接口

    {{< figure src="/ox-hugo/2021-10-23_10-54-38_screenshot.png" >}}

2.  在创建代理对象时，通过构造器塞入一个目标对象，然后在代理对象的方法内部调用目
    标对象同名方法，并在调用前后打印日志。即 `代理对象=增强代码+原对象` ，有了代理
    对象后，就不用原对象了

    {{< figure src="/ox-hugo/2021-10-23_10-59-23_screenshot.png" >}}


## 动态代理 {#动态代理}

JDK 提供了 java.lang.reflect.InvocationHandler 接口和 java.lang.reflect.Proxy 类，
这两个类相互配合


### Proxy 类 {#proxy-类}

Proxy 有个静态方法： `getProxyClass(ClassLoader, interfaces)` ，只要你给它传入类加
载器和一组接口，它就给你返回代理 Class 对象

用通俗的话说，getProxyClass 这个方法，会从你传入的接口 Class 中，“拷贝”类结构信息到
一个新的 Class 对象中，但新的 Class 对象带有构造器，是可以创建对象的。所以，一旦我们
明确接口，完全可以通过接口的 Class 对象，创建一个代理 Class，通过代理 Class 即可创建
代理对象（[反射机制]({{< relref "reflection.md" >}})）

{{< figure src="/ox-hugo/2021-10-23_11-05-35_screenshot.png" >}}

{{< figure src="/ox-hugo/2021-10-23_11-05-47_screenshot.png" caption="<span class=\"figure-number\">Figure 1: </span>静态代理" >}}

{{< figure src="/ox-hugo/2021-10-23_11-06-52_screenshot.png" caption="<span class=\"figure-number\">Figure 2: </span>动态代理" >}}

从上图可以看出，相比于静态代理，动态代理不需要编写代理类就可以拿到代理对象，那么
剩下的工作就是给代理对象增加额外的代码来增强原对象的功能了


### InvocationHandler {#invocationhandler}

根据代理 Class 的构造器创建对象时，需要传入 InvocationHandler，并将目标对象传入
InvocationHandler。每次调用代理对象的方法，最终都会调用 InvocationHandler 的 invoke
方法：

{{< figure src="/ox-hugo/2021-10-23_11-16-05_screenshot.png" >}}

因此在 invoke 方法中，可以对目标对象的方法进行额外增强


### 示例代码 {#示例代码}

```java
/*
* CLassLoader loader：指定动态代理类的类加载器
* Class<?> interfaces：指定动态代理类需要实现的所有接口，需要被增强的接口列表
* InvocationHandler h：指定与动态代理类关联的 InvocationHandler 对象
*/
Proxy.newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h)
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  接口
</div>

```java
  import java.lang.reflect.InvocationHandler;
  import java.lang.reflect.Method;
  import java.lang.reflect.Proxy;

  public class proxyTest {
      public static void main(String[] args) {
          DynamicSubject sub = new RealDynamicSubject();
          Handler handler = new Handler(sub); // 处理器类

          DynamicSubject sub2 = (DynamicSubject)Proxy.newProxyInstance(DynamicSubject.class.getClassLoader(), new Class[]{DynamicSubject.class}, handler);

          DynamicSubject sub3 = (DynamicSubject)Proxy.newProxyInstance(DynamicSubject.class.getClassLoader(), sub.getClass().getInterfaces(), handler);

          DynamicSubject sub4 = (DynamicSubject)Proxy.newProxyInstance(DynamicSubject.class.getClassLoader(), RealDynamicSubject.class.getInterfaces(), handler);

          System.out.println("sub.getClass() = " + sub.getClass());
          System.out.println("DynamicSubject.class = " + DynamicSubject.class);
          System.out.println(new Class[]{DynamicSubject.class});
          System.out.println(RealDynamicSubject.class.getInterfaces());

          sub2.request();
          sub3.request();
          sub4.request();
      }
  }

  interface DynamicSubject { abstract void request(); }

  class RealDynamicSubject implements DynamicSubject {
      public void request() { System.out.println("From real subject."); }
  }

  class Handler implements InvocationHandler {
      private Object obj; // 被代理的对象

      @Override
      public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
          System.out.println("Do something before requesting: print log");
          Object xxx = method.invoke(this.obj, args);  // 调用原对象的方法
          System.out.println("Do something after requesting: print log");
          return xxx;
      }

      public Handler(Object obj) {
          this.obj = obj;
      }
  }
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 2:</span>
  demo
</div>
