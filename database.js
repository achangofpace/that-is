/** @module database.js */

export {
	DEFAULT_MAPPINGS,
	MAPPINGS,
	DEFAULT_SETTINGS,
	SETTINGS,
	SETTINGS_AUTOSAVE
};

/* eslint-disable */
// prettier-ignore
const HIRAGANA_TO_KATAKANA = {
  mapping_name: "Hiragana to katakana",
  description: "Hiragana to katakana",
  // type: "",
  mapping: {
    'あ': 'ア', 'い': 'イ', 'う': 'ウ', 'え': 'エ', 'お': 'オ',
    'か': 'カ', 'き': 'キ', 'く': 'ク', 'け': 'ケ', 'こ': 'コ', 'きゃ': 'キャ', 'きゅ': 'キュ', 'きょ': 'キョ',
    'さ': 'サ', 'し': 'シ', 'す': 'ス', 'せ': 'セ', 'そ': 'ソ', 'しゃ': 'シャ', 'しゅ': 'シュ', 'しょ': 'ショ',
    'た': 'タ', 'ち': 'チ', 'つ': 'ツ', 'て': 'テ', 'と': 'ト', 'ちゃ': 'チャ', 'ちゅ': 'チュ', 'ちょ': 'チョ',
    'な': 'ナ', 'に': 'ニ', 'ぬ': 'ヌ', 'ね': 'ネ', 'の': 'ノ', 'にゃ': 'ニャ', 'にゅ': 'ニュ', 'にょ': 'ニョ',
    'は': 'ハ', 'ひ': 'ヒ', 'ふ': 'フ', 'へ': 'ヘ', 'ほ': 'ホ', 'ひゃ': 'ヒャ', 'ひゅ': 'ヒュ', 'ひょ': 'ヒョ',
    'ま': 'マ', 'み': 'ミ', 'む': 'ム', 'め': 'メ', 'も': 'モ', 'みゃ': 'ミャ', 'みゅ': 'ミュ', 'みょ': 'ミョ',
    'や': 'ヤ', 'ゆ': 'ユ', 'よ': 'ヨ',
    'ら': 'ラ', 'り': 'リ', 'る': 'ル', 'れ': 'レ', 'ろ': 'ロ', 'りゃ': 'リャ', 'りゅ': 'リュ', 'りょ': 'リョ',
    'わ': 'ワ', 'ゐ': 'ヰ',             'ゑ': 'ヱ', 'を': 'ヲ',
    'ん': 'ン', 'っ': 'ッ',
    'が': 'ガ', 'ぎ': 'ギ', 'ぐ': 'グ', 'げ': 'ゲ', 'ご': 'ゴ', 'ぎゃ': 'ギャ', 'ぎゅ': 'ギュ', 'ぎょ': 'ギョ',
    'ざ': 'ザ', 'じ': 'ジ', 'ず': 'ズ', 'ぜ': 'ゼ', 'ぞ': 'ゾ', 'じゃ': 'ジャ', 'じゅ': 'ジュ', 'じょ': 'ジョ',
    'だ': 'ダ', 'ぢ': 'ヂ', 'づ': 'ヅ', 'で': 'デ', 'ど': 'ド', 'ぢゃ': 'ヂャ', 'ぢゅ': 'ヂュ', 'ぢょ': 'ヂョ',
    'ば': 'バ', 'び': 'ビ', 'ぶ': 'ブ', 'べ': 'ベ', 'ぼ': 'ボ', 'びゃ': 'ビャ', 'びゅ': 'ビュ', 'びょ': 'ビョ',
    'ぱ': 'パ', 'ぴ': 'ピ', 'ぷ': 'プ', 'ぺ': 'ペ', 'ぽ': 'ポ', 'ぴゃ': 'ピャ', 'ぴゅ': 'ピュ', 'ぴょ': 'ピョ'
  },
  selected: false
};

