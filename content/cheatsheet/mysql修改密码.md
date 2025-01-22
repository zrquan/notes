---
title: "MySQL修改密码"
author: ["4shen0ne"]
draft: false
---

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'new_password';
```
