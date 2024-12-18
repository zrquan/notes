---
title: "Spring Boot Actuator信息泄露"
author: ["4shen0ne"]
tags: ["vuln"]
draft: false
---

`Actuator` 是 `Spring Boot` 中用于监控和管理应用程序的组件，可以通过 `restful api` 与其进行交互。

在配置 `Actuaotr` 监控端点时，配置不当可能导致系统应用配置信息、度量指标信息泄露等
严重安全问题，其中 `trace` 路径下动态记录了最近的 100 条请求记录信息，请求信息中包含
了用户认证字段数据，可通过更替认证字段任意操作用户数据。

| 路径         | 描述                                          |
|------------|---------------------------------------------|
| /autoconfig  | 提供了一份自动配置报告，记录哪些自动配置条件通过了，哪些没通过 |
| /beans       | 描述应用程序上下文里全部的 Bean，以及它们的关系 |
| /env         | 获取全部环境属性                              |
| /configprops | 描述配置属性（包含默认值）如何注入 Bean       |
| /dump        | 获取线程活动的快照                            |
| /health      | 报告应用程序的健康指标，这些值由 HealthIndicator 的实现类提供 |
| /info        | 获取应用程序的定制信息，这些信息由 info 打头的属性提供 |
| /mappings    | 描述全部的 URI 路径，以及它们和控制器（包含 Actuator 端点）的映射关系 |
| /metrics     | 报告各种应用程序度量信息，比如内存用量和 HTTP 请求计数 |
| /shutdown    | 关闭应用程序，要求 endpoints.shutdown.enabled 设置为 true |
| /trace       | 提供基本的 HTTP 请求跟踪信息（时间戳、HTTP 头等） |


## 修复方案 {#修复方案}

1.  在 application.properties 中指定 actuator 的端口以及开启 security 功能，配置
    访问权限验证，这时再访问 actuator 功能时就会弹出登录窗口，需要输入账号密码验
    证后才允许访问

2.  禁用接口
    ```nil
       禁用 /env 接口，则可设置：
        endpoints.env.enabled = false

       或者禁用所有接口，再选择性开放：
        endpoints.enabled = false
        endpoints.metrics.enabled = true
    ```
