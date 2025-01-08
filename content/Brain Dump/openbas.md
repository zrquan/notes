---
title: "OpenBAS"
author: ["4shen0ne"]
draft: false
---

## Injectors {#injectors}

一个 injector 就是一类攻击手段的实现，比如 `HTTP Query` 模拟 HTTP 请求， `OpenBAS Implant` 整合了 Caldera，可以模拟 Caldera 的攻击策略


## Collectors {#collectors}

Collector 用于收集数据，包括从 Atomic Red Team 收集攻击策略的数据，或者从 Microsoft Sentinel 收集告警事件数据用于评估安全设备


## Executor {#executor}

部署在内网的接收端，用来执行场景中的 injectors 的攻击策略和编排好的剧本
