---
title: "LLM幻觉"
author: ["4shen0ne"]
tags: ["llm"]
draft: false
---

大型语言模型的幻觉（ Hallucination ）通常是指该模型生成不真实、虚构、不一致或无意义的内容。现在，「幻觉」这个术语的含义已有所扩大，常被用于泛指模型出现错误的情况。本文所谈到的「幻觉」是指其狭义含义： **模型的输出是虚构编造的，并没有基于所提供的上下文或世界知识**

幻觉有两种类型：

1.  上下文幻觉：模型输出与上下文中的源内容不一致
2.  外源性幻觉（extrinsic hallucination）：模型输出无法从源内容得到验证，既不受源内容支持也不受其反驳

    > 模型输出应该以预训练数据集为基础。但是，由于预训练数据集规模庞大，因此检索和识别冲突的成本非常高，不可能每次生成时都执行。如果我们认为预训练数据语料库可以代表世界知识，那么我们本质上就是需要确保模型输出的是事实并且可通过外部世界知识进行验证。另一个功能也同样重要： <span class="underline">如果模型不知道某个事实，那么它应该表示自己不知道</span>

处理幻觉的常用策略（[来源](https://github.com/luhengshiwo/LLMForEverybody/blob/main/06-%E7%AC%AC%E5%85%AD%E7%AB%A0-Prompt%20Engineering/COT%E6%80%9D%E7%BB%B4%E9%93%BE%EF%BC%8CTOT%E6%80%9D%E7%BB%B4%E6%A0%91%EF%BC%8CGOT%E6%80%9D%E7%BB%B4%E5%9B%BE%EF%BC%8C%E8%BF%99%E4%BA%9B%E9%83%BD%E6%98%AF%E4%BB%80%E4%B9%88.md)）：

| 策略                                                    | 难度 | 数据要求 | 准确性提升 |
|-------------------------------------------------------|----|------|-------|
| [Prompt engineering]({{< relref "提示工程.md" >}})      | 低 | 无   | 26%    |
| Self-reflection                                         | 低 | 无   | 26-40% |
| Few-shot learning (with [RAG]({{< relref "rag.md" >}})) | 中 | 少量 | 50%    |
| Instruction Fine-tuning                                 | 高 | 中等 | 40-60% |
