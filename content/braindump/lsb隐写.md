---
title: "LSB隐写"
author: ["4shen0ne"]
tags: ["misc", "ctf"]
draft: false
---

LSB 的英文全称为 Least Significant Bit, 图像像素一般是由 RGB 三原色（即红绿蓝）组
成的，每一种颜色占用 8 位 (`0x00~0xFF`) ，一共有 256 种颜色，可组合成 256 的 3 次方种颜色，
而人的肉眼能区分的只有其中一小部分，这导致了当我们修改 RGB 颜色分量种最低的二进制
位的时候，人眼无法察觉变化。

常见的 LSB 隐写是在 PNG 图片中完成的，因为 PNG 图片是一种无损压缩的位图片形格式，如果
在 JPG 图片上进行隐写，就可能因为压缩算法导致数据丢失。

常用分析工具：Stegsolve
