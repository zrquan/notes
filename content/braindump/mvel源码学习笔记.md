---
title: "Mvel源码学习笔记"
author: ["4shen0ne"]
draft: false
---

## 解释执行 {#解释执行}

调用 MVEL#eval 对表达式进行解释执行，一般只用于临时处理或者交互式运行的情况下才会
使用。

过程中没有构建完整的抽象语法树结构，而是通过游标逐个字符地读取表达式，然后根据读
取到的操作字符来判断下一步的走向，提取词法记号(token)。多个 token 的混合计算通过
执行栈来完成，而对属性的访问则通过 PropertyAccessor 类来完成。


### MVELInterpretedRuntime {#mvelinterpretedruntime}

继承了 AbstractParser 类，负责“解释执行”时的表达式处理，主要逻辑在
parseAndExecuteInterpreted 方法中。

在实现上借鉴了父类 AbstractParser 的主要解析逻辑，不过不同词法记号的运算部分由当前
类负责，即父类完成词法记号的提取，当前类借助执行栈完成运算工作。

```java
  while ((tk = nextToken()) != null) { // 调用 AbstractParser#nextToken 提取词法记号
    ...
    // 当前执行栈为空，将数据入栈以便进行运算
    if (stk.isEmpty()) {
      if ((tk.fields & ASTNode.STACKLANG) != 0) {
        ...
      }
      else {
        stk.push(tk.getReducedValue(ctx, ctx, variableFactory));
      }

      /**
       * 如果当前 token 是一个子表达式，那么可能和后面的 token 一起处理以判断优先级顺序
       */
      if (tk instanceof Substatement && (tk = nextToken()) != null) {
        // 如果后面跟着的 token 是操作符，则再向后读取一个 token 一起进行处理
        if (isArithmeticOperator(operator = tk.getOperator())) {
          // 后续操作数和操作符入栈（后缀表达式）
          stk.push(nextToken().getReducedValue(ctx, ctx, variableFactory), operator);

          if (procBooleanOperator(arithmeticFunctionReduction(operator)) == -1)
            return stk.peek();
          else
            continue;
        }
      }
      else {
        continue;
      }
    }
    ...
    //当前变量工厂提前结束
    if (variableFactory.tiltFlag()) {
      return stk.pop();
    }

    // 处理操作符
    switch (procBooleanOperator(operator = tk.getOperator())) {
      case RETURN:
        variableFactory.setTiltFlag(true);
        return stk.pop();
      case OP_TERMINATE:
        return stk.peek();
      case OP_RESET_FRAME:
        continue;
      case OP_OVERFLOW:
        // 如果不是操作符，则认为当前存储的是一个类型信息，即类型声明
        if (!tk.isOperator()) {
          if (!(stk.peek() instanceof Class)) {
            ...
          }
          // 将类型信息加入变量工厂，以便进行后续操作
          variableFactory.createVariable(tk.getName(), null, (Class) stk.peek());
        }
        continue;
    }
  }
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  关键代码
</div>

以简单的四则运算为例：

```text
a=10; b=(a=a*2)+10; a;
```

从 AbstractParser#nextToken 开始进行词法分析，此时调用栈如下：

```nil
nextToken:265, AbstractParser (org.mvel2.compiler)
parseAndExecuteInterpreted:96, MVELInterpretedRuntime (org.mvel2)
parse:61, MVELInterpretedRuntime (org.mvel2)
eval:171, MVEL (org.mvel2)
```

进入主循环，先移动游标捕获标识符（字符串、数字、个别符号）。

{{< figure src="/ox-hugo/2021-08-02_17-03-08_screenshot.png" >}}

此时游标停在等于号的位置，标识符'a'被捕获（start 到 cursor），依次判断游标处的字符
决定后续处理。部分判断逻辑如下：

```java
  if (capture) {
    String t; // 当前操作符
    if (OPERATORS.containsKey(t = new String(expr, st, cursor - st)) && !Character.isDigit(expr[st])) {
      // 处理不同的关键字
      switch (OPERATORS.get(t)) {
        case NEW: ... // 类型声明或新建数组的逻辑处理
        case ASSERT: ... // 断言
        case RETURN: ...
        case IF: ...
        case ELSE: ...
        case FOREACH: ...
        ...
        ...
      }
    }
    if (cursor != end && expr[cursor] == '(') { // 处理方法调用，abc(1)
      ...
    }
    /**
     * 执行到这行表示捕获到变量名或变量值信息，根据后续的运算符进行处理
     */
    CaptureLoop:
    while (cursor != end) {
      switch (expr[cursor]) {
        case '.': // 定义为联级操作，比如多次属性访问
        case '?': // 安全属性访问（a.?b)或者三目运算符
        case '+': // 处理++、+=操作
        case '-': // 处理--、-=操作
        ...
        ...
        case '=': // 赋值或比较操作
        ...
      }
    }
    // 前面的逻辑中，根据各种情况进行处理并对游标进行了移动，现在根据游标位置构建词法节点的信息
    return createPropertyToken(st, cursor);
  }
  ...
