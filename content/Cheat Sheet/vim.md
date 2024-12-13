---
title: "Vim"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:19+08:00
draft: false
---

## 删除每一行中特定的内容 {#删除每一行中特定的内容}

```text
:%s/<regex>//g
```


## 统计每一行内容的重复次数，然后从多到少排序 {#统计每一行内容的重复次数-然后从多到少排序}

```text
:%!sort | uniq -c | sort -nr
```


## 删除不包含特定内容的行 {#删除不包含特定内容的行}

```text
:v/<regex>/d
```
