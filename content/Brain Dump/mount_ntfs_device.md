---
title: "mount ntfs device"
author: ["4shen0ne"]
tags: ["linux"]
draft: false
---

## unknown filesystem type 'ntfs' {#unknown-filesystem-type-ntfs}

1.  yay -S ntfs-3g
2.  sudo mount -t ntfs-3g /dev/sda1 /run/media/xxx
