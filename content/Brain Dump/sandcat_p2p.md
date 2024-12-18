---
title: "sandcat p2p"
author: ["4shen0ne"]
draft: false
---

1.  agent 尝试使用指定的 C2 协议（比如 HTTP）连接服务器，如果不成功就启用 p2p 代
    理
2.  agent 如果能够直接和服务器通信，并接收到 Beacon，则使用指定的 C2 协议通信。但
    如果连续错过了 3 个 Beacon 就自动切换到 p2p 代理模式


## agent 使用 p2p 代理的过程 {#agent-使用-p2p-代理的过程}

1.  轮询所有代理接收者（agent），确认是否支持它所指定的通信协议
2.  如果找到适合的代理接收者，当前 agent 就会将服务器的地址和协议改为代理接收者的
    地址和协议，后续直接把代理 agent 当作服务器来通信
    ```text
       For example, if an agent cannot successfully make HTTP requests to the C2
       server at http://10.1.1.1:8080, but it knows that another agent is proxying
       peer communications through an SMB pipe path available at
       \\WORKSTATION\pipe\proxypipe, then the agent will check if it supports SMB
       Pipe peer-to-peer proxy capabilities. If so (i.e. if the associated gocat
       extension was included in the Sandcat binary), then the agent will change its
       server to \\WORKSTATION\pipe\proxypipe and its C2 protocol to SmbPipe.
    ```
