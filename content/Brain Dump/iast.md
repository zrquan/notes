---
title: "IAST"
author: ["4shen0ne"]
draft: false
---

IAST 是 AST 其中的一个类别，AST 是Application Security Testing的简称，在他之下衍生出来以下几种类型：

-   SAST: Static Application Security Testing
-   DSAT: Dynamic Application Security Testing
-   MAST: Mobile Application Security Testing
-   IAST: Interactive Application Security Testing

IAST 可以理解为SAST(静态测试)和 DAST(动态测试) 的结合，通过运行时代理的方法在测试阶段监控、分析应用程序的行为

{{< figure src="/ox-hugo/_20211220_1544201621474516_60a5bcd4cc0f4284438f1.jpg" caption="<span class=\"figure-number\">Figure 1: </span>京东 IAST 架构图" >}}

白盒主要由源代码分析和字节码分析组成，涉及污点分析和符号执行等技术。

通过白盒可以得到两个重要的输出，第一个是输入参数和限制条件，第二个是不安全方法调用，不安全方法调用一般含有两个来源——一类是普遍存在的标准函数，比如说 SQL 异常、组件调用、文件读取，网络访问等；另一类是和业务相关的场景化调用，比如说支付、查库存，订单交易等。

黑盒主要利用响应测试对外的 API 。常见的方式是各种 POC或指纹扫描，FUZZ 模糊测试技术和动态污点分析技术。
