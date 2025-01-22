---
title: "Tomcat容器部署JSP"
author: ["4shen0ne"]
draft: false
---

假设你要把 upload.jsp 运行在 tomcat docker 容器里

```jsp
<%@ page import="java.io.*, java.util.*" %>
<%@ page import="javax.servlet.http.Part" %>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page isErrorPage="false" %>
<%@ page session="true" %>
<!DOCTYPE html>
<html>
<head>
    <title>File Upload</title>
</head>
<body>
    <h1>Upload a JSP File</h1>
    <form action="upload.jsp" method="post" enctype="multipart/form-data">
        <label for="file">Choose JSP File:</label>
        <input type="file" name="file" id="file" accept=".jsp"><br><br>
        <input type="submit" value="Upload File">
    </form>

    <%
        try {
            if ("POST".equalsIgnoreCase(request.getMethod())) {
                // Enable multipart handling
                Part filePart = request.getPart("file");
                String fileName = filePart.getSubmittedFileName();
                String uploadPath = application.getRealPath("/") + "uploads/";

                // Create uploads directory if it doesn't exist
                File uploadDir = new File(uploadPath);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                // Save the uploaded file
                try (InputStream inputStream = filePart.getInputStream();
                     FileOutputStream outputStream = new FileOutputStream(uploadPath + fileName)) {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                    out.println("<p>File uploaded successfully to: " + uploadPath + fileName + "</p>");
                }
            }
        } catch (IllegalStateException e) {
            out.println("<p>Error: Multipart configuration is missing or file size exceeds limits.</p>");
        } catch (Exception e) {
            out.println("<p>Error uploading file: " + e.getMessage() + "</p>");
        }
    %>
</body>
</html>
```

在宿主机的目录结构如下：

```text
webapp/
  WEB-INF/
    classes/
    lib/
    web.xml
  upload.jsp
```

web.xml 内容（不配置 servlet 好像也能访问，但应该会影响功能）

```xml
<web-app>
  <servlet>
    <servlet-name>FileUploadServlet</servlet-name>
    <jsp-file>/upload.jsp</jsp-file>
    <multipart-config>
      <!-- Temporary location for uploaded files -->
      <location>/tmp</location>
      <!-- Max file size -->
      <max-file-size>10485760</max-file-size> <!-- 10 MB -->
      <!-- Max request size -->
      <max-request-size>20971520</max-request-size> <!-- 20 MB -->
      <!-- File size threshold before writing to disk -->
      <file-size-threshold>5120</file-size-threshold> <!-- 5 KB -->
    </multipart-config>
  </servlet>
  <servlet-mapping>
    <servlet-name>FileUploadServlet</servlet-name>
    <url-pattern>/upload.jsp</url-pattern>
  </servlet-mapping>
</web-app>
```

然后在 webapp/ 的同级目录运行

```shell
docker run -it --rm \
  -p 8080:8080 \
  -v ./webapp:/usr/local/tomcat/webapps/webapp \
  tomcat:9.0 \
  /usr/local/tomcat/bin/catalina.sh jpda run
```

<http://localhost:8080/webapp/upload.jsp>
