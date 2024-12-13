---
title: "GraphQL"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:13+08:00
draft: false
---

GraphQL 是一个用于 API 的查询语言，是一个使用基于类型系统来执行查询的服务端运行
时（类型系统由你的数据定义）。GraphQL 并没有和任何特定数据库或者存储引擎绑定，而
是依靠你现有的代码和数据支撑。

一个 GraphQL 服务是通过定义类型和类型上的字段来创建的，然后给每个类型上的每个字
段提供解析函数。例如，一个 GraphQL 服务告诉我们当前登录用户是 me，这个用户的名称
可能像这样：

```graphql
type Query {
  me: User
}

type User {
  id: ID
  name: String
}
```

一并的还有每个类型上字段的解析函数：

```graphql
function Query_me(request) {
  return request.auth.user;
}

function User_name(user) {
  return user.getName();
}
```

一旦一个 GraphQL 服务运行起来（通常在 web 服务的一个 URL 上），它就能接收
GraphQL 查询，并验证和执行。接收到的查询首先会被检查确保它只引用了已定义的类型和
字段，然后运行指定的解析函数来生成结果。

例如这个查询：

```graphql
{
  me {
    name
  }
}
```

会产生这样的 JSON 结果：

```graphql
{
  "me": {
    "name": "Luke Skywalker"
  }
}
```
