---
title: "ThreadPoolExecutor"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:07+08:00
tags: ["java"]
draft: false
---

ThreadPoolExecutor 是线程池的核心类，构造方法如下：

```java
public ThreadPoolExecutor(int corePoolSize,
                          int maximumPoolSize,
                          long keepAliveTime,
                          TimeUnit unit,
                          BlockingQueue<Runnable> workQueue,
                          ThreadFactory threadFactory,
                          RejectedExecutionHandler handler) {
}
```

参数解释：

-   corePoolSize 核心线程数。
-   maximumPoolSize 最大线程数。线程数=核心线程数+非核心线程数。
-   keepAliveTime 非核心线程的保活时间，非核心线程空闲时间大于这个保活时间时会被回
    收。如果调用了 allowCoreThreadTimeOut(true)设置允许核心线程超时回收，那么核心线
    程超时达到保活时间，一样会被回收。
-   unit keepAliveTime 参数的时间单位。
-   workQueue 任务的队列，execute 方法提交的 Runnable 任务在执行之前会保存到这个队里
    中。
-   threadFactory 创建线程的工厂，如果使用重载方法，默认为
    Executors.defaultThreadFactory()。
-   handler 线程池处理不过来时的拒绝回调，所谓的处理不过来就是指队列已满并且达到了
    最大线程数。这个参数如果使用重载方法，默认为 AbortPolicy，也就是直接抛出
    RejectedExecutionException。

线程池任务提交流程：

```plantuml
!pragma useVerticalIf on
:提交任务;
if (达到核心线程数？) then (否)
    :创建工作线程\n（核心线程）;
    detach
elseif (任务队列已满？) then (否)
    :放入任务队列;
    detach
elseif (达到最大线程数？) then (否)
    :创建工作线程\n（非核心线程）;
    :超时则销毁线程;
    detach
else
    :拒绝策略;
endif
```
