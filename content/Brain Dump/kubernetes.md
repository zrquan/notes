---
title: "Kubernetes"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:30+08:00
tags: ["cloud"]
draft: false
---

Kubernetes 也称为 k8s，提供容器的编排和管理功能，以便开发者在可以大规模部署容器。
借助 Kubernetes 编排功能，开发者可以构建跨多个容器的应用服务、跨集群调度、扩展这
些容器，并长期持续监视、管理这些容器的健康状况

k8s 的作用如下：

1.  跨多台物理主机进行容器编排。
2.  更加充分地利用硬件，最大程度获取运行企业应用所需的资源。
3.  有效管控应用部署和更新，并实现自动化操作。
4.  挂载和增加存储，用于运行有状态的应用。
5.  快速、按需扩展容器化应用及其资源。
6.  对服务进行声明式管理，保证所部署的应用始终按照部署的方式运行。
7.  利用自动布局、自动重启、自动复制以及自动扩展功能，对应用实施状况检查和自我修复。

{{< figure src="/ox-hugo/2021-11-21_14-03-01_screenshot.png" caption="<span class=\"figure-number\">Figure 1: </span>核心组件图" >}}

安全风险：

1.  kube-apiserver 未授权访问
2.  etcd 未授权
3.  Kublet API 未授权
4.  Docker Engine 未授权访问 Rest API
5.  Token 泄露
6.  10255/pods

<div class="table-caption">
  <span class="table-number">Table 1:</span>
  相关端口
</div>

| 端口      | 标识           | 描述                                |
|---------|--------------|-----------------------------------|
| 4149      | kubelet        | 用于查询容器监控指标的 cAdvisor 端口 |
| 10250     | kubelet        | 访问节点的 API 端口                 |
| 10255     | kubelet        | 未认证的只读端口，允许访问节点状态  |
| 10256     | kube-proxy     | kube-proxy 的健康检查服务端口       |
| 9099      | calico-felix   | calico 的健康检查服务端口（如果使用 calico/canal） |
| 6443/8080 | kube-apiserver | kube-apiserver 接口                 |
| 2379      | etcd           | etcd 数据库                         |
| 2375      | Docker Engine  | 容器远程访问接口                    |
