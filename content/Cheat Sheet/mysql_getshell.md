---
title: "mysql getshell"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:15+08:00
draft: false
---

## INTO OUTFILE {#into-outfile}

查看 FILE 权限：

1.  select file_priv from mysql.user where user=user()  #(MYSQL4/5)
2.  select grantee,is_grantable from information_schema.user_privileges where privilege_type='file' and grantee=user()
