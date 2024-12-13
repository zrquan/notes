---
title: "zsh补全系统"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:17+08:00
draft: false
---

zsh completion system（compsys）是 zsh 的重要组成部分，当我们在 shell 中输入命令
时可以通过制表符（tab 键）进行补全

如果没有安装 oh my zsh，则需要手动启用补全系统：

```bash
autoload -U compinit
compinit
```

补全函数可以通过直接调用 compdef 函数来手动注册

```text
compdef <function-name> <program>
```

通常将补全函数定义在一个独立的文件中，文件名以下划线为前缀，后面加上需要补全的命
令名称

当通过 compinit 初始化补全系统时，zsh 会查找 fpath 变量指定路径下的所有文件，并读
取第一行。因此，我们只需要将补全脚本放在 fpath 变量所指定的路径下即可，当然，还
需要确保文件的第一行包含了 compdef 命令


## 示例 {#示例}

假设我们有一个程序 hello，其选项如下所示：

```bash
hello -h | --help
hello quietly [--slient] <message>
hello loudly [--repeat=<number>] <message>
```

对应的补全函数如下：

```bash
#compdef _hello hello

function _hello { # 默认补全
    local line

    # 脚本通过调用 _arguments 函数来向 zsh 提供可能的补全项
    _arguments -C \
        "-h[Show help information]" \
        "--h[Show help information]" \
        "1: :(quietly loudly)" \
        "*::arg:->args"

    case $line[1] in
        loudly)
            _hello_loudly
        ;;
        quietly)
            _hello_quietly
        ;;
    esac
}

function _hello_quietly { # 对 quietly 子命令的补全
    _arguments \
        "--silent[Dont output anything]"
}

function _hello_loudly { # 对loudly 子命令的补全
    _arguments \
        "--repeat=[Repat the <message> any number of times]"
}
```
