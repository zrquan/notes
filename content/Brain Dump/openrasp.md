---
title: "OpenRASP"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:39+08:00
draft: false
---

-   CustomClassTransformer: 字节码转换器，调用 hook 类进行插桩
-   使用 javassist 库插桩，将 XxxHook 类中的 checkXxx 静态方法插入到目标方法中
-   请求线程检测入口：HookHandler#doCheck
-   当去 hook 像 java.io.File 这样由 BootstrapClassLoader 加载的类的时候，无法从该
    类调用非 BootstrapClassLoader 加载的类中的接口，所以 agent.jar 会先将自己添加
    到 BootstrapClassLoader 的 ClassPath 下
-   给 openrasp.yml 和 js 插件目录以及 assets 目录增加文件监控，以便文件内容更改的
    时候不需要重启就能够实时生效 (FileScanListener)
-   基线检测使用 java 插件，不需要再请求线程中执行；攻击检测多数使用 js 插件，要求
    在请求线程中执行
-   detectors 用于收集服务器信息，然后分派给对应的 checker 进行基线检测

{{< figure src="/ox-hugo/_20220616_144055startup.png" >}}

plugin: 查找 str1 和 str2 的最长公共子串，返回为所有最长子串组成的数组

```js
function lcs_search(str1, str2){
    var len1 = str1.length;
    var len2 = str2.length;
    var dp_arr = [[],[]]
    var pre = 1
    var now = 0
    var result =0
    var result_pos = []

    for (var i = 0; i <= len2+1; i ++) {
        dp_arr[0][i] = 0
        dp_arr[1][i] = 0
    }
    for (var i = 0; i <= len1; i ++) {
        for (var j = 0; j <= len2; j ++) {
            if ( i == 0 || j == 0 ){
                dp_arr[now][j] = 0
            }
            else if ( str1[i-1] == str2[j-1] ) {
                dp_arr[now][j] = dp_arr[pre][j-1] + 1
                if (dp_arr[now][j] > result){
                    result = dp_arr[now][j]
                    result_pos = [i - result]
                }else if (dp_arr[now][j] == result){
                    result_pos.push( i - result )
                }
            }
            else {
                dp_arr[now][j] = 0
            }
        }
        if( now == 0 ){
            now = 1
            pre = 0
        }
        else {
            now = 0
            pre = 1
        }
    }
    var result_pos_set = new Set(result_pos)
    var result_str = new Set()
    for (var item of result_pos_set) {
        result_str.add(str1.substr(item, result))
    }
    return Array.from(result_str)
}
```

-   当 iast.js 下发成功，Java/PHP 内部的探针会自动在请求结束时，将本次请求的参数、
    hook 点信息提交给 openrasp-iast 服务器进行分析，并选择性的 Fuzz 目标
