# U+FFFD Garbled Character Issue in Miraheze Wikitext Replacements

## Problem

When replacing plain-text quest names with wikilinks in wiki table cells, a Unicode replacement character (U+FFFD) can appear between the closing ]] of the new wikilink and the next | cell separator, breaking table structure. Rows with this character render with 7-8 cells instead of 9.

## Root Cause

Regex replacement paths in execute_code can introduce U+FFFD when replacing text across cell boundaries (]] followed by newline followed by |).

## Fix

Do NOT patch individual cells. Rebuild the entire table from scratch using Python f-strings, generating each cell line independently.

## Prevention

Build each | style="..." | content line as a complete f-string. Never do regex replacements across cell boundaries.

## Verification

- text.count('\uffffd') == 0
- Every row has exactly 9 pipe-delimited cells
- All quest names have [[Page|Display]] format
