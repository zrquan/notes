---
title: "MCP"
author: ["4shen0ne"]
tags: ["llm"]
draft: false
---

模型上下文协议（Model Context Protocol, MCP）是一种将 [AI 代理]({{< relref "llm_agent.md" >}})连接到各种外部工具和数据源的标准化协议，比传统 API 更加灵活，支持实时双向通信（类似 WebSocket）、动态发现。

MCP 类似一个 USB 扩展器，帮助各种工具和数据源接入 LLM 应用

{{< figure src="/ox-hugo/_20250311_092412screenshot.png" >}}
