---
title: "MySQL UDF提权"
author: ["4shen0ne"]
lastmod: 2024-12-14T17:39:33+08:00
draft: false
---

UDF（user defined function）⽤户⾃定义函数，是 mysql 的⼀个拓展接⼝。⽤户可以通
过⾃定义函数实现在 mysql 中⽆法⽅便实现的功能，其添加的新函数都可以在 sql 语句中调
⽤，就像调⽤本机函数⼀样。

而又因为数据库通常需要运行在高权限，那么通过 UDF 执行自定义函数时，该函数会执行
在数据库进程所拥有的高权限上下文，达到提权的目的

添加 UDF 函数需要让数据库加载库文件——dll 或者 so，并符合以下条件：

1.  secure_file_priv 项设置为空，如果设置为 NULL 或者 /tmp 目录等，我们则无法指定
    UDF 文件导出位置，无法利用
2.  CREATE 权限、FILE 权限
3.  根据版本确定导出路径：
    -   mysql &lt; 5.0: 随意
    -   5.0 &lt;= Mysql &lt; 5.1: Win2000 导出到 `C:/Winnt/udf.dll` ，其他 Windows 版本导出到
        `C:/Windows/udf.dll或C:/Windows/system32/udf.dll`
    -   Mysql &gt;= 5.1: Mysql 安装目录的 lib\plugin 文件夹下，如果 mysql 安装时不选择完整
        安装或使用集成开发环境等情况下 lib\plugin 目录大概率是不存在的，需要自行创建。
