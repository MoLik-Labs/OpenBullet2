---
title: Privacy and limits
description: What the public edition processes locally, what the host serves, and when checks stop.
---
## What leaves the browser?

The host receives ordinary requests for site assets. The **Public Web** workspace reads selected files locally. It compares manifests with Rust/WebAssembly and hashes files with the browser's Web Crypto implementation. Neither operation uploads the selected file. Handbook search downloads its own static search index; it does not search your files.

**Session activity** keeps up to 20 completed checks in memory, without filenames or digests. Clear the activity or close the window to discard it. Appearance preferences can persist locally. The public edition has no account or shared report database.

## Limits

| Operation | Limit | Behavior |
| --- | --- | --- |
| Compare manifests | 256 KiB and 2,048 entries per list | Rejects invalid inputs rather than returning partial totals. |
| Display a comparison | 32 names per change type | Added and removed totals still cover the complete lists. |
| Check a name | 255 UTF-8 bytes | Top-level names only, not paths. |
| Verify a checksum | 32 MiB per file | Larger files are not hashed. |

## Which edition do I need?

Use [Public Web](../../../#compare) for local file comparisons and checksums. To inspect the actual contents of an extracted release directory, use the private workspace or the desktop inspector. GitHub Pages serves static files; it has no package directory or inspection backend.

[Read this guide as Markdown](./index.md)
