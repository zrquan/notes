---
title: "Spring中Filter和Interceptor的区别"
author: ["4shen0ne"]
tags: ["spring", "java"]
draft: false
---

## Interceptor {#interceptor}

主要用来拦截用户请求，进行业务逻辑的相关处理，比如判断用户登录情况、权限验证，针
对 Controller 请求，经过 HandlerInterceptor

拦截分为两种：1. 对会话进行拦截；2. 对方法的拦截，需要使用 `@Aspect` 注解


## Filter {#filter}

主要进行一些编码、鉴权等操作，通常和安全相关

Filter 在请求进入 [servlet]({{< relref "servlet.md" >}}) 容器执行 `service()` 方法之前就会经过 filter 过滤，不像
Intreceptor 一样依赖于 springmvc 框架，只需要依赖于 servlet


## 区别 {#区别}

1.  Filter 是基于函数回调（ `doFilter()` ）的，而 Interceptor 则是基于 [Java 反射]({{< relref "reflection.md" >}})的
    （AOP 思想）
2.  Filter 依赖于 Servlet 容器，而 Interceptor 不依赖于 Servlet 容器
3.  Filter 对几乎所有的请求起作用，而 Interceptor 只能对 action 请求(设置映射的
    controller 方法)起作用
4.  Interceptor 可以访问 Action 的上下文，值栈里的对象，而 Filter 不能
5.  在 action 的生命周期里，Interceptor 可以被多次调用，而 Filter 只能在容器初始化时调
    用一次
6.  Filter 在过滤是只能对 request 和 response 进行操作，而 interceptor 可以对 request、
    response、handler、modelAndView、exception 进行操作
