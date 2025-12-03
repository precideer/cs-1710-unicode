# Dataset Documentation

This document provides descriptions and data dictionaries for all CSV files used in the Unicode data visualization project.

---

## 1. unicode-characters_info.csv

### Description
Contains detailed information about individual Unicode characters from the Unicode Character Database (UCD). This file includes 40,117 character entries with properties such as character names, categories, bidirectional properties, case mappings, and numeric values. It serves as the core reference for character-level metadata in the visualization.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| Code value | Hexadecimal code point identifier for the character | Categorical/Ordinal | 0000 to 10FFFD |
| Character name | Official Unicode name or description of the character | Categorical | Text strings (e.g., "LATIN CAPITAL LETTER A", "<control>") |
| General category | Two-letter abbreviation indicating the character's general classification | Categorical | Lu, Ll, Lt, Lm, Lo, Mn, Mc, Me, Nd, Nl, No, Pc, Pd, Ps, Pe, Pi, Pf, Po, Sm, Sc, Sk, So, Zs, Zl, Zp, Cc, Cf, Co |
| Canonical combining classes | Numeric value used for character normalization ordering | Ordinal | 0 to 240 |
| Bidirectional category | Indicates how the character behaves in bidirectional text | Categorical | L, R, AL, EN, ES, ET, AN, CS, NSM, BN, B, S, WS, ON, LRE, LRO, RLE, RLO, PDF, LRI, RLI, FSI, PDI |
| Character decomposition mapping | Decomposition mapping for the character, if applicable | Categorical | Hex code sequences or empty |
| Decimal digit value | Decimal digit value if the character represents a digit | Quantitative | 0-9 or empty |
| Digit value | Digit value for numeric characters | Quantitative | 0-9 or empty |
| Numeric value | Numeric value for characters representing numbers | Quantitative | Various numeric values or empty |
| Mirrored | Whether the character is mirrored in bidirectional text | Categorical | Y, N |
| Unicode 1.0 Name | Character name from Unicode 1.0 (legacy) | Categorical | Text strings or empty |
| 10646 comment field | ISO 10646 comment field (informative) | Categorical | Text strings or empty |
| Uppercase mapping | Code point of the uppercase equivalent | Categorical | Hex code or empty |
| Lowercase mapping | Code point of the lowercase equivalent | Categorical | Hex code or empty |
| Titlecase mapping | Code point of the titlecase equivalent | Categorical | Hex code or empty |

---

## 2. unicode_version.csv

### Description
Tracks the growth of the Unicode Standard across all major and minor versions from 1991 to 2025. Contains 31 entries showing the version number, release year, and total character count for each Unicode release. Used to visualize the historical expansion of the Unicode character repertoire.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| version | Unicode version number | Ordinal | 1.0 to 17.0 (including minor versions like 1.0.1, 12.1, 15.1) |
| year | Year the version was released | Ordinal | 1991 to 2025 |
| chars | Total number of characters (graphic + format) in that version | Quantitative | 7,096 to 159,801 |

---

## 3. unicode_language.csv

### Description
Provides information about 173 writing scripts encoded in Unicode, including metadata about geographic distribution, languages supported, character counts, and Unicode code point ranges. This dataset enables exploration of the world's writing systems and their representation in Unicode.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| script | Name of the writing script | Categorical | 173 script names (e.g., "Latin", "Han", "Arabic", "Devanagari") |
| unicode_version | Unicode version when the script was first encoded | Ordinal | 1 to 17 |
| year_first_encoded | Year the script was first added to Unicode | Ordinal | 1991 to 2025 |
| geography_summary | Geographic regions where the script is/was used | Categorical | Text descriptions (e.g., "India; Nepal; diaspora") |
| characters_in_script_today | Current total number of characters in the script | Quantitative | 18 to 114,170 |
| languages_examples | Example languages that use this script | Categorical | Comma-separated language names |
| unicode_range | Hexadecimal code point ranges allocated to the script | Categorical | Semicolon-separated hex ranges (e.g., "0600-06FF;0750-077F") |

---

## 4. unicode_growth.csv

### Description
Detailed breakdown of Unicode character growth by script category across all 31 Unicode versions. Shows how different script families (Han/CJK, Latin, Arabic/Hebrew, Indic, Symbols/Emoji, Historic, and Other) have expanded over time. Used for the Sankey diagram visualization showing character flow by category.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| Version | Unicode version number | Ordinal | 1.0 to 17.0 |
| Year | Year the version was released | Ordinal | 1991 to 2025 |
| Release_Date | Month and year of official release | Categorical | Text (e.g., "October 1991", "September 2025") |
| Total_Characters | Total character count in the version | Quantitative | 7,096 to 159,801 |
| Han_CJK | Number of Han/CJK unified ideograph characters | Quantitative | 2,350 to 114,170 |
| Latin_Extended | Number of Latin script characters (all extensions) | Quantitative | 496 to 1,492 |
| Arabic_Hebrew | Number of Arabic and Hebrew script characters | Quantitative | 192 to 1,548 |
| Indic_Scripts | Number of Indic script characters (Devanagari, Tamil, etc.) | Quantitative | 680 to 1,420 |
| Symbols_Emoji | Number of symbols and emoji characters | Quantitative | 1,200 to 7,350 |
| Historic_Scripts | Number of historic/ancient script characters | Quantitative | 0 to 17,700 |
| Other_Scripts | Number of characters in other living scripts | Quantitative | 2,172 to 16,121 |

---

## 5. emoji_all.csv

