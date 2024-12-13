---
title: "JSON Interoperability Vulnerabilities"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:25+08:00
draft: false
---

JSON 互用性漏洞？还是 JSON 互操作性漏洞？

anyway, 这是由于不同的 JSON 解析器在实现 JSON 规范时存在差异而导致的一种漏洞。由
于在现今的前后端分离、微服务架构应用中，一个 JSON 报文可能经过多个服务模块，而不
同的解析实现可能导致安全漏洞，总结为以下几类：

1.  key 重复时的优先级不一致问题
2.  key 碰撞：字符截断和注释
3.  JSON 序列化的怪异行为
4.  浮点数和整数表示
5.  宽松的解析行为和其他 bugs

article: <https://bishopfox.com/blog/json-interoperability-vulnerabilities>

labs: <https://github.com/BishopFox/json-interop-vuln-labs>
