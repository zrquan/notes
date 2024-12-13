---
title: "rime配置"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:18+08:00
tags: ["rime"]
draft: false
---

-   build: 不要碰

-   〔全局设定〕 default.yaml
-   〔发行版设定〕 ibus_rime.yaml（或者 weasel.yaml 等等）
-   〔预设输入方案副本〕 &lt;方案标识&gt;.schema.yaml
-   ※〔安装信息〕 installation.yaml
-   ※〔用户状态信息〕 user.yaml

-   \*.custom.yaml: 用户自己的配置，比如用户想更改 default.yaml, 不要直接更改而是新
    建 default.custom.yaml 然后进行 patch
    -   ※〔用户对全局设定的定制信息〕 default.custom.yaml
    -   ※〔用户对预设输入方案的定制信息〕 &lt;方案标识&gt;.custom.yaml
    -   ※〔用户自制输入方案〕及配套的词典源文件

-   ※〔用户词典〕 &lt;词典名&gt;.userdb.kct
-   ※〔用户词典快照〕 &lt;词典名&gt;.userdb.txt、&lt;词典名&gt;.userdb.kct.snapshot 见于同步文件夾

-   〔Rime 棱镜〕 &lt;方案标识&gt;.prism.bin
-   〔Rime 固态词典〕 &lt;词典名&gt;.table.bin
-   〔Rime 反查词典〕 &lt;词典名&gt;.reverse.bin

```text
※ 表示用户数据，要注意备份
```
