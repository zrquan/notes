---
title: "CodeQL"
author: ["4shen0ne"]
draft: false
---

CodeQL 是由 Semmle（2019 年被 GitHub 收购）开发的一款功能强大的静态代码分析工具，基于牛津大学一个团队十多年的研究。CodeQL 使用[数据流分析]({{< relref "数据流分析.md" >}})和[污点分析]({{< relref "污点分析.md" >}})来查找代码错误、检查代码质量并识别漏洞。目前支持的语言包括 C/C++、C#、 Go 、Java、 Kotlin 、JavaScript、 Python 、Ruby、TypeScript 和 Swift。

{{< figure src="/ox-hugo/_20250121_101905screenshot.png" >}}


## 环境部署-以 Java 为例 {#环境部署-以-java-为例}

1.  安装 codeql cli

    ```text
    yay -S codeql
    ```
2.  准备一个测试项目，我用的是 [VulnerableApp](https://github.com/SasanLabs/VulnerableApp)
3.  在项目的根目录下，构建 codeql 数据库
    ```shell
       cd VulnerableApp
       codeql database create vulnerable-app --language=java
    ```
4.  将数据库目录导入 vscode-codeql-ext 即可


## 等于号表示「比较」而非「赋值」 {#等于号表示-比较-而非-赋值}

在 CodeQL 中：

-   = 操作符用于表达式之间的等价性比较。
-   **变量绑定是通过查询结构和谓词来实现的** ，并不涉及传统的赋值操作。

`c.getFunc() = name` 和 `name = c.getFunc()` 是一样的


## 变体分析 {#变体分析}

通过对 source 和 sink 进行建模（我理解为抽象出通用的特性），来分析某个已知问题（比如漏洞）的其他变体。
