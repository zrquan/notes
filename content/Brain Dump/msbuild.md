---
title: "MSBuild"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:35+08:00
draft: false
---

MSBuild 是 Microsoft Build Engine 的缩写, 代表 Microsoft 和 Visual Studio 的新的
生成平台。MSBuild 在如何处理和生成软件方面是完全透明的, 使开发人员能够在未安装
Visual Studio 的环境中组织和生成产品。

通过构建 xml 配置文件, 使用 MSBuild 生成恶意程序并执行, 比如下面是 covenant 的
xml 文件: [GruntSMB.xml](/home/zrquan/Dropbox/org/roam/GruntSMB.xml)

MSBuild 默认没有在环境变量中, metasploitable3 的位置是

```text
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe
```