const KATAKANA_TO_HIRAGANA = {
  mapping_name: "Katakana to hiragana",
  description: "Katakana to hiragana",
  // type: "",
  mapping: {
    'ア': 'あ', 'イ': 'い', 'ウ': 'う', 'エ': 'え', 'オ': 'お',
    'カ': 'か', 'キ': 'き', 'ク': 'く', 'ケ': 'け', 'コ': 'こ', 'キャ': 'きゃ', 'キュ': 'きゅ', 'キョ': 'きょ',
    'サ': 'さ', 'シ': 'し', 'ス': 'す', 'セ': 'せ', 'ソ': 'そ', 'シャ': 'しゃ', 'シュ': 'しゅ', 'ショ': 'しょ',
    'タ': 'た', 'チ': 'ち', 'ツ': 'つ', 'テ': 'て', 'ト': 'と', 'チャ': 'ちゃ', 'チュ': 'ちゅ', 'チョ': 'ちょ',
    'ナ': 'な', 'ニ': 'に', 'ヌ': 'ぬ', 'ネ': 'ね', 'ノ': 'の', 'ニャ': 'にゃ', 'ニュ': 'にゅ', 'ニョ': 'にょ',
    'ハ': 'は', 'ヒ': 'ひ', 'フ': 'ふ', 'ヘ': 'へ', 'ホ': 'ほ', 'ヒャ': 'ひゃ', 'ヒュ': 'ひゅ', 'ヒョ': 'ひょ',
    'マ': 'ま', 'ミ': 'み', 'ム': 'む', 'メ': 'め', 'モ': 'も', 'ミャ': 'みゃ', 'ミュ': 'みゅ', 'ミョ': 'みょ',
    'ヤ': 'や', 'ユ': 'ゆ', 'ヨ': 'よ',
    'ラ': 'ら', 'リ': 'り', 'ル': 'る', 'レ': 'れ', 'ロ': 'ろ', 'リャ': 'りゃ' , 'リュ': 'りゅ', 'リョ': 'りょ',
    'ワ': 'わ', 'ヰ': 'ゐ',             'ヱ': 'ゑ', 'ヲ': 'を',
    'ン': 'ん', 'ッ': 'っ',
    'ガ': 'が', 'ギ': 'ぎ', 'グ': 'ぐ', 'ゲ': 'げ', 'ゴ': 'ご', 'ギャ': 'ぎゃ', 'ギュ': 'ぎゅ', 'ギョ': 'ぎょ',
    'ザ': 'ざ', 'ジ': 'じ', 'ズ': 'ず', 'ゼ': 'ぜ', 'ゾ': 'ぞ', 'ジャ': 'じゃ', 'ジュ': 'じゅ', 'ジョ': 'じょ',
    'ダ': 'だ', 'ヂ': 'ぢ', 'ヅ': 'づ', 'デ': 'で', 'ド': 'ど', 'ヂャ': 'ぢゃ', 'ヂュ': 'ぢゅ', 'ヂョ': 'ぢょ',
    'バ': 'ば', 'ビ': 'び', 'ブ': 'ぶ', 'ベ': 'べ', 'ボ': 'ぼ', 'ビャ': 'びゃ', 'ビュ': 'びゅ', 'ビョ': 'びょ',
    'パ': 'ぱ', 'ピ': 'ぴ', 'プ': 'ぷ', 'ペ': 'ぺ', 'ポ': 'ぽ', 'ピャ': 'ぴゃ', 'ピュ': 'ぴゅ', 'ピョ': 'ぴょ'
  },
  selected: false
};

const HIRAGANA_TO_ROMAJI = {
  mapping_name: "Hiragana to romaji",
  description: "Hiragana to romaji",
  // type: "",
  mapping: {
    'あ':  'a',   'い':   'i',   'う':   'u',   'え':  'e',   'お':  'o',
    'か': 'ka',   'き':  'ki',   'く':  'ku',   'け': 'ke',   'こ': 'ko',
    'さ': 'sa',   'し': 'shi',   'す':  'su',   'せ': 'se',   'そ': 'so',
    'た': 'ta',   'ち': 'chi',   'つ': 'tsu',   'て': 'te',   'と': 'to',
    'な': 'na',   'に':  'ni',   'ぬ':  'nu',   'ね': 'ne',   'の': 'no',
    'は': 'ha',   'ひ':  'hi',   'ふ':  'fu',   'へ': 'he',   'ほ': 'ho',
    'ま': 'ma',   'み':  'mi',   'む':  'mu',   'め': 'me',   'も': 'mo',
    'ら': 'ra',   'り':  'ri',   'る':  'ru',   'れ': 're',   'ろ': 'ro',
    'や': 'ya',                  'ゆ':  'yu',                 'よ': 'yo',
    'わ': 'wa',   'ゐ': 'wi',                   'ゑ': 'we',   'を': 'wo',
    'ん': 'n',
    'が': 'ga',   'ぎ': 'gi',    'ぐ':'gu',     'げ': 'ge',   'ご': 'go',
    'ざ': 'za',   'じ': 'ji',    'ず':'zu',     'ぜ': 'ze',   'ぞ': 'zo',
    'だ': 'da',   'ぢ': 'ji',    'づ':'zu',     'で': 'de',   'ど': 'do',
    'ば': 'ba',   'び': 'bi',    'ぶ':'bu',     'べ': 'be',   'ぼ': 'bo',
    'ぱ': 'pa',   'ぴ': 'pi',    'ぷ':'pu',     'ぺ': 'pe',   'ぽ': 'po',
    'ゔぁ': 'va', 'ゔぃ': 'vi',  'ゔ':'vu',     'ゔぇ': 've', 'ゔぉ': 'vo',
  },
  selected: false
};

