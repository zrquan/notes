---
title: "gopher协议"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:13+08:00
draft: false
---

gopher 是在 http 协议诞生前用来访问 Internet 资源的协议，可以简单理解为 http 的简
化版，它有个特点是可以将多个数据包整合发送，在有 ssrf 的前提下可以通过 gopher 扩
大攻击面（通常是 php, 因为 java 的 ssrf 限制太多而且在 jdk8 就移除了 gopher 协议）

格式：gopher://&lt;host&gt;:&lt;port&gt;/&lt;gopher-path&gt;

其中 gopher-path 可以是以下任意一种：

-   &lt;gophertype&gt;&lt;selector&gt;
-   &lt;gophertype&gt;&lt;selector&gt;%09&lt;search&gt;
-   &lt;gophertype&gt;&lt;selector&gt;%09&lt;search&gt;%09&lt;gopher+_string&gt;

详细：<https://xz.aliyun.com/t/6993>
