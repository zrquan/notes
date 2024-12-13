---
title: "Linux 特殊权限"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:30+08:00
tags: ["linux"]
draft: false
---

## SUID {#suid}

Set UID 特殊权限。拥有该权限的文件，其所有者的 `x` 替换成 `s` ，例如 `-rwsr-xr-x` 。

-   SUID 权限仅对二进制程序有效；
-   执行者对于该程序需要具有可执行权限；
-   仅在执行该程序的过程中有效；
-   执行者将具有程序所有者的权限。


## SGID {#sgid}

Set GID 特殊权限。拥有该权限的文件，其用户组的 `x` 替换成 `s` ，例如 `-rwxr-sr-x` 。

-   SGID 对二进制程序有效；
-   程序执行者需对该程序具备执行权限；
-   执行者在执行过程中会获得该程序用户组的支持。

SGID 权限也可作用于目录（SUID 不行），作用如下：

-   用户若对此目录具有 `r` 和 `x` 权限，该用户能够进入该目录；
-   用户在此目录下的有效用户组将变成该目录的用户组；
-   若用户在此目录下拥有 `w` 权限，则用户所创建的新文件的用户组与该目录的用户组相同。


## SBIT {#sbit}

Sticky Bit 权限，仅对目录有效。当使用者在该目录下建立文件或目录时（有权限的情况
下），仅自己与 root 才有权力删除。

/tmp 目录就拥有 SBIT 权限：
`drwxrwxrwt  13 root root  4096 Jul 26 15:21 tmp`


## 设置方法 {#设置方法}


### 符号类型 {#符号类型}

```bash
chmod u+s filename	# 设置 SUID
chmod g+s filename	# 设置 SGID
chmod o+t dirname   # 设置 SBIT
```


### 数字类型 {#数字类型}

在首位增加一个八进制数代表特殊权限， `4/2/1` 分别对应 `SUID/SGID/SBIT` 。

```bash
chmod 4755 filename	# 设置 SUID
chmod 6755 filename	# 设置 SUID 和 SGID
```

`s` 和 `t` 是替代 `x` 权限的，如果文件或目录本身没有 `x` 权限，则修改后显示为大写 `S` 或 `T` 。