const ROMAJI_TO_HIRAGANA = {
  mapping_name: "Romaji to hiragana",
  description: "Romaji to hiragana",
  // type: "",
  mapping: {
     'a': 'あ',    'i': 'い',    'u': 'う',    'e': 'え',    'o': 'お',
    'ka': 'か',   'ki': 'き',   'ku': 'く',   'ke': 'け',   'ko': 'こ',
    'sa': 'さ',  'shi': 'し',   'su': 'す',   'se': 'せ',   'so': 'そ',
    'ta': 'た',  'chi': 'ち',  'tsu': 'つ',   'te': 'て',   'to': 'と',
    'na': 'な',   'ni': 'に',   'nu': 'ぬ',   'ne': 'ね',   'no': 'の',
    'ha': 'は',   'hi': 'ひ',   'fu': 'ふ',   'he': 'へ',   'ho': 'ほ',
    'ma': 'ま',   'mi': 'み',   'mu': 'む',   'me': 'め',   'mo': 'も',
    'ra': 'ら',   'ri': 'り',   'ru': 'る',   're': 'れ',   'ro': 'ろ',
    'ya': 'や',                 'yu': 'ゆ',                 'yo': 'よ',
    'wa': 'わ',   'wi': 'ゐ',                 'we': 'ゑ',   'wo': 'を',
     'n': 'ん',
    'ga': 'が',   'gi': 'ぎ',   'gu': 'ぐ',   'ge': 'げ',   'go': 'ご',
    'za': 'ざ',   'ji': 'じ',   'zu': 'ず',   'ze': 'ぜ',   'zo': 'ぞ',
    'da': 'だ',   'ji': 'ぢ',   'zu': 'づ',   'de': 'で',   'do': 'ど',
    'ba': 'ば',   'bi': 'び',   'bu': 'ぶ',   'be': 'べ',   'bo': 'ぼ',
    'pa': 'ぱ',   'pi': 'ぴ',   'pu': 'ぷ',   'pe': 'ぺ',   'po': 'ぽ',
    'va': 'ゔぁ', 'vi': 'ゔぃ', 'vu': 'ゔ',  've': 'ゔぇ:', 'vo': 'ゔぉ',
  },
  selected: false
};

// const HIRAGANA_TO_IPA = {
//   mapping_name: "Hiragana to IPA",
//   description: "Hiragana to IPA",
//   // type: "",
//   mapping: {
//     'あ': 'ɑ',    い:'i',   う:'ɯ',   え:'e',    お:'o',
//     'か': 'ka',   き:'ki',  く:'kɯ',  け:'ke',   こ:'ko',
//     'さ': 'sa',   し:'ɕi', す:'sɯ',  せ:'se',   そ:'so',
//     'た': 'ta',   ち:'tɕi', つ:'tsɯ', て:'te',   と:'to',
//     'な': 'na',   に:'ni',  ぬ:'nɯ',  ね:'ne',   の:'no',
//     'は': 'ha',   ひ:'çi',  ふ:'ɸɯ',  へ:'he',   ほ:'ho',
//     'ま': 'ma',   み:'mi',  む:'mɯ',  め:'me',   も:'mo',
//     'ら': 'ɽa',   り:'ɽi',  る:'ɽɯ',  れ:'ɽe',   ろ:'ɽo',
//     'や': 'ja',   ゆ:'jɯ',  よ:'jo',
//     'わ': 'wa',   ゐ:'wi',  ゑ:'we',  を:'wo',
//     'ん': '[ɴ]',
//     'が': 'ga',   ぎ:'gi',  ぐ:'gɯ',  げ:'ge',   ご:'go',
//     'ざ': 'za',   じ:'ji',  ず:'zɯ',  ぜ:'ze',   ぞ:'zo',
//     'だ': 'da',   ぢ:'ji',  づ:'zɯ',  で:'de',   ど:'do',
//     'ば': 'ba',   び:'bi',  ぶ:'bɯ',  べ:'be',   ぼ:'bo',
//     'ぱ': 'pa',   ぴ:'pi',  ぷ:'pɯ',  ぺ:'pe',   ぽ:'po',
//     'ゔぁ': 'va', ゔぃ:'vi', ゔ:'vɯ',  ゔぇ:'ve', ゔぉ:'vo',
//   }
// };

const KATAKANA_TO_ROMAJI = {
  mapping_name: "Katakana to romaji",
  description: "Katakana to romaji",
  // type: "",
  mapping: {
    'ア': 'a',  'イ': 'i',   'ウ': 'u',   'エ': 'e',  'オ': 'o',
    'カ': 'ka', 'キ': 'ki',  'ク': 'ku',  'ケ': 'ke', 'コ': 'ko',   'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su',  'セ': 'se', 'ソ': 'so',   'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',   'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
    'ナ': 'na', 'ニ': 'ni',  'ヌ': 'nu',  'ネ': 'ne', 'ノ': 'no',   'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
    'ハ': 'ha', 'ヒ': 'hi',  'フ': 'fu',  'ヘ': 'he', 'ホ': 'ho',   'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
    'マ': 'ma', 'ミ': 'mi',  'ム': 'mu',  'メ': 'me', 'モ': 'mo',   'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
    'ヤ': 'ya', 'ユ': 'yu',  'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri',  'ル': 'ru',  'レ': 're', 'ロ': 'ro',   'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
    'ワ': 'wa', 'ヰ': 'wi',               'ヱ': 'we', 'ヲ': 'wo',
    'ン': 'n',
    'ガ': 'ga', 'ギ': 'gi',  'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',    'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
    'ザ': 'za', 'ジ': 'ji',  'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',    'ジャ': 'ja',  'ジュ': 'ju',  'ジョ': 'jo',
    'ダ': 'da', 'ヂ': 'ji',  'ヅ': 'zu', 'デ': 'de', 'ド': 'do',    'ヂャ': 'ja',  'ヂュ': 'ju',  'ヂョ': 'jo',
    'バ': 'ba', 'ビ': 'bi',  'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',    'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
    'パ': 'pa', 'ピ': 'pi',  'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',    'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo'
  },
  selected: false
};

