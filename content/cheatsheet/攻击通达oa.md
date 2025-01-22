---
title: "攻击通达 OA"
author: ["4shen0ne"]
draft: false
---

## 目录&amp;文件 {#目录-and-文件}

| attach  | OA 附件文件存放目录                |
|---------|----------------------------|
| bin     | Apache、PHP、Zend 等主程序及配置文件, 服务配置程序等 |
| data5   | MySQL 数据库文件目录               |
| logs    | Apache 等日志文件目录              |
| MyAdmin | 通达 OA 的 MySQL 管理工具          |
| mysql5  | MySQL 主程序文件                   |
| nginx   | Nginx Web 应用服务                 |
| tmp     | 临时文件目录                       |
| webroot | 通达 OA 的 WEB 根目录（PHP 程序目录） |

以下文件可以判断通达 OA 的版本:

1.  /inc/expired.php
2.  /inc/reg_trial.php
3.  /inc/reg_trial_submit.php


## 任意文件删除 {#任意文件删除}

version = v11.6

相关代码:

```nil
# /module/appbuilder/assets/print.php

<?php

$s_tmp = __DIR__ . "/../../../../logs/appbuilder/logs";
$s_tmp .= "/" . $_GET["guid"];

if (file_exists($s_tmp)) {
    $arr_data = unserialize(file_get_contents($s_tmp));
    unlink($s_tmp);
    $s_user = $arr_data["user"];
}
else {
    echo "未知参数";
    exit();
}
```

变量 `$s_tmp` 拼接了用户可控的 guid, 而 `__DIR__` 指向当前执行的 PHP 文件所在的目录

1.  如果 web 根目录为 `C:\wwwroot\webroot\`
2.  则 `__DIR__` 为 `C:\wwwroot\webroot\module\appbuilder\assets`
3.  拼接后的 $s_tmp 为

    ```text
    C:\wwwroot\webroot\module\appbuilder\assets/../../../../logs/appbuilder/logs
    ```

如果想删除 /module/appbuilder/assets 目录下的 test.txt 文件

```text
?guid=../../../webroot/module/appbuilder/assets/test.txt
```


## 任意用户文件上传 {#任意用户文件上传}

1.  需要后台权限
2.  version &lt; v11.7

<!--listend-->

```nil
# /general/data_center/utils/upload.php

if ($action == "upload") {
    if ($filetype == "xls") {
            code
        }
    }
    else if ($filetype == "img") {
            code
    }
    else {
        code
    }

    @unlink($_FILES["FILE1"]);
}
```

当我们设置 `$action` 为 upload, `$filetype` 不为 xls 和 img 时, 程序来到了 else{}代码块

```nil
$uploaddir = MYOA_ATTACH_PATH . "/data_center/attachment/";
```

在 else{}代码块中, 首先定义了 `$uploaddir` 变量用来存放上传目录路径

```nil
if (!is_dir(MYOA_ATTACH_PATH . "/data_center/attachment")) {
    if (!is_dir(MYOA_ATTACH_PATH . "/data_center")) {
        mkdir(MYOA_ATTACH_PATH . "/data_center");
    }

    mkdir(MYOA_ATTACH_PATH . "/data_center/attachment");
}
```

然后检查了上传目录文件夹是否存在, 不存在就创建

```nil
if (isset($from_rep)) {
    code
}
else {
    $s_n = $_FILES["FILE1"]["name"];

    if ($s_n[0] != "{") {
        $s_n = $repkid . "_" . $s_n;
    }

    if (move_uploaded_file($_FILES["FILE1"]["tmp_name"], $uploaddir . $s_n)) {
    }
}
```

接着检查变量 `$from_rep` 是否设置, 这里我们不传入变量 `$from_rep`, 让程序执行逻辑进
入 else{}代码块, `$s_n` 变量存放了传入的文件名, 然后判断了文件名第一位是否为字符串
{, 不是就将传入的变量 `$repkid` 与文件名进行拼接。最后将其带入到
`move_uploaded_file` 函数中移动到指定位置。
