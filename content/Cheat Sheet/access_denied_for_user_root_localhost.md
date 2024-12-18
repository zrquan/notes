---
title: "Access denied for user 'root'@'localhost'"
author: ["4shen0ne"]
tags: ["mysql"]
draft: false
---

1.  /etc/init.d/mysql stop
2.  mysqld_safe --user=mysql --skip-grant-tables --skip-networking &amp;
3.  mysql -u root
4.  mysql&gt; flush privileges;
5.  mysql&gt; ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
6.  mysql&gt; quit;
7.  /etc/init.d/mysql restart
8.  mysql -u root -p  # newpassword
