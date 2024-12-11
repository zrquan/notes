---
title: "调试Tomcat容器"
author: ["4shen0ne"]
draft: false
---

```bash
docker run -it --rm \
  -e 'JPDA_ADDRESS=*:8000' \
  -e JPDA_TRANSPORT=dt_socket \
  -p 8888:8080 \
  -p 9000:8000 \
  -v ./hessian.war:/usr/local/tomcat/webapps/hessian.war \
  tomcat:9.0 \
  /usr/local/tomcat/bin/catalina.sh jpda run
```
