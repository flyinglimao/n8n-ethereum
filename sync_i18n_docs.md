# Syncing i18n Documentation Examples

## Overview

The English documentation in `website/docs/resources/` has been updated with comprehensive output examples for all operations. These examples need to be synced to all internationalized versions:

- Japanese (ja)
- Simplified Chinese (zh-CN)
- Traditional Chinese (zh-TW)

## Files That Need Syncing

1. `erc20.md` - Missing 4 output examples
2. `contract.md` - Missing 3 output examples
3. `erc721.md` - Missing 8 example/output pairs
4. `erc1155.md` - Missing 6 example/output pairs
5. `gas.md` - Missing 1 output example
6. `ens.md` - Missing 3 input examples
7. `signature.md` - Missing 3 example/output pairs
8. `utils.md` - Missing 5 example/output pairs

## Approach

Since all example code blocks are in JSON format (language-agnostic), they can be directly copied from the English version to all i18n versions.

### Manual Method

For each file:
1. Open the English version: `website/docs/resources/{file}.md`
2. Open the i18n version: `website/i18n/{lang}/docusaurus-plugin-content-docs/current/resources/{file}.md`
3. Find each operation section that has **Example**: or **Output**: blocks in English
4. Copy those blocks to the corresponding location in the i18n version
5. Preserve all translated text - only add the missing code blocks

### Automated Method (Recommended)

A Python script can be created to:
1. Parse the English markdown to extract all Example/Output blocks
2. Match them to corresponding sections in i18n files (by operation name)
3. Insert missing blocks while preserving translations

## Status

- ✅ English (en) - All files updated (8 files)
- ✅ Traditional Chinese (zh-TW) - All files updated (8 files)
- ✅ Simplified Chinese (zh-CN) - All files updated (8 files)
- ✅ Japanese (ja) - All files updated (8 files)

## Completed!

All documentation has been successfully synchronized across all language versions. A total of **2,441 lines** of example code blocks were added, ensuring users in all supported languages can see the expected input/output formats for every operation.

The synchronization was completed using an automated Python script that:
1. Extracted Example and Output blocks from English documentation
2. Matched them to corresponding sections in i18n files by operation name
3. Inserted missing blocks while preserving all translated text
4. Handled all three languages (zh-TW, zh-CN, ja) in a single run
