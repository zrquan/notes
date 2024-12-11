---
title: "IIS 短文件名"
author: ["4shen0ne"]
draft: false
---

为了兼容 ms-dos，对于一些长文件（或文件夹）名，windows 会以 win_8.3 格式生成对应
的短文件名。格式为

```text
{长文件名的前 6 个字符} + {～} + {1 到 9 其中一位} + {.} + {后缀前 3 位}
```

配合通配符 `*` 构造出存在的短文件名则返回“404”，不存在的短文件名则返回“400”。
据此可以猜测后台地址，下载备份文件、sql 文件，还可以执行 dos 攻击。

扫描工具：<https://github.com/irsdl/IIS-ShortName-Scanner>


## 修复方案 {#修复方案}

-   禁止 url 中使用 `~` 或它的 Unicode 编码
-   关闭 windows 的 8.3 格式功能
-   修改注册列表

    ```text
    HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\NtfsDisable8dot3NameCreation
    ```

    的值为 1，再重启机器（此修改只能禁止 NTFS8.3 格式文件名创建，已经存在的短文件名
    无法移除）
-   如果 web 环境不需要 asp.net 的支持则可以进入 `IIS 管理器 -> Web 服务扩展 ->
      ASP.NET` , 选择禁止此功能
-   升级 net framework 至 4.0 以上版本
-   将 web 文件夹的内容拷贝到另一个位置，如 E:\www 到 E:\www.back，然后删除原文件
    夹 E:\www，再重命名 E:\www.back 到 E:\www（如果不重新复制，则已存在的短文件名
    不会消失）
