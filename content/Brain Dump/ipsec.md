---
title: "IPsec"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:15+08:00
draft: false
---

Internet Protocol Security 是为 IP 网络提供安全性的协议和服务的集合，通过对 IP
协议的分组进行加密和认证来保护 IP 数据包不被窃取、伪造或篡改，是 VPN 中常用的一
种技术


## 组成部分 {#组成部分}

1.  认证头（AH）：为 IP 数据包提供无连接数据完整性、消息认证以及防重放攻击保护
2.  封装安全载荷（ESP）：提供机密性、数据源认证、无连接完整性、防重放和有限的传输
    流（traffic-flow）机密性
3.  Internet Key Exchange：为 AH、ESP 操作所需的安全关联（SA）提供算法、数据包和
    密钥参数
