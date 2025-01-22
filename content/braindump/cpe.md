---
title: "CPE"
author: ["4shen0ne"]
draft: false
---

CPE（Common Platform Enumeration）是一个由 NIST（美国国家标准与技术研究院）维护
的标准化的方法，是 [SCAP]({{< relref "scap.md" >}}) 的组成部分之一，用于描述和识别软件应用、操作系统以及硬件
设备中的信息。

CPE 旨在通过一个标准化的命名约定来帮助识别和匹配计算机系统中存在的软/硬件组件。

CPE 命名格式通常包括一系列的属性，例如：

-   类别：指明是操作系统（o）、硬件（h）还是应用（a）
-   供应商：制造软件或硬件的厂商
-   产品：具体的产品名称
-   版本：产品的版本号
-   更新：产品的更新版本
-   版次：特定的发布版次
-   语言：软件支持的语言

一个 CPE 例子，代表微软的 Internet Explorer 浏览器，版本为 8.0 beta：

```text
cpe:/a:microsoft:internet_explorer:8.0:beta
```
