---
title: "Obsidian Callouts"
author: ["4shen0ne"]
draft: false
---

Quartz 支持 [Obsidian callouts](https://help.obsidian.md/Editing+and+formatting/Callouts)，但因为我是将 [org-mode]({{< relref "../org_mode.md" >}}) 导出为 markdown，需要用以下
写法：

```text
#+begin_export md
> [!tip]
> This is a callout tip!
#+end_export
```

> [!tip]
> This is a callout tip!
