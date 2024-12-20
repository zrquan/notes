---
title: "vmware虚拟机网卡未启动"
author: ["4shen0ne"]
draft: false
---

从 [vulhub](https://www.vulnhub.com/) 下载虚拟机打开发现虚拟机网卡没有起来（ens33 网口没有 IP 地址）

这时可以试一下执行 `dhclient ens33`
