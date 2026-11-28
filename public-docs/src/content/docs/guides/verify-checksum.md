---
title: Verify a checksum
description: Compare a local file to a trusted SHA-256 digest without uploading the file.
---
Use this when a publisher supplies a SHA-256 checksum for a specific release asset. Get the expected checksum from a source you trust, and confirm it belongs to the same filename and version.

## Check a download

1. Open [File integrity](../../../#integrity) and select your local file (up to **32 MiB**).
2. Paste only the **64 hexadecimal characters** into **Expected SHA-256**, not the filename or the surrounding command. Uppercase and lowercase are both accepted.
3. Select **Calculate checksum**. **Match** means the bytes have the expected digest. **Mismatch** means they do not: recheck the release, filename and checksum before using the file.

Leave the expected value empty if you only want to calculate a digest. A calculated digest alone does not establish authenticity; a matching digest is not a publisher signature.

## If hashing is unavailable

Use the HTTPS Pages address, not an insecure HTTP mirror. On a development machine, `localhost` also supports browser hashing. For a file larger than the limit, use a local OS checksum tool instead of splitting the file: hashing the pieces does not give the original file's digest.

[Read this guide as Markdown](./index.md)
