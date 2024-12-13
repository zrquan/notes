---
title: "清理.git目录"
author: ["4shen0ne"]
lastmod: 2024-12-14T01:40:24+08:00
draft: false
---

随着项目版本更迭， `.git/objects/pack` 文件可能会变得臃肿，可以通过以下步骤将大文
件从版本历史中删除，缩减 pack 大小

1.  查询版本历史中的前 10 个大文件

    ```text
    git rev-list --objects --all | grep "$(git verify-pack -v .git/objects/pack/*.idx | sort -k 3 -n | tail -10 | awk '{print$1}')"
    ```

2.  执行命令从历史中删除指定的大文件

    ```text
    git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch <path/filename>" --prune-empty --tag-name-filter cat -- --all
    ```

3.  执行成功后需要删除和重建索引

    ```text
    git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
    ```

4.  设置历史记录的过期时间为现在，默认为 90 天

    ```text
    git reflog expire --expire=now --all
    ```

5.  通过 gc 清理文件并优化本地存储库

    ```text
    git gc --aggressive --prune=now
    ```

6.  需要强制推送修改后的历史

    ```text
    git push --all --force origin
    ```
