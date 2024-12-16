---
title: "LLM设置参数"
author: ["4shen0ne"]
tags: ["llm"]
draft: false
---

## Temperature {#temperature}

简单来说，temperature 的参数值越小，模型就会返回越确定的一个结果。如果调高该参数
值，大语言模型可能会返回更随机的结果，也就是说这可能会带来更多样化或更具创造性的
产出。 **（调小 temperature）实质上，你是在增加其他可能的 token 的权重。** 在实际应用
方面，对于质量保障（QA）等任务，我们可以设置更低的 temperature 值，以促使模型基
于事实返回更真实和简洁的结果；对于诗歌生成或其他创造性任务，适度地调高
temperature 参数值可能会更好。


## Top_p {#top-p}

同样，使用 top_p（与 temperature 一起称为核采样（nucleus sampling）的技术），可
以用来控制模型返回结果的确定性。如果你需要准确和事实的答案，就把参数值调低。如果
你在寻找更多样化的响应，可以将其值调高点。

使用 Top P 意味着只有词元集合（tokens）中包含 top_p 概率质量的才会被考虑用于响应，因
此 **较低的 top_p 值会选择最有信心的响应** 。这意味着较高的 top_p 值将使模型考虑更多可能
的词语，包括不太可能的词语，从而导致更多样化的输出。

> [!tip]
> 一般建议是改变 Temperature 和 Top P 其中一个参数就行，不用两个都调整


## Max Length {#max-length}

可以通过调整 max length 来控制大模型生成的 token 数。指定 Max Length 有助于防止
大模型生成冗长或不相关的响应并控制成本


## Stop Sequences {#stop-sequences}

stop sequence 是一个字符串，可以阻止模型生成 token，指定 stop sequences 是控制大
模型响应长度和结构的另一种方法。例如，您可以通过添加「11」作为 stop sequence 来
告诉模型生成不超过 10 个项的列表


## Frequency Penalty {#frequency-penalty}

frequency penalty 是对下一个生成的 token 进行惩罚， **这个惩罚和 token 在响应和提
示中已出现的次数成比例** ，frequency penalty 越高，某个词再次出现的可能性就越小，
这个设置通过给重复数量多的 Token 设置更高的惩罚来减少响应中单词的重复


## Presence Penalty {#presence-penalty}

presence penalty 也是对重复的 token 施加惩罚，但与 frequency penalty 不同的是，\*
惩罚对于所有重复 token 都是相同的\* 。出现两次的 token 和出现 10 次的 token 会受
到相同的惩罚。

此设置可防止模型在响应中过于频繁地生成重复的词。如果您希望模型生成多样化或创造性
的文本，您可以设置更高的 presence penalty，如果您希望模型生成更专注的内容，您可
以设置更低的 presence penalty

> [!tip]
> 与 temperature 和 top_p 一样，一般建议是改变 frequency penalty 和 presence penalty 其中一个参数就行，不要同时调整两个