const ROMAJI_TO_KATAKANA = {
  mapping_name: "Romaji to katakana",
  description: "Romaji to katakana",
  // type: "",
  mapping: {
     'a': 'ア',   'i': 'イ',   'u': 'ウ',  'e': 'エ',  'o': 'オ',
    'ka': 'カ',  'ki': 'キ',  'ku': 'ク', 'ke': 'ケ', 'ko': 'コ',   'kya': 'キャ', 'kyu': 'キュ', 'kyo': 'キョ',
    'sa': 'サ', 'shi': 'シ',  'su': 'ス', 'se': 'セ', 'so': 'ソ',   'sha': 'シャ', 'shu': 'シュ', 'sho': 'ショ',
    'ta': 'タ', 'chi': 'チ', 'tsu': 'ツ', 'te': 'テ', 'to': 'ト',   'cha': 'チャ', 'chu': 'チュ', 'cho': 'チョ',
    'na': 'ナ',  'ni': 'ニ',  'nu': 'ヌ', 'ne': 'ネ', 'no': 'ノ',   'nya': 'ニャ', 'nyu': 'ニュ', 'nyo': 'ニョ',
    'ha': 'ハ',  'hi': 'ヒ',  'fu': 'フ', 'he': 'ヘ', 'ho': 'ホ',   'hya': 'ヒャ', 'hyu': 'ヒュ', 'hyo': 'ヒョ',
    'ma': 'マ',  'mi': 'ミ',  'mu': 'ム', 'me': 'メ', 'mo': 'モ',   'mya': 'ミャ', 'myu': 'ミュ', 'myo': 'ミョ',
    'ya': 'ヤ',  'yu': 'ユ',  'yo': 'ヨ',
    'ra': 'ラ',  'ri': 'リ',  'ru': 'ル', 're': 'レ', 'ro': 'ロ',   'rya': 'リャ', 'ryu': 'リュ', 'ryo': 'リョ',
    'wa': 'ワ',  'wi': 'ヰ',              'we': 'ヱ', 'wo': 'ヲ',
     'n': 'ン',
    'ga': 'ガ', 'gi': 'ギ',  'gu': 'グ', 'ge': 'ゲ', 'go': 'ゴ',    'gya': 'ギャ', 'gyu': 'ギュ',  'gyo': 'ギョ',
    'za': 'ザ', 'ji': 'ジ',  'zu': 'ズ', 'ze': 'ゼ', 'zo': 'ゾ',     'ja': 'ジャ',  'ju': 'ジュ',   'jo': 'ジョ',
    'da': 'ダ', 'ji': 'ヂ',  'zu': 'ヅ', 'de': 'デ', 'do': 'ド',     'ja': 'ヂャ',  'ju': 'ヂュ',   'jo': 'ヂョ',
    'ba': 'バ', 'bi': 'ビ',  'bu': 'ブ', 'be': 'ベ', 'bo': 'ボ',    'bya': 'ビャ', 'byu': 'ビュ',  'byo': 'ビョ',
    'pa': 'パ', 'pi': 'ピ',  'pu': 'プ', 'pe': 'ペ', 'po': 'ポ',    'pya': 'ピャ', 'pyu': 'ピュ',  'pyo': 'ピョ'
  },
  selected: false
};

//   あ ア a	い イ i	う ウ u	え エ e	お オ o
//   か カ ka	き キ ki	く ク ku	け ケ ke	こ コ ko	きゃ キャ kya	きゅ キュ kyu	きょ キョ kyo
//   さ サ sa	し シ shi	す ス su	せ セ se	そ ソ so	しゃ シャ sha	しゅ シュ shu	しょ ショ sho
//   た タ ta	ち チ chi	つ ツ tsu	て テ te	と ト to	ちゃ チャ cha	ちゅ チュ chu	ちょ チョ cho
//   な ナ na	に ニ ni	ぬ ヌ nu	ね ネ ne	の ノ no	にゃ ニャ nya	にゅ ニュ nyu	にょ ニョ nyo
//   は ハ ha	ひ ヒ hi	ふ フ fu	へ ヘ he	ほ ホ ho	ひゃ ヒャ hya	ひゅ ヒュ hyu	ひょ ヒョ hyo
//   ま マ ma	み ミ mi	む ム mu	め メ me	も モ mo	みゃ ミャ mya	みゅ ミュ myu	みょ ミョ myo
//   や ヤ ya		ゆ ユ yu		よ ヨ yo
//   ら ラ ra	り リ ri	る ル ru	れ レ re	ろ ロ ro	りゃ リャ rya	りゅ リュ ryu	りょ リョ ryo
//   わ ワ wa	ゐ ヰ wi †		ゑ ヱ we †	を ヲ wo ‡
//   ん ン n /n'
//   が ガ ga	ぎ ギ gi	ぐ グ gu	げ ゲ ge	ご ゴ go	ぎゃ ギャ gya	ぎゅ ギュ gyu	ぎょ ギョ gyo
//   ざ ザ za	じ ジ ji	ず ズ zu	ぜ ゼ ze	ぞ ゾ zo	じゃ ジャ ja	じゅ ジュ ju	じょ ジョ jo
//   だ ダ da	ぢ ヂ ji	づ ヅ zu	で デ de	ど ド do	ぢゃ ヂャ ja	ぢゅ ヂュ ju	ぢょ ヂョ jo
//   ば バ ba	び ビ bi	ぶ ブ bu	べ ベ be	ぼ ボ bo	びゃ ビャ bya	びゅ ビュ byu	びょ ビョ byo
//   ぱ パ pa	ぴ ピ pi	ぷ プ pu	ぺ ペ pe	ぽ ポ po	ぴゃ ピャ pya	ぴゅ ピュ pyu	ぴょ ピョ pyo

