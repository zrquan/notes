---
title: "Git分支模式"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:13+08:00
draft: false
---

{{< figure src="/ox-hugo/_20220428_110237screenshot.png" >}}

各个分支的责任：开发主要在 develop 上，稳定版本释放由 develop 派生 release 分支。
等项目稳定运行一段时间后，就合并回 develop 和 master 并打 tag。如果 master 出问
题了就派生 hotfix 分支修复，之后合并回 master 和 develop 分支。feature 分支用于
尝试加入新特性，派生自 develop, 开发完成后合并回 develop
