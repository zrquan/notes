---
title: "Cgroup"
author: ["4shen0ne"]
tags: ["linux"]
draft: false
---

Cgroups (Control Groups) 是 Linux 内核的一个功能，它允许你组织和管理进程及其资源使用（如 CPU 时间、系统内存、网络带宽或磁盘 I/O）的分配。

<div class="table-caption">
  <span class="table-number">Table 1:</span>
  Cgroups 提供的主要功能
</div>

| 功能  | 描述                          |
|-----|-----------------------------|
| 资源限制 | 可以限制进程组可以使用的资源量，比如 CPU、内存等。 |
| 优先级分配 | 可以控制不同进程组访问同一资源时的优先级。 |
| 资源隔离 | 可以使不同的进程组在资源使用上彼此隔离，减少相互影响。 |
| 资源监控 | 可以监控进程组使用资源的情况，帮助诊断系统问题或优化性能。 |
| 资源控制 | 可以在运行时动态调整资源的分配。 |
