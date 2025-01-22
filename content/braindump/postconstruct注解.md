---
title: "PostConstruct注解"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

PostConstruct 是 Java 提供的注解（不是 spring 提供的），它用来修饰一个非静态 void 方法，该方法会在对象初始化之后执行

这个注解通常用在 Spring 框架中——如果想在某个对象初始化时执行特定操作，但是该对象通过依赖注入来初始化，所以不能在构造函数里实现特定操作，此时可以使用 PostConstruct 注解

```text
Constructor(构造方法) -> @Autowired(依赖注入) -> @PostConstruct(注释的方法)
```
