---
title: "Chrome Ozone"
author: ["4shen0ne"]
draft: false
---

Ozone 是 Chrome 浏览器在 Linux 系统中的一个底层图形抽象层，用于简化和统一操作系
统与 Chrome 图形系统的接口。Ozone 主要负责管理窗口系统和输入系统，使 Chrome 能够
在不同的图形和输入系统上运行，例如 Wayland 和 X11。

在 Wayland 中使用 Chrome 时，可以访问 `chrome://flags/` 将 `Preferred Ozone
platform` 的值改为 Auto 或者 Wayland，有以下好处：

1.  性能提升：使用 Wayland 直接模式可以减少中间层的使用（例如 XWayland），从而可
    能减少一些渲染和输入处理的延迟。
2.  可以使用 `--enable-features=TouchpadOverscrollHistoryNavigation` 参数以支持触控
    板手势（不确定，反正我不修改 Ozone 的话不会生效）。
3.  增强安全性：Wayland 默认不允许客户端访问彼此的资源或窗口。
4.  更好的高分辨率支持：Wayland 对高 DPI 设备的支持更好。

如果修改 Ozone 后 fcitx5 无法使用，添加 `--enable-wayland-ime` 启动参数。
