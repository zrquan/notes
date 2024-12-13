---
title: "Emacs启动过程"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:10+08:00
tags: ["emacs"]
draft: false
---

1.  在 load-path 列表中的所有目录下运行 subdirs.el，将目录下的子目录都递归添加到
    load-path 中。一般来说，subdirs.el 文件在 Emacs 安装时自动生成。

2.  在 load-path 的目录中找到 leim-list.el 文件并加载，该文件用来注册输入法。
    Emacs 只会寻找用户添加的 leim-list.el 文件，而跳过包含 Emacs 标准库的目录（这
    些目录应该会包含一个在编译 Emacs 时生成的 leim-list.el 文件）。

3.  将变量 before-init-time 设置为 current-time。同时将变量 after-init-time 设置
    为 nil，在 Lisp 程序中这意味着 Emacs 的初始化已完成。

4.  如果系统设置了 LANG 之类的环境变量，Emacs 会设置语言环境和终端编码系统。

5.  对命令行参数做基本解析。

6.  如果 Emacs 没有运行在 batch mode，初始化 init-window-system 变量指定的窗口系
    统。初始化函数 window-system-initialization 是一个泛型函数，其在每个支持的窗
    口系统上有不同的实现。如果变量 initial-window-system 的值是 windowsystem，那
    么初始化函数的具体定义在 term/windowsystem-win.el 文件中，该文件在构建 Emacs
    时被编译到可执行文件中。

7.  运行 before-init-hook。

8.  如果启动时没有指定 --batch 或 --daemon 参数，则创建一个图形化 Frame。

9.  初始化首个窗口的 face，根据需要创建菜单栏和工具栏。如果系统支持图形 Frame，即
    使当前不处于图形 Frame 也会创建工具栏，因为图形 Frame 会在稍后创建。

10. 使用 custom-reevaluate-setting 来重新初始化 custom-delayed-init-variables 列
    表中的成员。有很多预加载的用户选项依赖于运行环境，而不是编译环境或上下文。

11. 如果没有指定 -Q 或 --no-site-file 参数，且 site-start 库存在，则加载 site-start 库。

12. 如果没有指定 -q，-Q，--batch 参数，加载用户的初始化文件（[Init File](https://www.gnu.org/software/emacs/manual/html_node/elisp/Init-File.html#Init-File)）。如果指
    定了 -u 参数，Emacs 在指定用户的家目录下寻找初始化文件。

13. 如果变量 inhibit-default-init 的值为 nil，且没有指定 -q，-Q，--batch 参数，
    则加载 default 库。

14. 如果变量 abbrev-file-name 指定的文件存在且可读，并且没有指定 --batch 参数，
    则从指定文件中读入 abbrevs。

15. 如果变量 package-enable-at-startup 的值不为 nil，且没有指定 -q，-Q，--batch
    参数，Emacs 调用 package-initialize 函数激活已安装的包。如果启动时指定了相关
    参数，可以显式调用 package-initialize 函数。

16. 将变量 after-init-time 的值从 nil 设置为 current-time，意味着初始化阶段完成，
    通过该变量和 before-init-time 变量可以计算出初始化 Emacs 花费的时间。

17. 运行 after-init-hook。

18. 如果 buffer **scratch** 存在且处于 Fundamental mode（默认情况），Emacs 通过
    initial-major-mode 设置主模式。

19. 如果 Emacs 在文本终端启动，没有指定 --batch 参数且 term-file-prefix 不为 nil，
    则加载文本终端相关的库（[Terminal-Specific](https://www.gnu.org/software/emacs/manual/html_node/elisp/Terminal_002dSpecific.html#Terminal_002dSpecific)），然后运行 tty-setup-hook。

20. 显示初始化的回显区信息，可以通过 inhibit-startup-echo-area-message 关闭。

21. 处理之前没有处理的命令行参数。

22. 如果指定了 --batch 参数，现在就退出 Emacs。

23. 如果 buffer **scratch** 存在且为空，在 buffer 中插入  initial-scratch-message。

24. 如果 initial-buffer-choice 是一个字符串，或者在启动参数中指定了文件，则访问
    该文件或目录；如果是一个函数，则根据返回的值选择 buffer。如果指定了多个文件，
    则显示 buffer \*Buffer List\*。

25. 运行 emacs-startup-hook。

26. 调用 frame-notice-user-settings，根据 init 文件修改当前选中的 frame 的参数。

27. 运行 window-setup-hook。

28. 如果 inhibit-startup-screen 和 initial-buffer-choice 为 nil，且没有指定
    --no-splash，-Q 参数，则显示启动页面，里面包含一些版权信息和教程。

29. 如果要启动守护进程，调用 server-start。

30. 如果通过 X session manager 启动 Emacs，则调用 emacs-session-restore 将之前会
    话的 ID 作为参数传递给它。
