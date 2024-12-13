---
title: "ping oob"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:17+08:00
draft: false
---

有时候需要 oob server 确认命令执行是否成功（ping）

在 oob server 执行：

```nil
iptables -I INPUT -p icmp --icmp-type 8 -m state  --state NEW,ESTABLISHED,RELATED -j LOG --log-level=1 --log-prefix "Ping Request "
```

ping 日志会输出到 `/var/log/message` 文件中

或者用 tcpdump

```text
tcpdmpu ip proto \\icmp
```
