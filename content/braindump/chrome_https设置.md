---
title: "Chrome HTTPS设置"
author: ["4shen0ne"]
draft: false
---

Chrome 有一个安全配置项叫 `Always use secure connections`, 开启该选项时，Chrome 会优先使用 [https]({{< relref "https.md" >}}) 访问页面，如果页面不支持 https 则会发出安全警告

BurpSuite 内置的 chromium 浏览器开启了这个选项导致网站可能自动升级为 https，可以访问 `chrome://settings/security?search=https` 关闭该选项