const GREEK_ALPHABET_TO_ENGLISH_NAMES = {
  mapping_name: "Greek alphabet to English names",
  description: "Greek alphabet to English names",
  // type: "",
  mapping: {
    'α': "alpha",        'ά': "alpha with tonos",       'ἀ': 'alpha with psili',    'Α': "alpha",               'Ά': "alpha with tonos",
    'β': "beta",         'ϐ': "beta",                   'Β': "beta",
    'γ': "gamma",        'Γ': "gamma",
    'δ': "delta",        'Δ': "delta",
    'ε': "epsilon",      'έ': "epsilon with tonos",     'ϵ': "epsilon",             '϶': "reversed epsilon",                 'Ε': "epsilon",      'Έ': "epsilon with tonos",
    'ζ': "zeta",         'Ζ': "zeta",
    'η': "eta",          'ή': "eta with tonos",         'Η': "eta",                 'Ή': "eta",
    'θ': "theta",        'ϑ': "theta",                  'Θ': "theta",               'ϴ': "theta",
    'ι': "iota",         'ί': "iota with tonos",        'ϊ': "iota with dialitika", 'ΐ': "iota with dialitika and tonos",    'Ι': "iota",         'Ϊ': "iota with dialitika",   'Ί': "iota with tonos",
    'κ': "kappa",        'Κ': "kappa",
    'λ': "lambda",       'Λ': "lambda",
    'μ': "mu",           'Μ': "mu",
    'ν': "nu",           'Ν': "nu",
    'ξ': "xi",           'Ξ': "xi",
    'ο': "omicron",      'ό': "omicron with tonos",     'Ο': "omicron",             'Ό': "omicron with tonos",
    'π': "pi",           'ϖ': "pi",                     'Π': "pi",
    'ρ': "rho",          'Ρ': "rho",
    'σ': "sigma",        'ς': "sigma (final)",          'Σ': "sigma",
    'ϲ': "sigma",        'ͻ': "reversed sigma",         'Ϲ': "sigma",               'Ͻ': "reversed sigma",
    'ͼ': "dotted sigma", 'ͽ': "reversed dotted sigma",  'Ͼ': "dotted sigma",        'Ͽ': "reversed dotted sigma",
    'τ': "tau",          'Τ': "tau",
    'υ': "upsilon",      'ϋ': "upsilon with dialitika", 'ύ': "upsilon with tonos",  'ΰ': "upsilon with dialitika and tonos", 'ϒ': "upsilon",      'Υ': "upsilon",               'Ϋ': "upsilon with dialitika", 'Ύ': "upsilon with tonos",
    'φ': "phi",          'ϕ': "phi",                    'Φ': "phi",
    'χ': "chi",          'Χ': "chi",
    'ψ': "psi",          'Ψ': "psi",
    'ω': "omega",        'ώ': "omega with tonos",       'Ω': "omega",               'Ω': "omega with tonos",
  },
  selected: false
};

const GREEK_ALPHABET_MINUS_OVERLAP_TO_ENGLISH_NAMES = {
  mapping_name: "Greek alphabet minus English overlap to English names",
  description: "Greek alphabet minus English overlap to English names",
  // type: "",
  mapping: {
    'α': "alpha",
    'β': "beta",
    'γ': "gamma",   'Γ': "big gamma",
    'δ': "delta",   'Δ': "big delta",
    'ϵ': "epsilon",
    'ζ': "zeta",
    'η': "eta",
    'θ': "theta",   'Θ': "big theta",
    'ι': "iota",
    'κ': "kappa",
    'λ': "lambda",  'Λ': "big lambda",
    'μ': "mu",
    'ν': "nu",
    'ξ': "xi",      'Ξ': "big xi",
    'ο': "omicron", 'Ο': "big omicron",
    'π': "pi",      'Π': "big pi",
    'ρ': "rho",
    'σ': "sigma",   'ς': 'sigma (final)', 'Σ': "big sigma",
    'τ': "tau",
    'υ': "upsilon", 'ϒ': "big upsilon",
    'ϕ': "phi",     'Φ': "big phi",
    'χ': "chi",     'Χ': "big chi",
    'ψ': "psi",     'Ψ': "big psi",
    'ω': "omega",   'Ω': "big omega",
  },
  selected: false
};

