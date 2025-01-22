---
title: "Linux巡检和加固手册"
author: ["4shen0ne"]
draft: false
---

## 查看计划任务 {#查看计划任务}

使用 crontab 命令查看常用参数：
-u 指定一个用户
-l 列出某个用户的任务计划
-r 删除某个用户的任务
-e 编辑某个用户的任务（编辑的是/var/spool/cron 下对应用户的 cron 文件，也可以直接修改/etc/crontab 文件）

```shell
crontab -l
cat /etc/crontab
ls -al /etc/cron.d
```


## 查看进程 {#查看进程}

```text
ps -ef
```

清除进程

```text
kill -9 "进程 PID"
```


## 查看启动项 {#查看启动项}

命令：ls -alt /etc/init.d
命令：cat /etc/rc.d/rc.local

4、查看异常用户命令：awk -F: '$3==0 {print $1}' /etc/passwd

5、查看历史命令
cat ~/.bash_history

6、查看登录日志命令：last
命令：lastb
命令：lastlog

Linux 加固（以 Centos7 为例）
7、用户密码策略设置命令：	cp /etc/login.defs /etc/login.defs.bak     //备份配置文件
	vi /etc/login.defs
按字母 i，修改目标项目为：
PASS_MAX_DAYS    90
PASS_MIN_DAYS    1
PASS_MIN_LEN     8
PASS_WARN_AGE    7

完成后按 ESC 键，按 shift+:  ， 输入 wq!
由于系统是从/etc/shadow 文件读取的参数，所以需要相应修改里面的内容修改 root 用户，编辑 shadow 文件：命令：vi /etc/shadow

将可登录用户的密码有效期修改。修改 0:99999:7:::替换为 1:90:7:::，表示密码最短使用 1 天，有效期 90 天。

8、创建普通用户使用 useradd 创建普通用户：命令：useradd Qualweb01
passwd Qualweb01

9、密码规则验证配置限制密码复杂度命令：cp /etc/pam.d/system-auth /etc/pam.d/system-auth.bak

更改 password 部分将以下部分替换或修改：命令：	vi /etc/pam.d/system-auth
	按字母 i，修改 password 目标项目为：
password    requisite     pam_cracklib.so retry=3 minlen=8 ucredit=-1 lcredit=-1 dcredit=-1 ocredit=-1
password    sufficient    pam_unix.so sha512 shadow nullok try_first_pass use_authtok remember=3
password    required      pam_deny.so

完成后按 ESC 键，按 shift+:  ， 输入 wq!
解释：验证密码时允许重试 3 次、最短密码位数 8、用户密码使用 sha512 方式加密、禁止使用最近用过的 3 个密码、密码必须至少包含一个大写字母一个小写字母一个数字一个标点符号等。

10、禁止 root 直接使用 ssh 远程登录首先备份 ssh 配置文件命令：cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

修改 ssh 服务配置文件不允许 root 用户远程登录，编辑/etc/ssh/sshd_config：

找到“#PermitRootLogin yes”去掉注释并修改为“PermitRootLogin no”。修改完成后重启 ssh 服务

命令：systemctl restart sshd.service   //重启 ssh 服务

11、配置连续登录失败锁定用户备份文件命令：cp /etc/pam.d/sshd /etc/pam.d/sshd.bak

设置当用户连续输入密码三次时，锁定该用户 30 分钟，修改配置文件/etc/pam.d/sshd, 在第一行下即#%PAM-1.0 的下面添加:
命令：vi /etc/pam.d/sshd
auth       required     pam_tally2.so deny=5 unlock_time=1800

12、配置登录用户超时功能命令：cp /etc/profile  /etc/profile.bak
vi /etc/profile
在文件中末尾加入配置:
TMOUT=180

解释：使登录系统的用户三分钟不操作系统时自动退出登录。

13、系统历史命令最大记录数配置在文件中加入配置:
找到 HISTSIZE
修改为：HISTSIZE=5

14、停止 Telnet 服务防止黑客通过 telnet 服务登录到服务器中，停止 xinted 服务：
service xineted stop
chkconfig --level 345 xinetd off

15、限制同时打开的文件数与进程数命令：	cp /etc/security/limits.conf /etc/security/limits.conf.bak
	vi /etc/security/limits.conf
在文件内容最下方加上如下代码段：


## soft    nofile   65535 {#soft-nofile-65535}


## hard    nofile   65535 {#hard-nofile-65535}


## soft    nproc    65535 {#soft-nproc-65535}


## hard    nproc    65535 {#hard-nproc-65535}

完成后按 ESC 键，按 shift+:  ， 输入 wq!
命令：ulimit -n 65535 &amp;&amp;ulimit -u 65535 &amp;&amp; ulimit -a
命令：ulimit -a	//查看是否生效

解释： 该代码前两行意为每个用户打开文件数限制为 65535 个。后两行意为每个用户打开进程数限制为 65535 个。

16、限制最大可登录终端数命令：vi /etc/security/limits.conf
在文件内容最下方加上如下代码段：用户名    -    maxlogins    5
完成后按 ESC 键，按shift+:  ， 输入wq!
