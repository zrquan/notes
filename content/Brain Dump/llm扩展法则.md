---
title: "LLM扩展法则"
author: ["4shen0ne"]
tags: ["llm"]
draft: false
---

数据规模的增长为大语言模型提供了更丰富的信息源，意味着模型可以学习更多样化的语言模式和深层次的语义关系，极大增强模型的表达能力；同时也意味着更高的计算成本和存储需求。为了在资源消耗和性能提升之间找到一个平衡点，扩展法则应运而生—— **这些法则揭示了模型的能力随模型的数据规模的变化关系** ，为大语言模型的设计和优化提供指导和参考


## Kaplan-McCandlish 扩展法则 {#kaplan-mccandlish-扩展法则}

模型的性能与模型以及数据规模这两个因素均高度正相关。然而，在模型规模相同的情况下，模型的具体架构对其性能的影响相对较小。因此， **扩大模型规模和丰富数据集** 成为了提升大型模型性能的两个关键策略

此外，OpenAI 在进一步研究计算预算的最优分配时发现，总计算量 C 与数据量 D 和模型规模 N 的乘积近似成正比，即 `C ≈ 6N D`. 在这一条件下，如果计算预算增加，为了达到最优模型性能，数据集的规模 D 以及模型规模 N 都应同步增加， **但是模型规模的增长速度应该略快于数据规模的增长速度**


## Chinchilla 扩展法则 {#chinchilla-扩展法则}

和 KM 法则中「模型规模的增长速度应该略快于数据规模的增长速度」的观点不同，Chinchilla 扩展法则认为 **模型规模和数据规模几乎同等重要，应该以相同的比例增加**
