---
title: "Emacs Autoload"
author: ["4shen0ne"]
tags: ["emacs"]
draft: false
---

你可以给 elisp 函数或者宏注册为 autoload，Emacs 会记住这些 autoload 函数的位置以
及所属的文件。在启动 Emacs 并不会立刻加载这些文件，但是你可以调用这些已注册的函
数/宏，在调用时 Emacs 就会去加载其所在的文件
