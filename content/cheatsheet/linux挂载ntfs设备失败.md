---
title: "Linux挂载NTFS设备失败"
author: ["4shen0ne"]
draft: false
---

如果在 Linux 上挂载 NTFS 格式的移动硬盘显示 `wrong fs type, bad option...` 类似的
错误信息，可能因为是磁盘存在脏位（dirty bit）

解决方法：

1.  在 Windows 系统上执行 `chkdsk /f D:` 检查和修复脏位
2.  禁用 ntfs3，改用 ntfs-3g，因为 ntfs-3g 会忽略脏位进行挂载，这也意味着存在数据
    丢失的风险，所以还是建议用第一种方式修复磁盘

来源：<https://forum.manjaro.org/t/error-mounting-ntfs-hdd-wrong-fs-type-bad-option-bad-superblock/154176>
