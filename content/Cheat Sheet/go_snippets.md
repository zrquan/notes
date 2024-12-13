---
title: "Go snippets"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:12+08:00
tags: ["go"]
draft: false
---

## 利用 defer 计算 goroutine 的执行时间 {#利用-defer-计算-goroutine-的执行时间}

from `projectdiscovery/katana`

```go
go func() {
    defer func(startTime time.Time) {
        timeTaken = time.Since(startTime)
        close(results)
    }(time.Now()) // time.Now() 在 defer 函数定义时就执行

    ctx := context.Background()
    wg := &sync.WaitGroup{}
    for _, s := range c.sources {
        wg.Add(1)
        go func(source source.Source) {
            for result := range source.Run(ctx, c.Shared, rootURL) {
                results <- result
            }
            wg.Done()
        }(s)
    }
    wg.Wait()
}()
```


## 监听 Ctrl-C（SIGINT）进行处理 {#监听-ctrl-c-sigint-进行处理}

```go
// close handler
resumeFilename := defaultResumeFilename()
go func() {
    c := make(chan os.Signal, 1)
    signal.Notify(c, os.Interrupt, syscall.SIGTERM)
    for range c {
        gologger.DefaultLogger.Info().Msg("- Ctrl+C pressed in Terminal")
        katanaRunner.Close()

        gologger.Info().Msgf("Creating resume file: %s\n", resumeFilename)
        err := katanaRunner.SaveState(resumeFilename)
        if err != nil {
            gologger.Error().Msgf("Couldn't create resume file: %s\n", err)
        }

        os.Exit(0)
    }
}()
```
