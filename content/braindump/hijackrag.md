---
title: "HijackRAG"
author: ["4shen0ne"]
tags: ["llm"]
draft: false
---

该劫持攻击主要针对使用 [RAG]({{< relref "rag.md" >}}) 技术的大语言模型，通过向语料库中注入恶意文本，影响检索结果，从而操控模型的输出结果。

研究表明，HijackRAG 的成功率与恶意文本的质量密切相关。高质量的恶意文本不仅需要具备良好的自然语言表达能力，还要能够精准地匹配目标查询的上下文环境。


## Refs {#refs}

-   <https://www.showapi.com/news/article/678ef2534ddd79f11a4645b6>
