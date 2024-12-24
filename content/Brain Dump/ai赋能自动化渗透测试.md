---
title: "AI赋能自动化渗透测试"
author: ["4shen0ne"]
tags: ["llm", "ai"]
draft: false
---

工作需要，开始入坑 AI（主要是 LLM），探索基于大模型的推理能力赋能自动化渗透测试产品的可行性

相关文章：

-   <https://arxiv.org/html/2402.06664v1>
-   <https://paper.seebug.org/3253/>
-   [《 AI 赋能自动化渗透测试》](https://www.gptsecurity.info/2024/09/25/AI+Security-%E7%B3%BB%E5%88%97%E7%AC%AC3%E6%9C%9F-%E4%BA%8C-AI%E8%B5%8B%E8%83%BD%E8%87%AA%E5%8A%A8%E5%8C%96%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95/)

现有的开源项目：

-   <https://github.com/GreyDGL/PentestGPT>

    > PentestGPT 的架构包括处理渗透测试工作流程的不同方面的几个模块。它具有一个测试生成模块，为测试人员生成必要的命令，一个测试推理模块，协助测试期间的决策，以及一个解析模块，解释来自渗透工具和 Web 界面的输出。这些组件协同工作，提供全面和自动化的渗透测试解决方案
-   <https://github.com/msoedov/agentic_security>
-   <https://github.com/protectai/vulnhuntr> (SAST)
-   <https://github.com/NVISOsecurity/cyber-security-llm-agents> (EDR Bypass)


## 想法 {#想法}

通过检索增强生成（[RAG]({{< relref "rag.md" >}})）技术来增强其对上下文的理解和记忆保持能力

智能体开发框架： LangChain ；多智能体：AutoGen

知识图谱的应用：通过将网络拓扑结构、漏洞类型等信息进行结构化，知识图谱有效缩小了渗透测试的选择空间，帮助测试人员快速定位潜在漏洞

强化学习的作用：强化学习能够动态调整渗透测试策略，借助多步决策选择最佳攻击路径，并根据测试反馈不断优化下一步的行动

[提示工程]({{< relref "提示工程.md" >}})是一个至关重要的方面，使用大型语言模型，它在专门化的输入中起着重要作用，以引导模型朝着改进的生成输出发展。这个过程特别敏感， **因为提示的结构或提示的措辞的微小修改可能导致截然不同的结果**
