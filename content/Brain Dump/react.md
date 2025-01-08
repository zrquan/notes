---
title: "ReAct"
author: ["4shen0ne"]
tags: ["llm", "prompt"]
draft: false
---

[Yao 等人（ 2022 ）](https://arxiv.org/abs/2201.11903)提出了一个名为 ReAct 的提示优化框架，其中 LLM 被用于 <span class="underline">以交错的方式生成推理轨迹和任务特定动作</span>

生成推理轨迹使模型能够诱导、跟踪和更新操作计划，甚至处理异常情况。操作步骤允许与外部源（如知识库或环境）进行交互并且收集信息

ReAct 框架允许 LLMs 与外部工具交互来获取额外信息，从而给出更可靠和实际的回应


## 工作原理 {#工作原理}

[思维链（ CoT ）]({{< relref "思维链提示.md" >}})提示展示了 LLMs 执行推理轨迹以解决涉及算术和常识推理的问题的能力（以及其他任务），但由于缺乏和外部世界接触或无法更新自身的知识，导致[事实幻觉]({{< relref "llm幻觉.md" >}})和错误传播等问题

ReAct 提示 LLMs 为任务生成口头推理轨迹和操作，这使得系统执行动态推理来创建、维护和调整操作计划，同时还要支持与外部环境（例如搜索引擎）的交互，以将额外信息合并到推理中

![](/ox-hugo/_20241221_153051screenshot.png)
Obs -&gt; Observation


## 资料 {#资料}

-   <https://github.com/ysymyth/ReAct>
-   <https://github.com/OceanPresentChao/llm-ReAct>
-   <https://langchain-ai.github.io/langgraph/reference/prebuilt/>