// const GREEK_ALPHABET_TO_ENGLISH_NAMES = {
  // mapping_name: "Greek alphabet to English names",
  // mapping: {
  // α: {name: "alpha",}
  // A: {name: "alpha",}
  // β: {name: "beta",   }
  // B: {name: "beta",   }
  // γ: {name: "gamma",  }
  // Γ: {name: "gamma",  }
  // δ: {name: "delta",  }
  // Δ: {name: "delta",  }
  // ϵ: {name: "epsilon",}
  // E: {name: "epsilon",}
  // ζ: {name: "zeta",   }
  // Z: {name: "zeta",   }
  // η: {name: "eta",    }
  // H: {name: "eta",    }
  // θ: {name: "theta",  }
  // Θ: {name: "theta",  }
  // ι: {name: "iota",   }
  // I: {name: "iota",   }
  // κ: {name: "kappa",  }
  // K: {name: "kappa",  }
  // λ: {name: "lambda", }
  // Λ: {name: "lambda", }
  // μ: {name: "mu",     }
  // M: {name: "mu",     }
  // ν: {name: "nu",     }
  // N: {name: "nu",     }
  // ξ: {name: "xi",     }
  // Ξ: {name: "xi",     }
  // o: {name: "omicron",}
  // O: {name: "omicron",}
  // π: {name: "pi",     }
  // Π: {name: "pi",     }
  // ρ: {name: "rho",    }
  // P: {name: "rho",    }
  // σ: {name: "sigma",  }
  // Σ: {name: "sigma",  }
  // τ: {name: "tau",    }
  // T: {name: "tau",    }
  // υ: {name: "upsilon",}
  // ϒ: {name: "upsilon",}
  // ϕ: {name: "phi",    }
  // Φ: {name: "phi",    }
  // χ: {name: "chi",    }
  // X: {name: "chi",    }
  // ψ: {name: "psi",    }
  // Ψ: {name: "psi",    }
  // ω: {name: "omega",  }
  // Ω: {name: "omega",  }
  // }
// };

// const GREEK_ALPHABET_TO_ENGLISH_PRONUNCIATION = {
  // mapping_name: "Greek alphabet to English pronunciation guide",
  // mapping: {
  // α: {pronunciation: "ah"},
  // A: {pronunciation: "ah"},
  // β: {pronunciation: "b"},
  // B: {pronunciation: "b"},
  // γ: {pronunciation: "g"},
  // Γ: {pronunciation: "g"},
  // δ: {pronunciation: "d"},
  // Δ: {pronunciation: "d"},
  // ϵ: {pronunciation: "e"},
  // E: {pronunciation: "e"},
  // ζ: {pronunciation: "z"},
  // Z: {pronunciation: "z"},
  // η: {pronunciation: "ey"},
  // H: {pronunciation: "ey"},
  // θ: {pronunciation: "th"},
  // Θ: {pronunciation: "th"},
  // ι: {pronunciation: "i"},
  // I: {pronunciation: "i"},
  // κ: {pronunciation: "k"},
  // K: {pronunciation: "k"},
  // λ: {pronunciation: "l"},
  // Λ: {pronunciation: "l"},
  // μ: {pronunciation: "m"},
  // M: {pronunciation: "m"},
  // ν: {pronunciation: "n"},
  // N: {pronunciation: "n"},
  // ξ: {pronunciation: "ks"},
  // Ξ: {pronunciation: "ks"},
  // o: {pronunciation: "ah"},
  // O: {pronunciation: "ah"},
  // π: {pronunciation: "p"},
  // Π: {pronunciation: "p"},
  // ρ: {pronunciation: "r"},
  // P: {pronunciation: "r"},
  // σ: {pronunciation: "s"},
  // Σ: {pronunciation: "s"},
  // τ: {pronunciation: "t"},
  // T: {pronunciation: "t"},
  // υ: {pronunciation: "uw"},
  // ϒ: {pronunciation: "uw"},
  // ϕ: {pronunciation: "f"},
  // Φ: {pronunciation: "f"},
  // χ: {pronunciation: "kh"},
  // X: {pronunciation: "kh"},
  // ψ: {pronunciation: "ps"},
  // Ψ: {pronunciation: "ps"},
  // ω: {pronunciation: "oh"},
  // Ω: {pronunciation: "oh"}
  // }
// };

const GREEK_ALPHABET_TO_ENGLISH_PRONUNCIATION = {
  mapping_name: "Greek alphabet to English pronunciation guide",
  description: "Greek alphabet to English pronunciation guide",
  // type: "",
  mapping: {
    'α': "ah", 'A': "ah",
    'β': "b",  'B': "b",
    'γ': "g",  'Γ': "g",
    'δ': "d",  'Δ': "d",
    'ϵ': "e",  'E': "e",
    'ζ': "z",  'Z': "z",
    'η': "ey", 'H': "ey",
    'θ': "th", 'Θ': "th",
    'ι': "i",  'I': "i",
    'κ': "k",  'K': "k",
    'λ': "l",  'Λ': "l",
    'μ': "m",  'M': "m",
    'ν': "n",  'N': "n",
    'ξ': "ks", 'Ξ': "ks",
    'ο': "ah", 'Ο': "ah",
    'π': "p",  'Π': "p",
    'ρ': "r",  'P': "r",
    'σ': "s",  'Σ': "s",
    'τ': "t",  'T': "t",
    'υ': "uw", 'ϒ': "uw",
    'ϕ': "f",  'Φ': "f",
    'χ': "kh", 'X': "kh",
    'ψ': "ps", 'Ψ': "ps",
    'ω': "oh", 'Ω': "oh"
  },
  selected: false
};

