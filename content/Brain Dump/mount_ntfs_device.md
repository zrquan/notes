---
title: "mount ntfs device"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:34+08:00
tags: ["linux"]
draft: false
---

## unknown filesystem type 'ntfs' {#unknown-filesystem-type-ntfs}

1.  yay -S ntfs-3g
2.  sudo mount -t ntfs-3g /dev/sda1 /run/media/xxx
