---
title: "NFS服务"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:37+08:00
draft: false
---

## 简介 {#简介}

Network File System 的功能是通过 TCP/IP 网络在不同的主机、操作系统间共享资源。
NFS 服务器可以指定本地目录进行共享，NFS 客户端将服务器的共享目录挂载到自己的 PC
上，然后可以像本地磁盘一样进行访问。

NFS 支持的功能非常多，不同的功能都对应着不同的程序和端口。由于 NFS 服务器的监听
端口不固定，客户端访问服务时需要先通过 RPC 服务（固定为 111 端口）找到正确的端口，
然后才能直接和 NFS 服务器建立连接。


### RPC {#rpc}

远程过程调用（Remote Procedure Call）是一种通信协议，该协议允许运行于一台计算机
的程序调用另一个地址空间（通常为一个开放网络的一台计算机）的子程序。


### NFSv4 {#nfsv4}

NFSv4 的一大优势是 **仅使用 2049 端口** 来运行服务，从而简化了跨防火墙使用协议的过程。
也就意为着，NFSv4 可以不再需要 rpcbind(portmap)。


## RPC 如何管理 NFS 端口 {#rpc-如何管理-nfs-端口}

1.  首先开启 RPC 服务，监听 111 端口；
2.  NFS 启动后，向 RPC 注册需要使用的端口，RPC 会记录相关信息；
3.  客户端首先访问 RPC 服务（111 端口），RPC 返回记录的端口信息；
4.  客户端找到目标端口后建立连接，进行数据传输。


## 相关命令 {#相关命令}


### showmount {#showmount}

查询 NFS 服务器相关信息

```bash
showmount 192.168.1.2 # 显示该服务器的连接信息
showmount -e # 显示目录列表
showmount -d # 显示被挂载的共享目录
showmount -a # 显示客户端信息和共享目录
```


### mount {#mount}

1.  安装 nfs-utils
2.  建立挂载点（mkdir）
3.  挂载共享目录： `mount -t nfs 192.168.1.2:/target_path /local_path`

指定 NFS 服务版本： `-o vers=3`
