---
title: "DLL注入"
author: ["4shen0ne"]
draft: false
---

## 简介 {#简介}

DLL 注入可以在某个进程的上下文中执行任意代码, 如果该进程是通过高权限运行的, 则会
导致权限提升

具体步骤:

1.  将恶意的 DLL 文件保存到磁盘中
2.  `CreateRemoteThread` (Windows API 函数)调用 `LoadLibrary`
3.  The reflective loader function will try to find the Process Environment Block
    (PEB) of the target process using the appropriate CPU register and from that
    will try to find the address in memory of kernel32dll and any other required
    libraries.
4.  查找需要的 API 函数在内存中的地址, 比如: LoadLibraryA, GetProcAddress, 和
    VirtualAlloc
5.  上述函数将恶意 DLL 加载到内存, 调用其入口点 `DllMain`


## 示例 {#示例}

1.  构造恶意 DLL 文件

{{< figure src="/ox-hugo/2020-12-30_23-35-55_2020-12-08_14-20-02_Snipaste_2020-12-08_14-19-41.png" >}}

1.  使用 [Remote DLL Injector](http:securityxploded.com/remote-dll-injector.php) 注入 DLL 文件到进程中

{{< figure src="/ox-hugo/2020-12-30_23-36-14_2020-12-08_16-36-20_remotedllinjector-dll-injection.png" >}}

1.  监听 listener

{{< figure src="/ox-hugo/2020-12-30_23-36-33_2020-12-08_16-37-21_privilege-escalation-dll-injection.png" >}}
