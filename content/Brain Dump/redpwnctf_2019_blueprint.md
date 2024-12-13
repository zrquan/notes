---
title: "RedPwnCTF 2019 blueprint"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:46+08:00
draft: false
---

审计 blueprint.js 代码，发现在构造 user 对象时会将 flag 写到 blueprints 的属性中。
但由于属性不是 public，所以正常情况下看不到，我们需要将 blueprints 的 public 属
性污染成 true

代码中用到了 lodash (v4.17.11) 的 defaultsDeep 函数，而这个版本的函数是存在原型
链污染漏洞的

{{< figure src="/ox-hugo/_20231010_150127screenshot.png" >}}

使用 payload 污染 Object.prototype

```text
"constructor": {"prototype": {"public": true}}
```
