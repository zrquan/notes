---
title: "Go流水线模型"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:13+08:00
tags: ["go"]
draft: false
---

在 Golang 中，流水线由多个阶段组成，每个阶段之间通过 channel 连接，每个节点可以由多
个同时运行的 goroutine 组成。

从最简单的流水线入手。下图的流水线由 3 个阶段组成，分别是 A、B、C，A 和 B 之间是通道
aCh，B 和 C 之间是通道 bCh，A 生成数据传递给 B，B 生成数据传递给 C。

流水线中，第一个阶段的协程是生产者，它们只生产数据。最后一个阶段的协程是消费者，
它们只消费数据。下图中 A 是生成者，C是消费者，而 B 只是中间过程的处理者。

{{< figure src=".images/_20240307_102510view.webp" >}}

例子：计算一个整数切片中元素的平方值并把它打印出来

```go
package main

import (
    "fmt"
)

func producer(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            out <- n
        }
    }()
    return out
}

func square(inCh <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range inCh {
            out <- n * n
        }
    }()

    return out
}

func main() {
    in := producer(1, 2, 3, 4)
    ch := square(in)

    // consumer
    for ret := range ch {
        fmt.Printf("%3d", ret)
    }
    fmt.Println()
}
```

-   producer()：负责生产数据，它会把数据写入通道，并把它写数据的通道返回
-   square()：负责从某个通道读数字，然后计算平方，将结果写入通道，并把它的输出通道
    返回
-   main()：负责启动 producer 和 square，并且还是消费者，读取 suqre 的结果，并打印出来
