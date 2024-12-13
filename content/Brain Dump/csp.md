---
title: "CSP"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:07+08:00
draft: false
---

CSP，即内容安全策略（Content Security Policy），是一种网络安全标准，用于帮助防止
跨站脚本（XSS）、数据注入等多种类型的信息安全攻击。CSP 允许通过有效域来定义页面
可以加载哪些资源，从而降低 XSS 攻击的风险（禁止加载不受信任的 JavaScript）。

{{< figure src="/ox-hugo/_20240529_105550screenshot.png" >}}

CSP 一般通过 [Content-Security-Policy](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Content-Security-Policy) 响应头来设置，但是也可以通过 `<meta>` 标签来
设置：

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; img-src https://*; child-src 'none';" />
```
