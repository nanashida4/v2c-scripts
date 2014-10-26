//【登録場所】 レス表示、選択テキスト
//【ラベル】 レス抽出ダイアログ
//【コマンド1】 $SCRIPT filter.js 
//【コマンド2】 $SCRIPT filter.js ignoreCase (大文字・小文字を無視)
//【コマンド3】 $SCRIPT filter.js ignoreKana (平仮名・片仮名を無視)
//【コマンド3】 $SCRIPT filter.js ignoreZenHan (全角・半角を無視)
//【コマンド4】 $SCRIPT filter.js ignoreZenHan ignoreKana (複合その1)
//【コマンド5】 $SCRIPT filter.js ignoreZenHan ignoreKana ignoreCase(複合その2)
//【コマンド6】 $SCRIPT filter.js toClipboard (内容をクリップボードへ送る)
//【コマンド7】 $SCRIPT filter.js filterRes (抽出キーワードでフィルタ)
//【スクリプト】
// ----- 次の行から -----
function toHiraganaCase(string){
  var buffer="";
  for(var i = 0; i < string.length; i++){
    var c = string.charCodeAt(i);
    var KATAKANA_SMALL_A=12449;
    var HIRAGANA_SMALL_A=12353;
    var KATAKANA_NN=12531;
    if(c >= KATAKANA_SMALL_A && c <= KATAKANA_NN){
      buffer += String.fromCharCode(c - KATAKANA_SMALL_A +HIRAGANA_SMALL_A);
    }else{
      buffer += string[i];
    }
  };
  return buffer;
}

function toZenkakuCase(string){
  var hankaku = new Array
    ("ｶﾞ", "ｷﾞ", "ｸﾞ", "ｹﾞ", "ｺﾞ", "ｻﾞ", "ｼﾞ", "ｽﾞ", "ｾﾞ", "ｿﾞ", "ﾀﾞ", "ﾁﾞ", "ﾂﾞ", "ﾃﾞ", "ﾄﾞ",
     "ﾊﾞ", "ﾊﾟ", "ﾋﾞ", "ﾋﾟ", "ﾌﾞ", "ﾌﾟ", "ﾍﾞ", "ﾍﾟ", "ﾎﾞ", "ﾎﾟ", "ｳﾞ", "ｧ", "ｱ", "ｨ", "ｲ", "ｩ",
     "ｳ", "ｪ", "ｴ", "ｫ", "ｵ", "ｶ", "ｷ", "ｸ", "ｹ", "ｺ", "ｻ", "ｼ", "ｽ", "ｾ", "ｿ", "ﾀ", "ﾁ", "ｯ",
     "ﾂ", "ﾃ", "ﾄ", "ﾅ", "ﾆ", "ﾇ", "ﾈ", "ﾉ", "ﾊ", "ﾋ", "ﾌ", "ﾍ", "ﾎ", "ﾏ", "ﾐ", "ﾑ", "ﾒ", "ﾓ",
     "ｬ", "ﾔ", "ｭ", "ﾕ", "ｮ", "ﾖ", "ﾗ", "ﾘ", "ﾙ", "ﾚ", "ﾛ", "ﾜ", "ｦ", "ﾝ", "｡", "｢", "｣", "､", "･", "ｰ", "ﾞ", "ﾟ");
  var zenkaku  = new Array
    ("ガ", "ギ", "グ", "ゲ", "ゴ", "ザ", "ジ", "ズ", "ゼ", "ゾ", "ダ", "ヂ", "ヅ", "デ", "ド",
     "バ", "パ", "ビ", "ピ", "ブ", "プ", "ベ", "ペ", "ボ", "ポ", "ヴ", "ァ", "ア", "ィ", "イ",
     "ゥ", "ウ", "ェ", "エ", "ォ", "オ", "カ", "キ", "ク", "ケ", "コ", "サ", "シ", "ス", "セ",
     "ソ", "タ", "チ", "ッ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "ネ", "ノ", "ハ", "ヒ", "フ",
     "ヘ", "ホ", "マ", "ミ", "ム", "メ", "モ", "ャ", "ヤ", "ュ", "ユ", "ョ", "ヨ", "ラ", "リ",
     "ル", "レ", "ロ", "ワ", "ヲ", "ン", "。", "「", "」", "、", "・", "ー", "゛", "゜");
  for (var i = 0; i <= hankaku.length; i++) {
    if (string.indexOf(hankaku[i]) >= 0){
      var rgex = new RegExp(hankaku[i],'g');
      string = string.replace(rgex, zenkaku[i]);
    }
  }
  return string;
}

function toLowerCase(string){
  return string.toLowerCase();
}

function search(string, key){
  var result = new Array();
  var th = v2c.context.thread;
  for(var i = 0; i < th.localResCount; i++){
    var res = th.getRes(i);
    var message = key(res.message);
    var string = key(string);
    if(message.indexOf(string) != -1){
      result.push(res);
    }
  }
  return result;
}

function contains(arr, obj){
  for(var i=0; i<arr.length; i++){
    if(arr[i] == obj){
      return true;
    }
  }
  return false;
}

function execFilter(string){
  var options = v2c.context.args;
  var ignoreCase = contains(options,"ignoreCase");
  var ignoreZenHan = contains(options,"ignoreZenHan");
  var ignoreKana = contains(options,"ignoreKana");
  // 検索前処理用関数
  function key(string){
    string = new String(string);
    if(ignoreCase){
      string = toLowerCase(string);
    }
    if(ignoreZenHan){
      string = toZenkakuCase(string);
    }
    if(ignoreKana){
      string = toHiraganaCase(string);
    }
    return string;
  }

  // stringが含まれるレスを取得
  var result = search(string, key);

  // レスでフィルタ
  if(contains(options,"filterRes")){
    v2c.context.setFilteredRes(result);
  }

  // 出力
  var out = 
    "【レス抽出】\n"
    + "対象スレ：" + v2c.context.thread.title + "\n"
    + "キーワード：" + string + "\n\n"
    + "抽出レス数：" + result.length;
  if(contains(options,"toClipboard")){
    v2c.context.setClipboardText(out);
  }else{
    v2c.alert(out);
  }
}

var string = v2c.context.selText;
if (!string || (string.length()==0) ) {
  string = v2c.prompt("抽出キーワード",'');
}
if (string && (string.length()>0) ) {
  execFilter(string);
}
// ----- 前の行まで -----
