/**
 * Map of Unicode code points to their WinAnsi correlates. Any code points not
 * explicitly mapped here are already equivalent to their WinAnsi correlate.
 */
const UnicodeToWinAnsi: { [index: number]: number } = {
  402: 131, // ƒ
  8211: 150, // –
  8212: 151, // —
  8216: 145, // ‘
  8217: 146, // ’
  8218: 130, // ‚
  8220: 147, // “
  8221: 148, // ”
  8222: 132, // „
  8224: 134, // †
  8225: 135, // ‡
  8226: 149, // •
  8230: 133, // …
  8364: 128, // €
  8240: 137, // ‰
  8249: 139, // ‹
  8250: 155, // ›
  710: 136, // ˆ
  8482: 153, // ™
  338: 140, // Œ
  339: 156, // œ
  732: 152, // ˜
  352: 138, // Š
  353: 154, // š
  376: 159, // Ÿ
  381: 142, // Ž
  382: 158, // ž
};

// WinAnsi provides character codes from 0-255, except for the 5 values below.
// See:
//   • https://www.compart.com/en/unicode/charsets/windows-1252
//   • https://www.unicode.org/Public/MAPPINGS/VENDORS/MICSFT/WINDOWS/CP1252.TXT
const InvalidWinAnsiCharCodes = [129, 141, 143, 144, 157];

const isValidWinAnsiCharCode = (charCode: number) =>
  charCode >= 0 && charCode <= 255 && !(charCode in InvalidWinAnsiCharCodes);

/**
 * Returns the WinAnsi character code for a Unicode code point.
 */
export const convertUnicodeToWinAnsi = (codePoint: number) => {
  const charCode = UnicodeToWinAnsi[codePoint] || codePoint;
  if (!isValidWinAnsiCharCode(charCode)) {
    const codePointStr = String.fromCharCode(codePoint);
    const msg = `${codePointStr} (codepoint ${codePoint}) does not map to WinAnsi`;
    throw new Error(msg);
  }
  return charCode;
};

/**
 * Array of WinAnsi glyph names.
 * Allows lookups of character names given a character code.
 */
const WinAnsiCharNames = `
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef
.notdef       .notdef        .notdef        .notdef

space         exclam         quotedbl       numbersign
dollar        percent        ampersand      quotesingle
parenleft     parenright     asterisk       plus
comma         hyphen         period         slash
zero          one            two            three
four          five           six            seven
eight         nine           colon          semicolon
less          equal          greater        question

at            A              B              C
D             E              F              G
H             I              J              K
L             M              N              O
P             Q              R              S
T             U              V              W
X             Y              Z              bracketleft
backslash     bracketright   asciicircum    underscore

grave         a              b              c
d             e              f              g
h             i              j              k
l             m              n              o
p             q              r              s
t             u              v              w
x             y              z              braceleft
bar           braceright     asciitilde     .notdef

Euro          .notdef        quotesinglbase florin
quotedblbase  ellipsis       dagger         daggerdbl
circumflex    perthousand    Scaron         guilsinglleft
OE            .notdef        Zcaron         .notdef
.notdef       quoteleft      quoteright     quotedblleft
quotedblright bullet         endash         emdash
tilde         trademark      scaron         guilsinglright
oe            .notdef        zcaron         ydieresis

space         exclamdown     cent           sterling
currency      yen            brokenbar      section
dieresis      copyright      ordfeminine    guillemotleft
logicalnot    hyphen         registered     macron
degree        plusminus      twosuperior    threesuperior
acute         mu             paragraph      periodcentered
cedilla       onesuperior    ordmasculine   guillemotright
onequarter    onehalf        threequarters  questiondown

Agrave        Aacute         Acircumflex    Atilde
Adieresis     Aring          AE             Ccedilla
Egrave        Eacute         Ecircumflex    Edieresis
Igrave        Iacute         Icircumflex    Idieresis
Eth           Ntilde         Ograve         Oacute
Ocircumflex   Otilde         Odieresis      multiply
Oslash        Ugrave         Uacute         Ucircumflex
Udieresis     Yacute         Thorn          germandbls

agrave        aacute         acircumflex    atilde
adieresis     aring          ae             ccedilla
egrave        eacute         ecircumflex    edieresis
igrave        iacute         icircumflex    idieresis
eth           ntilde         ograve         oacute
ocircumflex   otilde         odieresis      divide
oslash        ugrave         uacute         ucircumflex
udieresis     yacute         thorn          ydieresis
`
  .trim()
  .split(/\s+/);

/**
 * Returns the character name for a WinAnsi character code.
 */
export const lookupWinAnsiCharName = (charCode: number) => {
  if (!isValidWinAnsiCharCode(charCode)) {
    const msg = `${charCode} is not a valid WinAnsi character code`;
    throw new Error(msg);
  }
  return WinAnsiCharNames[charCode];
};
