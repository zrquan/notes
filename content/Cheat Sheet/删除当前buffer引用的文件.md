---
title: "删除当前buffer引用的文件"
author: ["4shen0ne"]
draft: false
---

> [!warning] 好像不太好用

有时候我想删除一篇 org-mode 文章，但是文章中引用了一些图片文件，可以使用下面的函
数一次性清理（确保没有其他文章使用这些图片）

```elisp
(defun delete-files-from-current-buffer ()
  "Delete files listed in the current buffer.
Each line in the buffer should contain a relative file path."
  (interactive)
  (let ((current-buffer-file (buffer-file-name))
        (current-dir default-directory))
    (unless current-buffer-file
      (error "Current buffer is not visiting a file"))
    (save-excursion
      (goto-char (point-min))
      (while (not (eobp))
        (let* ((relative-file-path (buffer-substring-no-properties
                                    (line-beginning-position)
                                    (line-end-position)))
               (absolute-file-path (expand-file-name relative-file-path current-dir)))
          (when (file-exists-p absolute-file-path)
            (delete-file absolute-file-path)
            (message "Deleted file: %s" absolute-file-path)))
        (forward-line 1)))))
```
