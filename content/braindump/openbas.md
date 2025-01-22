---
title: "OpenBAS"
author: ["4shen0ne"]
draft: false
---

{{< figure src="/ox-hugo/_20250109_104518screenshot.png" >}}


## APIs <span class="tag"><span class="verb">verb</span></span> {#apis}

template <http://localhost:8080>


### attackPatterns {#attackpatterns}

get /api/attack_patterns


## Injectors {#injectors}

一个 injector 就是一类攻击手段的实现，比如 `HTTP Query` 模拟 HTTP 请求， `OpenBAS Implant` 整合了 Caldera，可以模拟 Caldera 的攻击策略

注入器是 OpenBAS 平台的基石之一，负责将仿真操作推送到第三方系统

分类：

-   Endpoint payloads execution
    在通过目标主机的 executor 注入模拟攻击，比如 caldera
-   Communication &amp; social medias
    这些注入器用于向人员（又称玩家）推送信息，如电子邮件、短信、电话、即时消息等
-   Incident Response &amp; Case Management（用于什么场景？）
    Those injectors are used to inject real or fake information into case management, ticketing and incident response systems.
-   Others

第三方 injector 用 python 实现，启动一个线程持续监听 [RabbitMQ]({{< relref "rabbitmq.md" >}})，当收到消息任务时开启新线程处理任务。收到消息时会调用 injector 注册的 callback 函数，参数是 RabbitMQ 的消息体（字典）

第三方实现的 injector 如何定义 InjectExpectationSignature？


## Collectors {#collectors}

Collector 用于收集数据，包括从 Atomic Red Team 收集攻击策略的数据，或者从 Microsoft Sentinel 收集告警事件数据用于评估安全设备

有两种实现：

1.  built-in: 在 openbas 仓库中，java 实现，包名 `io.openbas.collectors.xxx`
    要实现 Runnable
2.  thirdparty: 在 collectors 仓库中，python 实现

第三方 collector 用 python 实现，collector 连接 openbas-platform 后有一个定时器来定时执行「处理函数」，比如从网上下载 payload 通过 openbas-platform 的接口添加为可使用的攻击技术

```json
[{"listened": true, "inject_expectation_type": "PREVENTION", "inject_expectation_id": "7c2114b7-55b6-4a05-a341-61245a4e79c4", "inject_expectation_name": "Expect inject to be prevented", "inject_expectation_description": null, "inject_expectation_signatures": [{"type": "parent_process_name", "value": "obas-implant-36350be0-a1e0-4190-9d93-a4841d3d21b8"}], "inject_expectation_results": [], "inject_expectation_score": null, "inject_expectation_expected_score": 100.0, "inject_expiration_time": 21600, "inject_expectation_created_at": "2025-01-11T14:07:00.056961Z", "inject_expectation_updated_at": "2025-01-11T14:07:00.056961Z", "inject_expectation_group": false, "inject_expectation_exercise": "51ab1ff8-ee0a-4f09-b648-49e5d17c7454", "inject_expectation_inject": "36350be0-a1e0-4190-9d93-a4841d3d21b8", "inject_expectation_user": null, "inject_expectation_team": null, "inject_expectation_asset": "a5534620-9f8c-4b31-aca0-27f21c7ab33b", "inject_expectation_asset_group": null, "inject_expectation_article": null, "inject_expectation_challenge": null, "inject_expectation_status": "PENDING", "target_id": "a5534620-9f8c-4b31-aca0-27f21c7ab33b"}, {"listened": true, "inject_expectation_type": "DETECTION", "inject_expectation_id": "83fcba9f-5a30-4b14-bc75-1d5336a5e01f", "inject_expectation_name": "Expect inject to be detected", "inject_expectation_description": null, "inject_expectation_signatures": [{"type": "parent_process_name", "value": "obas-implant-36350be0-a1e0-4190-9d93-a4841d3d21b8"}], "inject_expectation_results": [], "inject_expectation_score": null, "inject_expectation_expected_score": 100.0, "inject_expiration_time": 21600, "inject_expectation_created_at": "2025-01-11T14:07:00.057064Z", "inject_expectation_updated_at": "2025-01-11T14:07:00.057064Z", "inject_expectation_group": false, "inject_expectation_exercise": "51ab1ff8-ee0a-4f09-b648-49e5d17c7454", "inject_expectation_inject": "36350be0-a1e0-4190-9d93-a4841d3d21b8", "inject_expectation_user": null, "inject_expectation_team": null, "inject_expectation_asset": "a5534620-9f8c-4b31-aca0-27f21c7ab33b", "inject_expectation_asset_group": null, "inject_expectation_article": null, "inject_expectation_challenge": null, "inject_expectation_status": "PENDING", "target_id": "a5534620-9f8c-4b31-aca0-27f21c7ab33b"}]
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  第三方 collector 获取的 expectations 数据
</div>


## Executor {#executor}

部署在内网的接收端，用来执行场景中的 injectors 的攻击策略和编排好的剧本


## Agent {#agent}

OpenBAS Agent 是一个应用程序，需要安装到企业终端，其主要作用是在 OpenBAS 平台上注册资产，检索要执行的任务，并将这些信息传输给 implants（视情况而定），以便在主机资产上执行
