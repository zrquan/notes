---
title: "git cheatsheet"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:11+08:00
draft: false
---

## 强制推送 subtree {#强制推送-subtree}

```shell
git checkout master # 切换到主分支
git subtree split --prefix dist -b gh-pages # 将 subtree 分割出一条本地分支, 包含本地的修改记录
git push -f origin gh-pages:gh-pages # 强制推送分割出来的分支
git branch -D gh-pages # 删除本地分支
```


## 修改 .gitignore 后使其生效 {#修改-dot-gitignore-后使其生效}

```shell
git rm -r --cached .
git add .
git commit -m "update .gitigonre"
```
