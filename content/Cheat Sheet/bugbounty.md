---
title: "BugBounty"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:06+08:00
draft: false
---

## 记录一些用于挖漏洞的命令 {#记录一些用于挖漏洞的命令}

端口扫描

```text
masscan -p80,443,8000-8100,8443 -iL targets.txt -v -oL masscan_out.txt
```

子域名收集（CDN 探测）：

```text
subfinder -silent -d hackerone.com | dnsx -silent -a -cdn -resp
```

HTTP 服务探测

```text
subfinder -silent -d hackerone.com | httpx -silent -title -status-code -probe
```

批量目录扫描

```text
subfinder -silent -d hackerone.com | httpx -silent | dirsearch -w Logins.fuzz.txt -e html -i 200 --stdin
```