```

首次循环得到 AssignmentNode 赋值节点(a=10)，获取节点对应的数据压入执行栈：

{{< figure src="/ox-hugo/2021-08-02_18-07-14_screenshot.png" >}}

不同的 AST 节点对 getReducedValue 方法的实现不同，赋值节点会在变量工厂中添加当前变量，
并解析右端的表达式来获取变量值。相当于递归调用 MVELInterpretedRuntime#parse 方法，
此时的调用栈如下：

```nil
nextToken:265, AbstractParser (org.mvel2.compiler)
parseAndExecuteInterpreted:96, MVELInterpretedRuntime (org.mvel2)
parse:61, MVELInterpretedRuntime (org.mvel2)
getReducedValue:135, AssignmentNode (org.mvel2.ast)
parseAndExecuteInterpreted:117, MVELInterpretedRuntime (org.mvel2)
parse:61, MVELInterpretedRuntime (org.mvel2)
```

获取通用节点 ASTNode 的数据后再次压栈，因为当前节点是文本节点，直接从 literal 属性中
获取常量值：

{{< figure src="/ox-hugo/2021-08-02_18-22-57_screenshot.png" >}}

后面匹配到分号表示语句结束，将栈中的常量弹出给上层递归并压入其执行栈，同时变量工
厂也保存了变量 a 的信息。

{{< figure src="/ox-hugo/2021-08-02_18-28-24_screenshot.png" >}}

继续分析 AbstractParser#nextToken，变量 b 的声明赋值和之前类似但右边的表达式以'('开
头，来到 `if(capture)` 的 else 分支。

```java
  if (capture) {
    ...
  }
  else {
    // 没有捕获字符串，进入操作符处理
    switch (expr[cursor]) {
      case '.': // 浮点数或者 with 语句(foo.{name='value'})
      case '@': // 引用拦截器
      ...
      ...
      case '(': {
        cursor++;
        // 用来判断是否为类型声明，即括号内是否全是定义字符
        boolean singleToken = true;
        skipWhitespace();
        for (brace = 1; cursor != end && brace != 0; cursor++) {
          switch (expr[cursor]) {
            // 逐字符判断，如果存在操作符就将 singleToken 设为 false
            ...
          }
        }
        //...
        if (singleToken) { /* 类型声明 */ }
        //...
        if (tmpStart != -1) {...}
        else {
          return handleUnion( // 处理联合操作，比如节点后面是.或者[
              handleSubstatement( // 如果子节点是纯字符串，尝试直接运算得到常量
                  new Substatement(expr, st = trimRight(st + 1),
                                   trimLeft(cursor - 1) - st, fields, pCtx)))
        }
      }
      ...
    }
  }
