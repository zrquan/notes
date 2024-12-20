---
title: "Git commit好习惯"
author: ["4shen0ne"]
tags: ["git"]
draft: false
---

## 一个 commit 只做一件事，避免将不同的逻辑修改混在一个 commit 中 {#一个-commit-只做一件事-避免将不同的逻辑修改混在一个-commit-中}

```text
# Good commit
git commit -m "Add user authentication"
# Bad commit
git commit -m "Add user authentication and update UI styles"
```


## 包含简要的描述，一眼看出这个 commit 的目的 {#包含简要的描述-一眼看出这个-commit-的目的}

```text
# Good commit message
git commit -m "Fix Correct null pointer exception in user login"
# Bad commit message
git commit -m "Fix bug"
```


## 在 commit 开头用特定的单词描述 commit 的类型 {#在-commit-开头用特定的单词描述-commit-的类型}

```text
# Good commit message following conventional guidelines
git commit -m "feat(auth): add JWT-based authentication"
git commit -m "fix(login): resolve race condition in login flow"
```

约定式提交：<https://www.conventionalcommits.org/zh-hans/v1.0.0/>


## 确认 commit 的修改范围（功能、模块、类等等），同一范围的修改尽量包含在同一个 commit 中 {#确认-commit-的修改范围-功能-模块-类等等-同一范围的修改尽量包含在同一个-commit-中}

```text
# Good commit with proper scope
git commit -m "refactor(auth): split auth logic into separate module"
# Bad commit with mixed scope
git commit -m "refactor and minor fixes"
```
