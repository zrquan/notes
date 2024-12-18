---
title: "WMI"
author: ["4shen0ne"]
draft: false
---

WMI 全称 Windows Management Instrumentation，即 Windows 管理工具，用户可以通过 WMI
脚本或者其 API 来管理本地或远程计算机上的资源，而不需要直接使用 Windows API。

{{< figure src="/ox-hugo/2020-12-31_22-54-58_2020-09-24_00-57-50_wmi-architecture.png" >}}

-   WMI consumers -- WMI 的使用者，比如各种应用程序或脚本

    C/C++ 程序可以通过 COM 技术直接使用 WMI 接口，脚本语言则需要支持 WMI Scripting
    API，.NET 平台的语言则使用 `System.Management` 域的相关功能与下层进行通信。
    Consumers 可以查询、枚举数据，可以调用 provider 提供的方法，还可以向 WMI 订阅
    消息，这些数据操作都需要由相应的 provider 来提供。

-   WMI infrastructure -- WMI 基础结构是 Windows 的系统组件，包含 `WMI service` 和
    `WMI repository` 两个模块

    Repository 是通过 WMI 命名空间构成的，在系统启动时 WMI 服务会创建一些命名空间
    （root/default、root/cimv2、root/subscription 等），同时在命名空间中定义 WMI
    类，而其他命名空间在系统或应用调用相关 provider 时创建。 **WMI repository 用于存
    储 WMI 的静态数据，使用者优先从 repository 获取有效信息。**

    Service 的作用是协调 consumers、providers、repository 之间的通信，它一般通过一
    个共享服务进程 `SVCHOST` 来工作。当第一个 consumer 向 WMI namespace 发起连接时，
    WMI 服务就会启动，consumer 不再调用 WMI 时就会关闭或者进入低内存状态。当一个应
    用通过 COM 接口向 WMI 发出请求，WMI 将判断它需要静态数据还是动态数据，如果是静
    态数据就直接在 repository 查找，如果是动态数据就将请求交给 WMI service 中注册
    的相应的 providers，providers 找到数据后返回给 service，再返回给发出请求的应用。

-   WMI providers and managed objects -- 托管对象是一个逻辑或物理组件，比如硬盘驱
    动、网络适配器、数据库、操作系统、进程或服务等。而 providers 是一个 COM 接口，
    负责监控一个或多个托管对象，WMI service 和托管对象之间的数据传输都要经过 WMI
    providers

    从文件角度讲，WMI providers 由一个 DLL 和 mof(Managed Object Format) 文件组成。
    DLL 实现逻辑功能，mof 文件存储描述数据和 WMI 类。这两个文件都在
    `%Windir%\System32\Wbem` 目录下。