// const GREEK_TO_ENGLISH = {
  // mapping_name: "GREEK_TO_ENGLISH",
  // mapping: {
  // α: {name: "alpha",   pronunciation: "ah"},
  // A: {name: "alpha",   pronunciation: "ah"},
  // β: {name: "beta",    pronunciation: "b"},
  // B: {name: "beta",    pronunciation: "b"},
  // γ: {name: "gamma",   pronunciation: "g"},
  // Γ: {name: "gamma",   pronunciation: "g"},
  // δ: {name: "delta",   pronunciation: "d"},
  // Δ: {name: "delta",   pronunciation: "d"},
  // ϵ: {name: "epsilon", pronunciation: "e"},
  // E: {name: "epsilon", pronunciation: "e"},
  // ζ: {name: "zeta",    pronunciation: "z"},
  // Z: {name: "zeta",    pronunciation: "z"},
  // η: {name: "eta",     pronunciation: "ey"},
  // H: {name: "eta",     pronunciation: "ey"},
  // θ: {name: "theta",   pronunciation: "th"},
  // Θ: {name: "theta",   pronunciation: "th"},
  // ι: {name: "iota",    pronunciation: "i"},
  // I: {name: "iota",    pronunciation: "i"},
  // κ: {name: "kappa",   pronunciation: "k"},
  // K: {name: "kappa",   pronunciation: "k"},
  // λ: {name: "lambda",  pronunciation: "l"},
  // Λ: {name: "lambda",  pronunciation: "l"},
  // μ: {name: "mu",      pronunciation: "m"},
  // M: {name: "mu",      pronunciation: "m"},
  // ν: {name: "nu",      pronunciation: "n"},
  // N: {name: "nu",      pronunciation: "n"},
  // ξ: {name: "xi",      pronunciation: "ks"},
  // Ξ: {name: "xi",      pronunciation: "ks"},
  // o: {name: "omicron", pronunciation: "ah"},
  // O: {name: "omicron", pronunciation: "ah"},
  // π: {name: "pi",      pronunciation: "p"},
  // Π: {name: "pi",      pronunciation: "p"},
  // ρ: {name: "rho",     pronunciation: "r"},
  // P: {name: "rho",     pronunciation: "r"},
  // σ: {name: "sigma",   pronunciation: "s"},
  // Σ: {name: "sigma",   pronunciation: "s"},
  // τ: {name: "tau",     pronunciation: "t"},
  // T: {name: "tau",     pronunciation: "t"},
  // υ: {name: "upsilon", pronunciation: "uw"},
  // ϒ: {name: "upsilon", pronunciation: "uw"},
  // ϕ: {name: "phi",     pronunciation: "f"},
  // Φ: {name: "phi",     pronunciation: "f"},
  // χ: {name: "chi",     pronunciation: "kh"},
  // X: {name: "chi",     pronunciation: "kh"},
  // ψ: {name: "psi",     pronunciation: "ps"},
  // Ψ: {name: "psi",     pronunciation: "ps"},
  // ω: {name: "omega",   pronunciation: "oh"},
  // Ω: {name: "omega",   pronunciation: "oh"}
  // }
// };

const HANGGUL_TO_ROMAJA = {
  mapping_name: "Hanggul to English equivalent",
  description: "",
  // type: "",
  mapping: {
    '프': "two lines",
    '테': "E vertical two lines",
    '라': "z with line"
  },
  selected: false
};

// const GREEK_TO_ENGLISH = {
//   α: {name: "alpha",   pronunciation: "ah", uppercase: "A"},
//   β: {name: "beta",    pronunciation: "b",  uppercase: "B"},
//   γ: {name: "gamma",   pronunciation: "g",  uppercase: "Γ"},
//   δ: {name: "delta",   pronunciation: "d",  uppercase: "Δ"},
//   ϵ: {name: "epsilon", pronunciation: "e",  uppercase: "E"},
//   ζ: {name: "zeta",    pronunciation: "z",  uppercase: "Z"},
//   η: {name: "eta",     pronunciation: "ey", uppercase: "H"},
//   θ: {name: "theta",   pronunciation: "th", uppercase: "Θ"},
//   ι: {name: "iota",    pronunciation: "i",  uppercase: "I"},
//   κ: {name: "kappa",   pronunciation: "k",  uppercase: "K"},
//   λ: {name: "lambda",  pronunciation: "l",  uppercase: "Λ"},
//   μ: {name: "mu",      pronunciation: "m",  uppercase: "M"},
//   ν: {name: "nu",      pronunciation: "n",  uppercase: "N"},
//   ξ: {name: "xi",      pronunciation: "ks", uppercase: "Ξ"},
//   o: {name: "omicron", pronunciation: "ah", uppercase: "O"},
//   π: {name: "pi",      pronunciation: "p",  uppercase: "Π"},
//   ρ: {name: "rho",     pronunciation: "r",  uppercase: "P"},
//   σ: {name: "sigma",   pronunciation: "s",  uppercase: "Σ"},
//   τ: {name: "tau",     pronunciation: "t",  uppercase: "T"},
//   υ: {name: "upsilon", pronunciation: "uw", uppercase: "ϒ"},
//   ϕ: {name: "phi",     pronunciation: "f",  uppercase: "Φ"},
//   χ: {name: "chi",     pronunciation: "kh", uppercase: "X"},
//   ψ: {name: "psi",     pronunciation: "ps", uppercase: "Ψ"},
//   ω: {name: "omega",   pronunciation: "oh", uppercase: "Ω"}
// };

