---
title: "asyncio.create_subprocess_exec/shell"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:02+08:00
draft: false
---

> [!info] This is a markdown file

在 Python 的`asyncio`模块中，`create_subprocess_exec`和
`create_subprocess_shell`两个函数都用于异步地创建子进程，但它们在使用上有一些关
键的区别，这些区别主要体现在如何执行子进程以及各自的使用场景：

### 1. `asyncio.create_subprocess_exec`

- **用途**：`create_subprocess_exec`用于直接执行指定的程序，它直接调用可执行文件，
  并将参数作为单独的元素传递给程序。这种方式更为直接和安全，因为它避免了 shell
  的干预，降低了因错误解析参数而引发的安全风险。

- **参数**：这个函数直接接收程序名和一系列参数。例如，
  `create_subprocess_exec('ls', '-l', '/usr')`直接执行`ls`程序，并传递`-l`和
  `/usr`作为参数。

- **特点**：更适合需要直接控制程序执行并且参数已经明确的场景。因为避免了 shell
  的解释执行，它通常被认为更安全、更高效。

### 2. `asyncio.create_subprocess_shell`

- **用途**：`create_subprocess_shell`通过 shell 来执行一个命令，这允许执行复杂的
  shell 命令，包括内置的 shell 命令或者多个命令的组合（使用管道、重定向等 shell
  特性）。

- **参数**：这个函数接收一个字符串，这个字符串包含了要在 shell 中执行的完整命令。
  例如，`create_subprocess_shell('ls -l | grep "June"')`在 shell 中执行命令，并
  利用管道。

- **特点**：适合需要执行复杂 shell 命令的场景，特别是那些需要 shell 解释或扩展的
  情况。但是，使用这种方式可能会带来更大的安全风险，因为可能会受到 shell 注入攻
  击。

### 示例代码

下面是两个简单的示例，展示如何使用这两个函数：

```python
import asyncio

async def run_exec():
    process = await asyncio.create_subprocess_exec(
        'ls', '-l', '/usr',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()
    print('Exec Output:', stdout.decode())

async def run_shell():
    process = await asyncio.create_subprocess_shell(
        'ls -l /usr | grep bin',
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await process.communicate()
    print('Shell Output:', stdout.decode())

async def main():
    await asyncio.gather(run_exec(), run_shell())

asyncio.run(main())
```

### 总结

选择`create_subprocess_exec`或`create_subprocess_shell`主要取决于具体需求。如果
你需要执行简单的命令并且想要避免 shell 的潜在风险，那么
`create_subprocess_exec`是更好的选择。相反，如果你需要执行复杂的命令，或者利用
shell 的特性（如管道、文件重定向等），那么`create_subprocess_shell`可能更适合。
在使用这些函数时，应该特别注意避免任何可能导致安全漏洞的代码实践，特别是在处理用
户输入时。
