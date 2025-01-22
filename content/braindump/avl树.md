---
title: "AVL树"
author: ["4shen0ne"]
draft: false
---

1962 年 G. M. Adelson-Velsky 和 E. M. Landis 在论文《An algorithm for the
organization of information》中提出了 AVL 树。论文中详细描述了一系列操作，确保在
持续添加和删除节点后，AVL 树不会退化，从而使得各种操作的时间复杂度保持在 `O(log
n)` 级别。换句话说，在需要频繁进行增删查改操作的场景中，AVL 树能始终保持高效的数
据操作性能，具有很好的应用价值。

AVL 树既是二叉搜索树，也是平衡二叉树，同时满足这两类[二叉树]({{< relref "二叉树.md" >}})的所有性质，因此是一种
平衡二叉搜索树（balanced binary search tree）。
