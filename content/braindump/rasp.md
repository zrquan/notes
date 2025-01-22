---
title: "RASP"
author: ["4shen0ne"]
draft: false
---

全称Runtime application self-protection，即程序运行时保护——通过代码插桩将防御逻辑注入到应用程序的业务代码中，和应用程序融为一体，为其提供自我保护能力。

RASP 技术相较于传统的 WAF 拥有了更加精准、深层次的防御。RASP 不但可以实现类似[IAST]({{< relref "iast.md" >}})的请求参数追踪功能，同时还采用了基于攻击行为分析的主动防御机制，严防文件读写、数据访问、命令执行等 Web 应用系统命脉，为 Web 应用安全筑建出“万丈高墙”。

但是也存在一些缺点，主要是对业务方面的影响，比如需要修改应用的运行逻辑、对效率有一定影响、部署难度大等等。

Java RASP 的实现主要通过：

1.  [JVMTI]({{< relref "jvmti.md" >}}) 实现的 Agent ，利用 [Instrumention机制]({{< relref "java_instrumentation.md" >}})；
2.  字节码操作，利用 ASP 、[Javassist]({{< relref "javassist.md" >}})等框架。
