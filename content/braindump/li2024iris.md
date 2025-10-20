---
title: "IRIS"
author: ["4shen0ne"]
draft: false
---

## 工作流程 {#工作流程}

{{< figure src="/ox-hugo/iris-d2.svg" >}}


## 提示词：从外部 API 和内部方法的形参推断 source 和 sink {#提示词-从外部-api-和内部方法的形参推断-source-和-sink}


### 1. 将外部 API 标记为 source 或 sink {#1-dot-将外部-api-标记为-source-或-sink}

从高层级来说，这属于一个分类任务，将每个 API 分类为 `source, sink, taint-propagator, none` 的其中之一。

提示词中要给出 CWE 的描述，因为 source 和 sink 的选取和不同的漏洞类型有关。

`taint-propagator` 这一分类并不会在后续使用，只是为了让 LLM 更好地识别出 `source`

```text
System: You are a security expert. You are given a list of APIs to be labeled as potential taint sources, sinks, or APIs that propagate taints. Taint sources are values that an attacker can use for unauthorized and malicious operations when interacting with the system. Taint source APIs usually return strings or custom object types. Setter methods are typically NOT taint sources. Taint sinks are program points that can use tainted data in an unsafe way, which directly exposes vulnerability under attack. Taint propagators carry tainted information from input to the output without sanitization, and typically have non-primitive input and outputs. Return the result as a json list with each object in the format:

{ "package": <package name>, "class": <class name>, "method": <method name>, "signature": <signature of the method>, "sink_args": <list of arguments or ‘this‘; empty if the API is not sink>, "type": <"source", "sink", or "taint-propagator"> }

DO NOT OUTPUT ANYTHING OTHER THAN JSON.


User: [CWE_LONG_DESCRIPTION]

Some example source/sink/taint-propagator methods are:
[CWE_SOURCE_SINK_EXAMPLES]

Among the following methods, assuming that the arguments passed to the given function is malicious, what are the functions that are potential source, sink, or taint-propagators to [CWE_TITLE] attack (CWE-[CWE_ID])?

Package,Class,Method,Signature
[Package1],[Class1],[Method1],[Signature1]
[Package2],[Class2],[Method2],[Signature2]
[...]
```


### 2. 将（项目）内部 API 的形参标记为 source {#2-dot-将-项目-内部-api-的形参标记为-source}

项目的 README 和 API 文档会有所帮助。

这里的目的是推断内部 API 是否会被下游代码调用，并将恶意输入传递给形参，以构成完整的污染传播路径。这一过程和具体的漏洞类型无关，所以不需要提供 CWE 描述信息。

```text
System: You are a security expert. You are given a list of APIs implemented in established Java libraries, and you need to identify whether some of these APIs could be potentially invoked by downstream libraries with malicious end-user (not programmer) inputs. For instance, functions that deserialize or parse inputs might be used by downstream libraries and would need to add sanitization for malicious user inputs. On the other hand, functions like HTTP request handlers are typically final and won’t be called by a downstream package. Utility functions that are not related to the primary purpose of the package should also be ignored. Return the result as a json list with each object in the format:

{ "package": <package name>, "class": <class name>, "method": <method name>, "signature": <signature>, "tainted_input": <a list of argument names that are potentially tainted> }

In the result list, only keep the functions that might be used by downstream libraries and is potentially invoked with malicious end-user inputs. Do not output anything other than JSON.


User: You are analyzing the Java package [PROJECT_AUTHOR]/[PROJECT_NAME]. Here is the package summary:

[PROJECT_README_SUMMARY]

Please look at the following public methods in the library and their documentations (if present). What are the most important functions that look like can be invoked by a downstream Java package that is dependent on [PROJECT_NAME], and that the function can be called with potentially malicious end-user inputs? If the package does not seem to be a library, just return empty list as the result. Utility functions that are not related to the primary purpose of the package should also be ignored.

Package,Class,Method,Doc
[Package1],[Class1],[Method1],[Documentation1]
[Package2],[Class2],[Method2],[Documentation2]
[...]
```


## PosthocFilterPrompt {#posthocfilterprompt}

```text
## 角色
你是一个漏洞挖掘专家，精通Java代码静态分析

## 任务
用户将提供一份污点分析结果，包含污点源（source）、污染传播路径、污点汇聚点（sink），请结合所提供的代码片段以及传播路径，判断代码是否存在可被利用的漏洞

## 要求
- 判断source是否为误报，source应该是用户可控的输入数据或机密数据
- 判断sink是否为误报，sink应该是危险的函数调用
- 判断是否存在漏洞，当source和sink都不是误报，且路径中明显没有进行安全处理时，漏洞才存在
- 无论是否存在漏洞，都要提供精简的解释作为依据

## 输出要求
仅输出JSON结果，格式如下：
{
  "explanation": <中文解释>,
  "source_is_false_positive": <true or false>,
  "sink_is_false_positive": <true or false>,
  "is_vulnerable": <true or false>
}
```


## Refs {#refs}

-   @li2024iris
