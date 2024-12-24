---
title: "RAG"
author: ["4shen0ne"]
tags: ["llm"]
draft: false
---

当语言模型要完成高复杂度和知识密集型任务时，需要基于语言模型构建一个系统，使它可以访问外部知识，不然可能出现「[幻觉]({{< relref "llm幻觉.md" >}})」

Meta AI 的研究人员引入了一种叫做[检索增强生成（Retrieval Augmented Generation， RAG ）](https://ai.facebook.com/blog/retrieval-augmented-generation-streamlining-the-creation-of-intelligent-natural-language-processing-models/)的方法来完成这类知识密集型的任务

RAG 技术是一种将检索和生成技术结合的方法，旨在提高语言模型生成内容的准确性和实用性。RAG 技术尤其适用于需要利用外部知识库来回答问题或生成文本的场景。

LangChain RAG demo: <https://python.langchain.com/docs/tutorials/rag/>


## 文档向量化过程 {#文档向量化过程}

文档-&gt;分词-&gt;[embedding]({{< relref "word_embedding.md" >}})-&gt;向量数据库


## 用户查询过程 {#用户查询过程}

用户query-&gt;向量数据库查询-&gt;TOP N-&gt;上下文+用户提问+ [prompt]({{< relref "提示工程.md" >}}) -&gt; LLM -&gt;返回结果


### 检索阶段（Retrieval Stage） {#检索阶段-retrieval-stage}

检索目标：从一个预先构建的知识库中检索出与用户查询最相关的文档或片段。

检索方法：通常使用向量检索方法，如基于密集向量表示的检索模型（如 DPR，Dense Passage Retrieval），将查询和文档映射到相同的向量空间，并根据向量相似度进行检索。


### 生成阶段（Generation Stage） {#生成阶段-generation-stage}

生成目标：使用语言模型（如 GPT）生成基于检索到的信息的回答或文本。

生成方法：将检索到的相关文档或片段作为额外的上下文输入到生成模型中，从而生成更准确和相关的内容。


### 具体步骤 {#具体步骤}

1.  用户查询处理：接收用户的查询，并对其进行预处理（如分词、去停用词等）。

2.  查询向量化：将用户查询转化为向量表示。通常使用预训练的双塔模型（dual-encoder model），如 DPR 模型的查询编码器。

3.  文档检索：在知识库中进行向量检索，找到与查询向量最相似的文档或片段。知识库中的文档也需要预先编码为向量。

4.  相关文档选择：选择最相关的若干个文档或片段（例如前 k 个）。

5.  生成模型输入：将用户查询和检索到的文档片段作为上下文输入到生成模型中。常见的方法是将查询和文档拼接成一个输入序列。

6.  生成答案：使用生成模型（ GPT-3 、BERT 等）生成基于上下文的答案或文本。
