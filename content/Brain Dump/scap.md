---
title: "SCAP"
author: ["4shen0ne"]
draft: false
---

SCAP（Security Content Automation Protocol，读作“ess-cap”）是一组用于增强软件安
全性的标准，由美国国家标准与技术研究院（NIST）维护。它旨在为自动化软件漏洞管理、
补丁管理和合规性评估提供标准化的方法和协议。

SCAP 包括以下主要组成部分：

1.  XCCDF (Extensible Configuration Checklist Description Format): 一种规范检查列
    表内容的框架，用于描述安全配置、漏洞检查和其他政策的复杂性。
2.  OVAL (Open Vulnerability and Assessment Language): 用于描述和检查系统配置和漏
    洞状态的语言。
3.  CCE (Common Configuration Enumeration): 提供一个唯一标识符，用于描述计算机系
    统配置问题。
4.  [CPE]({{< relref "cpe.md" >}}) (Common Platform Enumeration): 用于统一描述和标识应用软件、操作系统和硬件
    设备的标准化方法。
5.  `CVE` (Common Vulnerabilities and Exposures): 公开的漏洞和安全漏洞数据库，为已
    知漏洞提供一个标准的名称。
6.  `CVSS` (Common Vulnerability Scoring System): 一个开放的框架，用于为软件漏洞分
    配严重性评分。
7.  `CWE` (Common Weakness Enumeration): 一种列举软件和硬件弱点的方法，使其能够被系
    统地标识和分类。
