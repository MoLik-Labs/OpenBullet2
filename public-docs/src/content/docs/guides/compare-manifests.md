---
title: Compare manifests
description: Compare two UTF-8 release lists and interpret added, removed and unchanged names.
---
A manifest is a text file with one top-level name per line. This check compares **names**, not file contents, dates, or versions.

## Try a small example

Save the following as `before.txt`:

```text
README.md
old.css
```

Save this as `after.txt`:

```text
README.md
new.css
```

1. Open [Compare manifests](../../../#compare).
2. Under **Baseline**, choose `before.txt`. Under **Candidate**, choose `after.txt`.
3. Select **Compare lists**. Expect **1 added**, **1 removed**, **1 unchanged**: `new.css` is new and `old.css` is gone. Swap the files to reverse the direction.

## Read the result

`README.md` counts as unchanged even if someone edited its contents. To check the bytes of a file against a known digest, use [Verify a checksum](../verify-checksum/). Names are case-sensitive: `Logo.svg` and `logo.svg` are distinct. `UserData` is excluded regardless of casing.

## If a list is rejected

Use UTF-8 plain text, not a ZIP archive or directory listing with sizes. Remove duplicates, blank lines and paths such as `assets/logo.svg`. The tool identifies which input failed and does not show a partial comparison. See the [size and display limits](../privacy-and-limits/#limits).
