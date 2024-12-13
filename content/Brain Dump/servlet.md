---
title: "Servlet"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:53+08:00
tags: ["java"]
draft: false
---

Servlet 的本质就是一个 Java 接口，它给出了一套处理网络请求的规范，要求开发者给出
Servlet 的初始化、销毁过程、配置、如何处理请求和响应等内容的具体实现。不过通常我
们说的 Servlet 都是实现了该接口的类，可以用这个类来处理请求并返回响应。

```java
public interface Servlet {
    // 初始化，由容器调用
    public void init(ServletConfig config) throws ServletException;

    // 返回配置对象
    public ServletConfig getServletConfig();

    // 处理请求和响应的逻辑
    public void service(ServletRequest req, ServletResponse res)
            throws ServletException, IOException;

    // 返回作者、版本、版权等信息
    public String getServletInfo();

    // 销毁 servlet，由容器调用
    public void destroy();
}
```


## 线程安全 {#线程安全}

Servlet 默认使用 `单实例多线程` 的模式来处理请求，以减少 Servlet 实例的开销，这也
意味着对 Servlet 实例的修改会影响所有使用这个 Servlet 的线程，导致条件竞争漏洞。

假设一个 Servlet 类中存在成员变量 `var` ，用户发送 POST 请求修改了 `var` 的值，当另
一个用户发送 GET 请求读取 `var` 时得到的是修改后的值，因为它们访问的是同一个实例。


## Servlet3 新特性 {#servlet3-新特性}

1.  异步处理支持：Servlet 线程可以将耗时的操作委派给另一个线程来完成，自己在不生
    成响应的情况下返回至容器

2.  新增的注解支持：新增了若干注解，简化了 Servlet、Filter、Listener 的声明，使得
    `web.xml` 文件不再是必须的了

3.  插件化支持


## Servlet4 新特性 {#servlet4-新特性}

1.  服务器推送：依赖于 [HTTP/2]({{< relref "http_2.md" >}}) 的功能，服务端可以主动推送资源给客户端

2.  全新的 Servlet 映射发现接口
