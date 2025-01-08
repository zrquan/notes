---
title: "Wireshark filters"
author: ["4shen0ne"]
draft: false
---

## 比较操作符 {#比较操作符}

```text
lt   <      # 小于
le   <=     # 小于等于
eq   ==     # 等于
gt   >      # 大于
ge   >=     # 大于等于
ne   !=     # 不等
```


## 逻辑操作符 {#逻辑操作符}

```text
and  &&     # 两个条件同时满足
or   ||     # 其中一个条件被满足
xor  ^^     # 有且仅有一个条件被满足
not  !      # 没有条件被满足
[n] [...]   # 过滤特定的单词或文字
```


## 常用 {#常用}

```text
http.request.method == "POST"       # POST 请求
tcp contains "http"                 # 显示 payload 中包括"http"字符串的 tcp 封包.
http contains "flag"
http.request.uri contains "online"  # 显示请求的 uri 包括"online"的 http 封包.
ip.addr == 1.1.1.1                  # IP 为 1.1.1.1 的流量

Ctrl+Alt+Shift+T,切换跟踪 tcp 流
```


## IP {#ip}

```text
ip.src eq 192.168.1.254 or ip.dst eq 192.168.1.254
```

or

```text
ip.addr eq 192.168.1.254            # 都能显示来源 IP 和目标 IP
```


## HTTP {#http}

```text
http.request.method == "GET"
http.request.method == "POST"
http.request.uri == "/img/logo-edu.gif"
http contains "GET"
http contains "HTTP/1."

# GET包
http.request.method == "GET" && http contains "Host: "
http.request.method == "GET" && http contains "User-Agent: "
# POST包
http.request.method == "POST" && http contains "Host: "
http.request.method == "POST" && http contains "User-Agent: "
# 响应包
http contains "HTTP/1.1 200 OK" && http contains "Content-Type: "
http contains "HTTP/1.0 200 OK" && http contains "Content-Type: "
```


## 端口 {#端口}

```text
tcp.port eq 80                      # 不管端口是来源的还是目标的都显示
tcp.port == 80
tcp.port eq 2722
tcp.port eq 80 or udp.port eq 80
tcp.dstport == 80                   # 只显 tcp 协议的目标端口 80
tcp.srcport == 80                   # 只显 tcp 协议的来源端口 80
udp.srcport == 80                   # 筛选udp协议的源端口为80的流量包
udp.port eq 15000
```

```text
tcp.port >= 1 and tcp.port <= 80    # 过滤端口范围
```


## 包内容过滤 {#包内容过滤}

```text
tcp[20]                     # 表示从 20 开始，取 1 个字符
tcp[20:]                    # 表示从 20 开始，取 1 个字符以上
tcp[20:8]                   # 表示从 20 开始，取 8 个字符
```

```text
udp[8:1]==32
udp[8:3]==81:60:03          # 偏移 8 个 bytes,再取 3 个数，是否与 == 后面的数据相等
eth.addr[0:3]==00:06:5B
```

matches(匹配)和 contains(包含某字符串)语法

```text
ip.src==192.168.1.107 and udp[8:5] matches "\\x02\\x12\\x21\\x00\\x22″
ip.src==192.168.1.107 and udp contains 02:12:21:00:22
ip.src==192.168.1.107 and tcp contains "GET"
udp contains 7c:7c:7d:7d    # 匹配 payload 中含有 0x7c7c7d7d 的 UDP 数据包，不一定是从第一字节匹配
```


## 包长度过滤 {#包长度过滤}

```text
udp.length == 26                # 这个长度是指 udp 本身固定长度8加上 udp 下面那块数据包之和
tcp.len >= 7                    # 指的是 ip 数据包(tcp 下面那块数据),不包括 tcp 本身
ip.len == 94                    # 除了以太网头固定长度 14,其它都算是 ip.len,即从 ip 本身到最后
frame.len == 119                # 整个数据包长度,从 eth 开始到最后
```


## 协议 {#协议}

```text
tcp
udp
arp
icmp
http
smtp
ftp
dns
msnms
ip
ssl
oicq
bootp
```

排除 arp 包，如 !arp 或者 not arp


## MAC {#mac}

```text
eth.dst == A0:00:00:04:C5:84    # 过滤目标 mac
eth.src eq A0:00:00:04:C5:84    # 过滤来源 mac
eth.dst==A0:00:00:04:C5:84
eth.dst==A0-00-00-04-C5-84
eth.addr eq A0:00:00:04:C5:84   # 过滤来源 MAC 和目标 MAC 都等于 A0:00:00:04:C5:84 的
```


## TCP Flags {#tcp-flags}

```text
tcp.flags                   # 显示包含 TCP 标志的封包。
tcp.flags.syn == 0x02       # 显示包含 TCP SYN 标志的封包。
tcp.flags.reset == 1        # 过滤 TCP RST 包。先找到 RST 包，然后右键 Follow -> TCP Stream 是常用的排障方式
tcp.window_size == 0 && tcp.flags.reset != 1
tcp.analysis.retransmission # 过滤所有的重传包
```