// (Agápi)         Love          Αγάπη
// (Vivlío)        Book          Βιβλίο
// (Gáta)          Cat           Γάτα
// (Dásos)         Forest        Δάσος
// (Eleútheros)    Free          Ελεύθερος
// (Zoí) -         Life          Ζωή
// (Iliotherapía)  Sunbathing    Ηλιοθεραπεία
// (Thálassa)      Sea           Θάλασσα
// (Istoría)       History       Ιστορία
// (Kaliméra)      Good morning  Καλημέρα
// (Louloúdi)      Flower        Λουλούδι
// (Máthima)       Lesson        Μάθημα
// (Nómos)         Law           Νόμος
// (Xenodocheío)   Hotel         Ξενοδοχείο
// (Ouranós)       Sky           Ουρανός
// (Paichnídi)     Game          Παιχνίδι
// (Rolói)         Clock         Ρολόι
// (Scholío)       School        Σχολείο
// (Téchni)        Art           Τέχνη
// (Ygeía)         Health        Υγεία
// (Fotografía)    Photography   Φωτογραφία
// (Chróma)        Color         Χρώμα
// (Psychí)        Soul          Ψυχή
// (Okeanós)       Ocean         Ωκεανός

// const SPECIAL_SYMBOLS = {
//   '。': '.',
//   '、': ',',
//   '：': ':',
//   '・': '/',
//   '！': '!',
//   '？': '?',
//   '〜': '~',
//   'ー': '-',
//   '「': '‘',
//   '」': '’',
//   '『': '“',
//   '』': '”',
//   '［': '[',
//   '］': ']',
//   '（': '(',
//   '）': ')',
//   '｛': '{',
//   '｝': '}',
//   '　': ' ',
// };

// んい -> n'i
//  jo   jo  no  kimyo  na boken
// JIyo JIyo NO  ki/myo na boken
// ジョ ジョ の  奇/妙   な 冒険

// kʌs / təm / 
// Κασ / τομ / ル / 🐝

/* eslint-enable */

/***
 * the database is a key-value store that stores two types of objects:
 * 'mappings'
 * and
 * 'settings'
 */

/**
 * #### MAPPINGS
 * ##### DESCRIPTION:
 * An array of Objects representing mappings of key strings to search for in web
 * pages (can be single characters or multiple characters or multiple words) and
 * corresponding strings to display above those keys as ruby annotations.
 *
 * Users can create their own mappings or use the provided defaults.
 * ##### `mapping_name`
 * {String} Serves as both a display name and an ID.
 * ##### `description`
 * {String} A description of the mapping.
 * ##### `type` (idea phase still)
 * {String} Type may be neccessary to differentiate types of mappings.
 * Case sensitivity might be desired or not in different cases. You could use a
 * field like `type` to change the behavior of the annotation function or the
 * regex it uses.
 * ##### `mapping`
 * {Object} The container with the actual key\<String>-annotation\<String> pairs.
 *
 * Keys are not limited to one character.
 *
 * Keys should be unique to each mapping, but they are not required to not overlap
 * between mappings.
 *
 * If conflicts between selected mappings appear, they'll be resolved based on
 * their priority (their relative position in the array).
 *
 * Annotations should be kept short, ideally around the same length as the keys.
 * ##### `selected`
 * {Boolean} Whether or not this mapping is selected for annotation.
 * ##### EXAMPLE:
 *     "MAPPINGS": [
 *       {
 *         "mapping_name": "First Example Mapping",
 *         "description": "has one set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_1",
 *           "key_2": "annotation_2"
 *         }
 *         "selected": true
 *       },
 *       {
 *         "mapping_name": "Second Example Mapping",
 *         "description": "has another set of keys and annotations",
 *         "mapping": {
 *           "key_1": "annotation_4"
 *           "key_3": "annotation_3",
 *         },
 *         "selected": true
 *       },
 *       {
 *         "mapping_name": "Third Example Mapping",
 *         "description": "has yet another set of keys and annotations",
 *         "mapping": {
 *           "key_4": "annotation_4"
 *           "key_5": "annotation_5",
 *         },
 *         "selected": false
 *       }
 *     ]
 */
const MAPPINGS = 'MAPPINGS';

/**
 * @constant
 */
const DEFAULT_MAPPINGS = [
	HIRAGANA_TO_KATAKANA,
	KATAKANA_TO_HIRAGANA,
	HIRAGANA_TO_ROMAJI,
	ROMAJI_TO_HIRAGANA,
	KATAKANA_TO_ROMAJI,
	ROMAJI_TO_KATAKANA,
	GREEK_ALPHABET_TO_ENGLISH_NAMES,
	GREEK_ALPHABET_MINUS_OVERLAP_TO_ENGLISH_NAMES,
	GREEK_ALPHABET_TO_ENGLISH_PRONUNCIATION,
	HANGGUL_TO_ROMAJA
];

/**
 * #### SETTINGS
 * ##### DESCRIPTION:
 * An object containing settings of varying types.
 * ##### `AUTOSAVE`
 * {Boolean} Toggles saving on some operations vs. only on user using 'Save' button
 * ##### `ANNOTATION_SIZE` (STILL IN IDEA PHASE)
 * {*} Could be default/small/medium/large or maybe some font size. Could be
 * used to set the size of annotated text and also could be used to set the size
 * of annotations or some combination of those two.
 *
 * ##### EXAMPLE:
 *     "SETTINGS": {
 *       AUTOSAVE: true
 *     }
 */
const SETTINGS = 'SETTINGS';
const SETTINGS_AUTOSAVE = 'AUTOSAVE';
const DEFAULT_SETTINGS = {
	AUTOSAVE: true
};