### Description
Global emoji usage data containing the top 1,001 most-used emojis worldwide, ranked by usage count. Includes Unicode code points, emoji names, version information, and categorical classification. Sourced from aggregated social media and messaging platform data.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| emoji | The emoji character itself | Categorical | Emoji glyphs |
| unicode | Unicode code point(s) in U+ notation | Categorical | Single or multiple code points (e.g., "U+1F602", "U+1F1FA U+1F1F8") |
| count | Global usage count | Quantitative | ~3,000 to 5,315,636 |
| seq | Unicode sequence (same as unicode field) | Categorical | Code point sequences |
| emoji_from_meta | Emoji character from metadata | Categorical | Emoji glyphs |
| name | Official Unicode name of the emoji | Categorical | Text (e.g., "face with tears of joy", "red heart") |
| version | Emoji version when first introduced | Ordinal | 0.6 to 16.0 |
| category | Primary emoji category | Categorical | Smileys & Emotion, People & Body, Animals & Nature, Food & Drink, Travel & Places, Activities, Objects, Symbols, Flags |
| subgroup | Subcategory within the main category | Categorical | Various (e.g., "face-smiling", "heart", "country-flag") |
| status | Emoji qualification status | Categorical | fully-qualified |

---

## 6. emoji_us.csv

### Description
Emoji usage data specific to the United States, containing the top 1,001 most-used emojis ranked by US usage count. Structure is identical to emoji_all.csv but reflects American user preferences and cultural patterns.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| emoji | The emoji character itself | Categorical | Emoji glyphs |
| unicode | Unicode code point(s) in U+ notation | Categorical | Single or multiple code points |
| count | US-specific usage count | Quantitative | ~1,000 to 1,314,371 |
| seq | Unicode sequence | Categorical | Code point sequences |
| emoji_from_meta | Emoji character from metadata | Categorical | Emoji glyphs |
| name | Official Unicode name of the emoji | Categorical | Text descriptions |
| version | Emoji version when first introduced | Ordinal | 0.6 to 16.0 |
| category | Primary emoji category | Categorical | Smileys & Emotion, People & Body, Animals & Nature, Food & Drink, Travel & Places, Activities, Objects, Symbols, Flags |
| subgroup | Subcategory within the main category | Categorical | Various subcategories |
| status | Emoji qualification status | Categorical | fully-qualified |

---

## 7. emoji_uk.csv

### Description
Emoji usage data specific to the United Kingdom, containing the top 1,001 most-used emojis ranked by UK usage count. Structure is identical to emoji_all.csv but reflects British user preferences and cultural patterns.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| emoji | The emoji character itself | Categorical | Emoji glyphs |
| unicode | Unicode code point(s) in U+ notation | Categorical | Single or multiple code points |
| count | UK-specific usage count | Quantitative | ~500 to 279,693 |
| seq | Unicode sequence | Categorical | Code point sequences |
| emoji_from_meta | Emoji character from metadata | Categorical | Emoji glyphs |
| name | Official Unicode name of the emoji | Categorical | Text descriptions |
| version | Emoji version when first introduced | Ordinal | 0.6 to 16.0 |
| category | Primary emoji category | Categorical | Smileys & Emotion, People & Body, Animals & Nature, Food & Drink, Travel & Places, Activities, Objects, Symbols, Flags |
| subgroup | Subcategory within the main category | Categorical | Various subcategories |
| status | Emoji qualification status | Categorical | fully-qualified |

---

## 8. ascii_freq.json

### Description
Frequency distribution of ASCII characters (0-127) in English text, containing 95 entries. Each entry maps an ASCII character code to its relative frequency of occurrence. Used for visualizing character usage patterns and the "ASCII landscape" section of the data story.

### Data Dictionary

| Variable Name | Description | Type | Range |
|---------------|-------------|------|-------|
| Char | ASCII character code (decimal) | Categorial/Ordinal | 5 to 127 |
| Freq | Relative frequency of the character in English text | Quantitative | 6.34×10⁻⁸ to 0.168 |

---

## General Category Codes Reference

For the `General category` field in unicode-characters_info.csv:

| Code | Meaning |
|------|---------|
| Lu | Letter, uppercase |
| Ll | Letter, lowercase |
| Lt | Letter, titlecase |
| Lm | Letter, modifier |
| Lo | Letter, other |
| Mn | Mark, nonspacing |
| Mc | Mark, spacing combining |
| Me | Mark, enclosing |
| Nd | Number, decimal digit |
| Nl | Number, letter |
| No | Number, other |
| Pc | Punctuation, connector |
| Pd | Punctuation, dash |
| Ps | Punctuation, open |
| Pe | Punctuation, close |
| Pi | Punctuation, initial quote |
| Pf | Punctuation, final quote |
| Po | Punctuation, other |
| Sm | Symbol, math |
| Sc | Symbol, currency |
| Sk | Symbol, modifier |
| So | Symbol, other |
| Zs | Separator, space |
| Zl | Separator, line |
| Zp | Separator, paragraph |
| Cc | Other, control |
| Cf | Other, format |
| Co | Other, private use |

---

## Bidirectional Category Codes Reference

For the `Bidirectional category` field in unicode-characters_info.csv:

| Code | Meaning |
|------|---------|
| L | Left-to-Right |
| R | Right-to-Left |
| AL | Right-to-Left Arabic |
| EN | European Number |
| ES | European Number Separator |
| ET | European Number Terminator |
| AN | Arabic Number |
| CS | Common Number Separator |
| NSM | Nonspacing Mark |
| BN | Boundary Neutral |
| B | Paragraph Separator |
| S | Segment Separator |
| WS | Whitespace |
| ON | Other Neutrals |
| LRE/LRO | Left-to-Right Embedding/Override |
| RLE/RLO | Right-to-Left Embedding/Override |
| PDF | Pop Directional Format |
| LRI/RLI/FSI | Isolate controls |
| PDI | Pop Directional Isolate |