```

从上述代码可以看到，匹配到子表达式的括号后，移动游标并判断是否为类型声明的情况，
如果是普通的表达式就返回 Substatement 节点。回到 parseAndExecuteInterpreted 方法，
将 Substatement 节点压栈时又要对内容进行解析，即再递归一层，不过逻辑差不多就不继续
啰嗦了。跟进下面的判断语句：

{{< figure src="/ox-hugo/2021-08-02_22-40-57_screenshot.png" >}}

子表达式结果(20)入栈后，为了处理优先级问题，将后续的操作符(+)和操作数(10)相继入
栈。然后在 AbstractParser#arithmeticFunctionReduction 方法中对执行栈的操作数进行运
算，相应的操作也会继续读取后续节点，以保证优先级的正确性，最后将处理结果(30)放回
栈中。

游标已经移至末尾，nextToken 返回 null，则从执行栈取出解析结果(30)返回。


### Runtime {#runtime}

接下来测试一下以下语句，看看 mvel 怎么加载 Runtime 类并执行方法的：

```text
Runtime.getRuntime().exec("/System/Applications/Calculator.app/Contents/MacOS/Calculator");
```

在 AbstractParser#nextToken 方法中，游标移至 Runtime 类名后面的'.'，标识为级联操作：

{{< figure src="/ox-hugo/2021-08-03_10-29-34_screenshot.png" >}}

进入下一循环，捕获后面的完整标识符(getRuntime)，此时游标在括号处，因此移至相匹配
的右括号捕获参数内容(当前方法无参数)。然后重复这个逻辑，捕获到完整的链式调用语句，
然后在分号时跳出 CaptureLoop：

{{< figure src="/ox-hugo/2021-08-03_10-36-32_screenshot.png" >}}

最后返回的是 ASTNode 通用节点，并在压入执行栈时根据节点信息计算其值。调用栈如下：

```nil
getNormal:175, PropertyAccessor (org.mvel2)
get:145, PropertyAccessor (org.mvel2)
get:125, PropertyAccessor (org.mvel2)
getReducedValue:198, ASTNode (org.mvel2.ast) // 由"stk.push"操作调用
```

getNormal 方法的关键代码：

```java
private Object getNormal() throws Exception {
  while (cursor < end) {
    switch (nextToken()) {
      //属性访问
      case NORM:
        curr = getBeanProperty(curr, capture());
        break;
      //方法调用
      case METH:
        curr = getMethod(curr, capture());
        break;
      //集合属性访问
      case COL:
        curr = getCollectionProperty(curr, capture());
        break;
      //with 语法支持
      case WITH:
        curr = getWithProperty(curr);
        break;
    }
...
}
```

这里的 nextToken 是 PropertyAccessor 类的方法，此时已经提取出语法节点，主要处理属性
访问或方法调用的逻辑。

首先从 LITERALS 属性中拿到 Runtime 类(Class)赋值给 curr(当前对象引用)，该属性是在
AbstraceParser 初始化时设置的，封装了一些类常量和操作常量，包括 java.lang 包中的各
项常量。

{{< figure src="/ox-hugo/2021-08-03_10-53-37_screenshot.png" >}}

然后进入 getMethod 处理方法调用，首先捕获参数串，获取调用时的上下文(找到方法所有者)，
查看方法是否有缓存，以及其他处理逻辑。在本文的例子中，会执行到以下代码段来获取方
法实例：

```java
if ((m = getBestCandidate(args, name, cls, cls.getMethods(), false)) != null) {
  addMethodCache(cls, createSignature(name, tk), m);
  parameterTypes = m.getParameterTypes();
}
```

cls 就是前面获取的 Runtime 类实例，这里通过反射获取其方法列表，然后搜索要调用的目标
方法，成功获取方法实例后还会加入缓存，后续如果再次调用可以直接从缓存获取。最后返
回调用结果(Runtime 对象)：

{{< figure src="/ox-hugo/2021-08-03_11-13-07_screenshot.png" >}}

得到 Runtime 对象后，在下一轮循环中重复上面的过程，调用 Runtime#exec 弹出计算器。


## 编译执行 {#编译执行}

入口函数为 MVEL#compileExpression，返回的是 CompiledExpression 对象，该对象将表
达式中提取的语法节点封装到一个链表结构中，并且实现了 Serializable 接口。

过程好像也差不多？从编译的 ASTLinkedList 中逐个提取节点进行计算。

每次解析完一句代码（遇到分号），都会清空执行栈。


## 沙箱环境 {#沙箱环境}

没有相关实现，有几个 issue 提到过这部分需求，作者貌似都没有回复。
