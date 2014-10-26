//【登録場所】 "V2C\script\system\post.js"
//【内容】post.jsのまとめ
//【パーミッション】A
//【備考】checkBeforeCreateThreadとcheckBeforePostの{}内で、行頭のコメント「//」を、利用する行ごとに解除することで、有効になります。
//【更新日時】2014/06/08 転載禁止語変換を追加
//            2014/05/27 バグ修正及びV2C_x64.exe実行時にも動くように設定項目を追加
//            2014/04/20 2ch.scのスレ立てに対応。作成に成功すると書き込み欄が消えるのでそれを確認後スレ一覧を手動で更新する必要があります。
//                       1987行あたりにスレ作成後書き込み欄を閉じる閉じないの設定があります。デフォだと閉じる
//            2014/02/15 浪人BETAに対応。書き込み後閉じる設定項目を追加
//【スクリプト】
// ----- 次の行から -----
function checkBeforeCreateThread(wp){
  var post = true;
  return post
/* スレ立て時の機能を有効にしたい場合、下の各行頭//を削除してください  */
//    && uneiitaCautionByBoard(wp) //スレ立て時、特定の板、かつ、スレタイに特定のキーワードが含まれていたら警告する
//    && replaceh(wp) //自動でURL先頭のhを文字参照(16進数)に置換する。(デフォルトはV2C提示版)
//    && checkSimilarThread(wp) //スレ立て重複チェック
//    && roninLogin(wp, false) // PINKちゃんねる浪人BETAで書き込みする
//    && createThread2chsc(wp) // 2ch.scでスレ立てする
};

function checkBeforePost(wp){
  var post = true;
  return post
/* レス書き込み時の機能を有効にしたい場合、下の各行頭//を削除してください  */
//    && escapeCharRef(wp) //文字参照をそのままスレッドに表示させる(&を&amp;に置換する、デフォルトはV2C提示版の'スクリプト'と'レス表示スタイル')
//    && replaceh(wp) //自動でURL先頭のhを文字参照(16進数)に置換する。(デフォルトはV2C提示版)
//    && removeh(wp) //自動でURL先頭のh抜きをする。(デフォルトはtwitter以外)
//    && replaceTab(wp) //書き込み時に【TAB】に自動置換（デフォルトはスレタイが'ImageViewURLReplace','ReplaceStr','URLExec'）
//    && closeWritePanel(wp) //書き込み後自動で閉じる（常に行う場合、メニューの設定で可能です。デフォルトはtwitter以外）
//    && checkBlankName(wp) //名前欄が空欄 or !ninja or !denki以外で警告（デフォルトはローカル板とtwitter以外）
//    && reloadBeforePost(wp) //書き込み前に更新して新着があれば書き込まない　※勢いのあるスレではそのまま書き込む（デフォルトはローカル板とtwitter以外）
//    && checkMoitaKotehan(wp) //モ娘（狼）で「名無し募集中。。。」で書き込むときは警告を出さず他の板だと警告を出す
//    && uneiitaCautionByRes(wp) //運営板で書き込むと規制されると予測される場所の場合書き込み時に警告をだす
//    && writeFutabaThread(wp) //ふたばちゃんねるに書き込む
//    && writeBakusaiThread(wp) //爆サイに書き込む
//    && write4chanThread(wp) //4chanに書き込む
//    && exSageThread(wp) // 条件に一致したスレッドをsage指定する
//    && roninLogin(wp, true) // PINKちゃんねる浪人BETAで書き込みする
//    && tensai(wp) //投稿内容を自動的に転載禁止語へ変換する（デフォルトでは嫌儲のみ）
};

function exSageThread(wp)
{
	var patterns = [
		{ word : 'エロゲスレ', board : 'news4vip' }
	];
	for (var i = 0; i < patterns.length; i++) {
		var item = patterns[i];
		if ((String(wp.thread.board.key).indexOf(item.board) >= 0) &&
		    (String(wp.thread.title).indexOf(item.word) >= 0))
		{
			wp.mail.text = 'sage';
		}
	}
	return true;
}

function checkSimilarThread(wp) {
	// ---------------------------------------------------------------
	// [設定] 類似比較で重複と判断する閾値(低いほど文字列一致度が高い)(Default = 2 ※Partの数値が違う程度の一致度)
	var threshold = 2;
	// [設定] キャンセル時に重複スレッドを開く
	var openSimilar = true;
	// [設定] 現在時刻のlimit_msecミリ時間前以前に立ったスレッドは重複判定から除外する(前スレ除外用)(Default = 86400000 １日前)
	var limit_msec = 86400000;
	// ---------------------------------------------------------------
	var bbs = wp.thread.bbs;
	if (bbs.twitter || wp.thread.local) { return true; }
	try {
		var newThreadName = String(wp.title);
		var newThreadNormedName = normalize(newThreadName);
		var oldThreadNormedName = '';
		var matches = newThreadNormedName.match(/\d+/g);
		if (matches != null) {
			var tmp = newThreadNormedName.split(matches[matches.length - 1]);
			var num = parseInt(matches[matches.length - 1]) - 1;
			oldThreadNormedName = tmp.join(num.toString());
		}
		var bd = wp.thread.board;
		var ss = v2c.readURL(bd.url + 'subject.txt');
		if (v2c.interrupted) { return false; }
		if (!ss) { throw 'subject.txtの取得に失敗(' + bd.url +')'; }
		var lines = ss.split('\n');
		var results = [];
		var limit = getMSec(new Date()) - limit_msec;
		for (var i = 0; i < lines.length; i++) {
			if (/^(\d+)\.(?:dat<>|cgi,)(.+) ?\((\d+)\)/.test(lines[i])) {
				var item = {'org' : String(RegExp.$2), 'score' : 9999, 'key' : RegExp.$1};
				var t = parseInt(item.key + '000');
				if (t < limit) { continue; }
				var tmp = normalize(item.org);
				item.score = levenshtein(newThreadNormedName, tmp);
				if (item.score <= threshold) {
					if (oldThreadNormedName === tmp) { continue; }	// パートスレの前スレは除外
					results.push(item);
				}
			}
		}
		if (results.length <= 0) { return true; }
		results.sort(function(a, b) { return a.score - b.score; });
		var mes = '重複の可能性があるスレッドを見つけました。\nタイトル：' + results[0].org + '\nスレ立てする場合は「OK」を押して下さい';
		if (openSimilar) { mes += '\n「キャンセル」を押すと重複スレを開きます'; }
		var post = v2c.confirm(mes);
		if (openSimilar && !post) {
			if (bbs.is2ch || bbs.is2cheq) {
				v2c.openURL('http://' + bd.url.getHost() + '/test/read.cgi/' + bd.key + '/' + results[0].key + '/');
			} else if (bbs.shitaraba) {
				v2c.openURL(bd.url + '/' + results[0].key + '/');
			} else if (bbs.machi) {
				var tmp = String(bd.url).replace(/http:\/\/(\w+\.machi\.to)\/(\w+)\//i, 'http://$1/bbs/read.cgi/$2/' + results[0].key + '/');
				v2c.openURL(tmp);
			}
		}
		return post;
	} catch(e) {
		v2c.println('[post.js : checkSimilarThread()] エラー: ' + e);
		return v2c.confirm('post.jsのスレ立て重複確認の実行に失敗しました。本機能を無視してスレ立てする場合は「OK」を押して下さい');
	}
	function getMSec(date) {
		var yy = date.getYear();
		var mm = date.getMonth();
		var dd = date.getDate();
		if (yy < 2000) { yy +=  1900; }
		return (new Date(yy, mm, dd)).getTime();
	}
	// スレタイの正規化
	function normalize(s1) {
		//カッコを削除
		s1 = s1.replace(/[\[\(\<【（｛＜［《〔][^\]\)\>】）｝」』＞］》〕]+[\]\)\>】）｝＞］》〕]/g, ''); // カッコの種類の「『 はタイトルに使われる場合があるので除外
		//全角英数字を半角に
		s1 = s1.replace(/[！-～]/g, function(s) {
			return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
		});
		//半角英数字をと日本語以外は削除。小文字を大文字に
		s1 = s1.replace(/[^一-龠ぁ-んァ-ヴa-zA-Z0-9\r\n]/ig, '').toUpperCase();

		var hanKana = ['ｶﾞ', 'ｷﾞ', 'ｸﾞ', 'ｹﾞ', 'ｺﾞ', 'ｻﾞ', 'ｼﾞ', 'ｽﾞ', 'ｾﾞ', 'ｿﾞ', 'ﾀﾞ', 'ﾁﾞ', 'ﾂﾞ', 'ﾃﾞ', 'ﾄﾞ', 'ﾊﾞ', 'ﾊﾟ', 'ﾋﾞ', 'ﾋﾟ', 'ﾌﾞ', 'ﾌﾟ', 'ﾍﾞ', 'ﾍﾟ', 'ﾎﾞ', 'ﾎﾟ', 'ｳﾞ',
		'ｧ', 'ｱ', 'ｨ', 'ｲ', 'ｩ', 'ｳ', 'ｪ', 'ｴ', 'ｫ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ', 'ﾀ', 'ﾁ', 'ｯ', 'ﾂ', 'ﾃ', 'ﾄ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ', 'ﾋ', 'ﾌ', 'ﾍ',
		'ﾎ', 'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ', 'ﾓ', 'ｬ', 'ﾔ', 'ｭ', 'ﾕ', 'ｮ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ', 'ﾚ', 'ﾛ', 'ﾜ', 'ﾜ', 'ｦ', 'ﾝ', '｡', '｢', '｣', '､', '･', 'ｰ', 'ﾞ', 'ﾟ'];
		var zenKana = 'ガギグゲゴザジズゼゾダヂヅデドバパビピブプベペボポヴァアィイゥウェエォオカキクケコサシスセソタチッツテトナニヌネノハヒフヘホマミムメモャヤュユョヨラリルレロワワヲン。「」、・ー゛゜';
		var zenHira = 'がぎぐげござじずぜぞだぢづでどばぱびぴぶぷべぺぼぽヴぁあぃいぅうぇえぉおかきくけこさしすせそたちっつてとなにぬねのはひふへほまみむめもゃやゅゆょよらりるれろわわをん。「」、・ー゛゜';
		//全角カタカナひらがなを半角カタカナに
		s1 = s1.replace(/[ぁ-んァ-ヴ「」、・ー゛゜]/g, function(s) {
			var n = zenKana.indexOf(s);
			if (n != -1) { return hanKana[n]; }
			n = zenHira.indexOf(s);
			if (n != -1) { return hanKana[n]; }
			return '';
		});
		return s1;
	}
	// 文字列の類似比較用距離関数
	function levenshtein(s1, s2) {
	    // http://kevin.vanzonneveld.net
	    // +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	    // +            bugfixed by: Onno Marsman
	    // +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
	    // + reimplemented by: Brett Zamir (http://brett-zamir.me)
	    // + reimplemented by: Alexander M Beedie
	    // *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
	    // *                returns 1: 3

	    if (s1 == s2) {
	        return 0;
	    }

	    var s1_len = s1.length;
	    var s2_len = s2.length;
	    if (s1_len === 0) {
	        return s2_len;
	    }
	    if (s2_len === 0) {
	        return s1_len;
	    }

	    // BEGIN STATIC
	    var split = false;
	    try{
	        split=!('0')[0];
	    } catch (e){
	        split=true; // Earlier IE may not support access by string index
	    }
	    // END STATIC
	    if (split){
	        s1 = s1.split('');
	        s2 = s2.split('');
	    }

	    var v0 = new Array(s1_len+1);
	    var v1 = new Array(s1_len+1);

	    var s1_idx=0, s2_idx=0, cost=0;
	    for (s1_idx=0; s1_idx<s1_len+1; s1_idx++) {
	        v0[s1_idx] = s1_idx;
	    }
	    var char_s1='', char_s2='';
	    for (s2_idx=1; s2_idx<=s2_len; s2_idx++) {
	        v1[0] = s2_idx;
	        char_s2 = s2[s2_idx - 1];

	        for (s1_idx=0; s1_idx<s1_len;s1_idx++) {
	            char_s1 = s1[s1_idx];
	            cost = (char_s1 == char_s2) ? 0 : 1;
	            var m_min = v0[s1_idx+1] + 1;
	            var b = v1[s1_idx] + 1;
	            var c = v0[s1_idx] + cost;
	            if (b < m_min) {
	                m_min = b; }
	            if (c < m_min) {
	                m_min = c; }
	            v1[s1_idx+1] = m_min;
	        }
	        var v_tmp = v0;
	        v0 = v1;
	        v1 = v_tmp;
	    }
	    return v0[s1_len];
	}
}

function uneiitaCautionByBoard(wp) {
  var post = true;
  if (wp.thread.bbs.is2ch) {
    /* スレ立て時、特定の板、かつ、スレタイに特定のキーワードが含まれていたら警告する例 */
    if (wp.thread.board.key.match(/^(operate|operatex|sec2ch|sec2chd|saku2ch|saku|sakud)$/) && wp.title.text.match(/(警告|規制|雑談)/)) {
      post = v2c.confirm('運営板で「警告」、「規制」、「雑談」、いずれかのワードが\n含まれているスレタイを立てるとISP規制の対象となります。\n本当にスレ立てを行いますか？');
    }
  }
  return post;
}

function uneiitaCautionByRes(wp) {
  var post = true;
  if (wp.thread.bbs.is2ch) {
    /* 特定の板、かつ、スレタイに特定のキーワードが含まれているスレッドに書き込む場合に警告する例 */
    if (wp.thread.board.key.match(/^(saku2ch|saku)$/) && wp.thread.title.match(/(開示|警告|規制|削除)/)) {
      post = v2c.confirm('運営板への書き込みは妨害とみなされた場合ISP規制の対象となります。\n本当に書き込みを行いますか？');
    }
    /* 特定の板に書き込む場合に警告する例 */
    if (wp.thread.board.key.match(/^(sec2ch)$/)) {
      post = v2c.confirm('運営板への書き込みは妨害とみなされた場合ISP規制の対象となります。\n本当に書き込みを行いますか？');
    }
    /* 特定の板、かつ、★持ちのレスに特定のキーワードが含まれているスレッドに書き込む場合に警告する例 */
    if (wp.thread.board.key.match(/^(operate|operatex|sec2ch|sec2chd|saku2ch|saku|sakud)$/)) {
      for (var i = 0; i < wp.thread.resCount; i++) {
        var res = wp.thread.getRes(i);
        if (res && res.name.match(/★/) && res.message.match(/(警告|規制|雑談)/)) {
          post = v2c.confirm('このスレッドには★持ちから警告が出されています。\n本当に書き込みを行いますか？');
          break;
        }
      }
    }
  }
  return post;
}

function checkMoitaKotehan(wp) {
  var mes = '';
  var bbs = wp.thread.bbs;
  /* 設定 */
  var all = false; //常に有効にする場合 true
  /* 設定ここまで */
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || !bbs.twitter //BBSがtwitter以外の場合
    /* 例ここまで */
    ) {
    var isBlank = wp.name.text.match(/^(!ninja|!denki|!nanja|!kab|!omikuji|!dama)?$/);
    var isNanasi= wp.name.text.match(/^名無し募集中。。。$/);
    var isMoBoard = ('morningcoffee' == wp.thread.board.key);
    if (isMoBoard)  {
      mes = (!isBlank && !isNanasi)? '名前欄が空欄ではありません。\n書き込みを行いますか？' : '';
    } else {
      if (isNanasi) {
        v2c.println('nanasi');
        mes = '名前欄に「名無し募集中。。。」を使用しています。\n書き込みを行いますか？';
      } else if (!isBlank) {
        v2c.println('blank');
        mes = '名前欄が空欄ではありません。\n書き込みを行いますか？';
      }
    }
  }
  return (mes)? v2c.confirm(mes) : true;
}

// 対象文字列のチェック
function checkThStr(str, target) {
  var tlen, i;
  if ((tlen = target.length) > 0) {
    for (i=0; i<tlen; i++) {
      if (str.indexOf(target[i]) > 0) {
        return true;
      }
    }
  }
  return false;
}

function escapeCharRef(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  var title = th.title;
  var ph = java.util.regex.Pattern.compile('&(#?\\w+;)');
  var targetTitle = ['スクリプト','レス表示スタイル'];
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || bbs.is2cheq && url.path == '/v2cj/' && checkThStr(title, targetTitle)//V2C提示版でスレタイが”スクリプト”または”レス表示スタイル”の場合
    /* 例ここまで */
    ) {
    var mh = ph.matcher(wp.message.text);
    if (mh.find() && v2c.confirm('文字参照が含まれています\n文字参照をそのまま表示(&を&amp;に置換)しますか？')){
      if (post) wp.message.text = mh.replaceAll('&amp;$1');
    }
  }
  return post;
};

function replaceh(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  var ph = java.util.regex.Pattern.compile('h(ttps?://)');
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || bbs.is2cheq && url.path == '/v2cj/' //板がV2C提示版の場合
    /* 例ここまで */
    ) {
    var mh = ph.matcher(wp.message.text);
    if (mh.find()){
//      post = v2c.confirm('ｈ抜きを行い書き込みますか？'); //確認する場合は行頭//を削除
      if (post) wp.message.text = mh.replaceAll('&#x68;$1');
    }
  }
  return post;
};

function removeh(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  var ph = java.util.regex.Pattern.compile('h(ttps?://)');
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || !bbs.twitter //BBSがtwitter以外の場合
//    || bbs.is2cheq && url.path == '/v2cj/' //板がV2C提示版の場合
    /* 例ここまで */
    ) {
    var mh = ph.matcher(wp.message.text);
    if (mh.find()){
//      post = v2c.confirm('ｈ抜きを行い書き込みますか？'); //確認する場合は行頭//を削除
      if (post) wp.message.text = mh.replaceAll('$1');
    }
  }
  return post;
};

function replaceTab(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  var title = th.title;
  var ph = java.util.regex.Pattern.compile('\\t');
  var targetTitle = ['ImageViewURLReplace','ReplaceStr','URLExec','スクリプト'];
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || bbs.is2cheq && url.path == '/v2cj/' //板がV2C提示版の場合
    || checkThStr(title, targetTitle)//スレタイが'ImageViewURLReplace','ReplaceStr','URLExec'の場合
    /* 例ここまで */
    ) {
    var mh = ph.matcher(wp.message.text);
    if (mh.find() && v2c.confirm('Tab文字が含まれています\n【TAB】に置換しますか？')){
      if (post) wp.message.text = mh.replaceAll('【TAB】');
    }
  }
  return post;
};

function closeWritePanel(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true ※「設定→書き込み→書き込み後自動で閉じる」と同じ
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || !bbs.twitter //BBSがtwitter以外の場合
    /* 例ここまで */
    ) {
    wp.close();
  }
  return post;
};

function reloadBeforePost(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true
  var lowerBoundSpeed = 0;//スレの勢いの下限
  var upperBoundSpeed = 30000;//スレの勢いの上限　勢い下限と上限の間にあるスレのみ事前更新でチェックしてから書込する
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || (!th.local && !bbs.twitter) //スレッドがローカル板とtwitter以外の場合
    /* 例ここまで */
    ) {
    if (lowerBoundSpeed <= th.speed && th.speed <= upperBoundSpeed) {
      if (th.updateAndWait()) { //更新失敗ならfalseになる→falseの時はそのまま書きこむ
        post = th.newResCount == 0;
      }
    }
  }
  return post;
};

function checkBlankName(wp) {
  /* 設定 */
  var all = false; //常に有効にする場合 true
  /* 設定ここまで */
  
  var post = true;
  var th = wp.thread;
  var bbs = th.bbs;
  var url = th.board.url;
  var ph = java.util.regex.Pattern.compile('^(!ninja|!denki)?$');
  if (
    all
    /* 個別のBBS・板・スレッドなどで有効にしたい場合、下の例を参考に各行頭//を削除するなどしてください  */
//    || bbs.is2ch //BBSが2chの場合
//    || bbs.is2cheq //BBSが2ch互換板の場合
//    || bbs.shitaraba //BBSがしたらばの場合
//    || bbs.machi //BBSがまちBBSの場合
//    || bbs.twitter //BBSがTwitterの場合
//    || th.local //スレッドがローカル板の場合
    || (!th.local && !bbs.twitter) //スレッドがローカル板とtwitter以外の場合
    /* 例ここまで */
    ) {
    var mh = ph.matcher(wp.name.text);
    if (!mh.find() && !v2c.confirm('名前欄が空欄ではありません。\n書き込みを行いますか？')){
      post = false;
    }
  }
  return post;
};


function writeFutabaThread(wp) {
	return (new FutabaWriteForm(wp, impl_mouseListener)).show();
}

function writeBakusaiThread(wp) {
	return (new BakusaiWriteForm(wp, impl_mouseListener)).show();
}

function write4chanThread(wp) {
	return (new B4chanWriteForm(wp, impl_mouseListener)).show();
}

function impl_mouseListener()
{
	this.mouseClicked = function(e) {};
	this.mouseEntered = function(e) {};
	this.mouseExited  = function(e) {};
	this.mousePressed = function(e) {};
	this.mouseReleased= function(e) {
		if (javax.swing.SwingUtilities.isRightMouseButton(e)) {
			var c = e.getSource();
			showPopup(c, e.getX(), e.getY());
			e.consume();
		}
	};
	function showPopup(c, x, y)
	{
		with(JavaImporter(Packages.javax.swing.text.DefaultEditorKit,
				Packages.javax.swing.JPopupMenu, Packages.javax.swing.KeyStroke, java.awt.event.KeyEvent)) {
			var pmenu = new JPopupMenu();
			var am    = c.getActionMap();
			addMenu(pmenu, "切り取り(X)", am.get(DefaultEditorKit.cutAction), 'X', KeyStroke.getKeyStroke(KeyEvent.VK_X, KeyEvent.CTRL_DOWN_MASK));
			addMenu(pmenu, "コピー(C)", am.get(DefaultEditorKit.copyAction), 'C', KeyStroke.getKeyStroke(KeyEvent.VK_C, KeyEvent.CTRL_DOWN_MASK));
			addMenu(pmenu, "貼り付け(V)", am.get(DefaultEditorKit.pasteAction), 'V', KeyStroke.getKeyStroke(KeyEvent.VK_V, KeyEvent.CTRL_DOWN_MASK));
			addMenu(pmenu, "すべて選択(A)", am.get(DefaultEditorKit.selectAllAction), 'A', KeyStroke.getKeyStroke(KeyEvent.VK_A, KeyEvent.CTRL_DOWN_MASK));
			pmenu.show(c, x, y);
		}
	}
	function addMenu(pmenu, text, action, mnemonic, ks)
	{
		if (action != null) {
			var mi = pmenu.add(action);
			if (text != null)  mi.setText(text);
			if (mnemonic != 0) mi.setMnemonic(mnemonic);
			if (ks != null)    mi.setAccelerator(ks);
		}
	}
}

function FutabaWriteForm(wp, mouse)
{
// [設定] ---------------------------------------------
var win64    = false; // windowsを使用していてV2C_x64.exeを使用している場合はtrueにする
// [設定ここまで] -------------------------------------
var v2cexe = (win64) ? 'V2C_x64.exe' : 'V2C.exe';
	var SwingGui = JavaImporter(java.awt,
								java.awt.event,
								Packages.javax.swing,
								Packages.javax.swing.event
								);
	var _wp = wp;
	var frame;
	var nameTextField, delKeyTextField, mailTextField, titleTextField, textArea;
	var attachmentFilePath = null, mimeType = null;
	var attachFlag  = false;
	var titleFlag   = false;
	var nameFlag    = false;
	var initialized = false;
	var thUrl, html;

	function replaceFutabaAnchor()
	{
		/(>>(\d+)(?:-(\d+))?)/.exec(_wp.message);
		var tmp = '';
		if (RegExp.$2.length > 0 && RegExp.$3.length > 0) {
			for (var i = parseInt(RegExp.$2) - 1; i < parseInt(RegExp.$3); i++) {
				var res = v2c.resPane.selectedThread.getRes(i);
				tmp += '>' + res.aux + '\r\n';
			}
			return String(_wp.message.toString()).replace(RegExp.$1, tmp);
		}
		if (RegExp.$3.length == 0 && RegExp.$2.length > 0) {
			var res = v2c.resPane.selectedThread.getRes(RegExp.$2 - 1);
			var aux = res.aux;
			return String(_wp.message.toString()).replace(RegExp.$1,  '>' + aux);
		}
		return _wp.message;
	}
	
	function reply()
	{
		var postUrl = thUrl.replace(/http:\/\/(.+\.2chan\.net)\/(\w+).*/, 'http://$1/$2/futaba.php?guid=on');
		var host =  _wp.thread.url.host;
		var boundary = "ghj39458tu43";
		var url = new java.net.URL(postUrl);
		var conn = url.openConnection();
		with (conn) {
			setDoOutput(true);
			
			var cookie = 'namec=; uuc=1; posttime=' + (new Date()).getTime();
			setRequestProperty("Host", host);
			setRequestProperty("Cookie", cookie);
			setRequestProperty("Referer", thUrl);
			setRequestProperty("Content-Type", "multipart/form-data; boundary=-" + boundary);
			setRequestProperty("User-Agent", "Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1C28 Safari/419.3");
			var matches = [];
			var mode_value = (/<input type=hidden name=mode value="(\w+)">/.test(html)) ? RegExp.$1 : '';
			var maxfsize_value = (/<input type=hidden name="MAX_FILE_SIZE" value="(\d+)">/.test(html)) ? RegExp.$1 : '';
			var hash = (/<input type=hidden id="hash" name="hash" value="([^"]*)">/.test(html)) ? RegExp.$1 : '';
			var isBaseForm = /<input type=hidden id="baseform" name="baseform" value="">/.test(html);
			var resto_value = (/<input type=hidden name=resto value="(\d+)">/.test(html)) ? RegExp.$1 : '';
			var dmode = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getDefaultScreenDevice().getDisplayMode();
			var resolution = dmode.getWidth() + 'x' + dmode.getHeight() + 'x' + dmode.getBitDepth();
			var caco = (function() {
				var caco = (/<script type="text\/javascript" src="(\/bin\/cachemt\d*\.php)">/.test(html)) ? RegExp.$1 : '';
				if (caco) {
					var hr = v2c.createHttpRequest(new java.net.URL('http://' + host + caco));
					var tmp = hr.getContentsAsString();
					caco = (/"([^"]*)"/.test(tmp)) ? RegExp.$1 : '';
				}
				return caco;
			})();
			function putd(boun, name, val) {
				return '---' + boun + '\r\n' +
						'Content-Disposition: form-data; name="' + name + '"\r\n' +
						'\r\n' +
						val + '\r\n';
			}
			
			var data = putd(boundary, 'mode', mode_value) +
					   putd(boundary, 'MAX_FILE_SIZE', maxfsize_value);
			if (isBaseForm) { data += putd(boundary, 'baseform', ''); }

			data += putd(boundary, 'pthb', caco) +
					putd(boundary, 'pthc', caco) +
					putd(boundary, 'pthd', (new Date).getTime().toString()) +
					putd(boundary, 'flvr', '11.9.900') +
					putd(boundary, 'scsz', (function() {
						if (resolution) {
							return resolution;
						} else {
							return '';
						}
					})());
			if (hash) {
				data += putd(boundary, 'hash', hash);
			}
			data += putd(boundary, 'js', 'on');
			
			data += putd(boundary, 'resto', resto_value);
			if (nameFlag) {
				data += putd(boundary, 'name', nameTextField.getText());
			}
			data += putd(boundary, 'email', mailTextField.getText());
			if (titleFlag) {
				data += putd(boundary, 'sub', titleTextField.getText());
			}
			data += putd(boundary, 'com', textArea.getText());
			with (JavaImporter(java.io)) {
				var dos = new DataOutputStream(getOutputStream());
				
				if (attachFlag && attachmentFilePath) {
					var file = new File(attachmentFilePath);
					data += '---' + boundary + '\r\n' +
						'Content-Disposition: form-data; name="upfile"; filename="' + file.getName() + '"\r\n' +
						'Content-Type: ' + mimeType + '\r\n' +
						'\r\n';
					data = new java.lang.String(data);
					buf = data.getBytes("MS932");
					dos.write(buf, 0, buf.length);
					dos.flush();
					var fin = new BufferedInputStream(new FileInputStream(file));
					var buff = 0;
					while ((buff = fin.read()) != -1) {
						dos.write(buff);
					}
					dos.flush();
					fin.close();

					data = '\r\n';
				}

				data += putd(boundary, 'pwd', delKeyTextField.getText());
				data += '---' + boundary + '--\r\n';
				data = new java.lang.String(data);
				var buf = data.getBytes("MS932");
				dos.write(buf, 0, buf.length);
				dos.flush();
				dos.close();
				
				// 削除キーの一時記憶
				v2c.putProperty('_FUTABA_WRITE_FORM_DELKEY_', delKeyTextField.getText());
				try {
					var ins = getInputStream();
					var bReader = new BufferedReader(new InputStreamReader(ins));

					var responseData = null;
					if (getResponseCode() == 200) {
						while ((responseData = bReader.readLine()) != null) {
							v2c.println(responseData);
						}
						var getdatobj = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/system/getdat.js'))));
						var fd = new getdatobj.FUTABAtoDAT();
						var th = wp.thread;
						var dat = fd.exec(th);
						th.importDatBytes(dat.getBytes("MS932"));
						var res = th.getRes(th.localResCount - 1);
						var rl = v2c.getResLabel('書き込み');
						if (rl) { res.setResLabel(rl); }
						var OS = java.lang.System.getProperty("os.name").toLowerCase();
						var path = v2c.appDir;
						if (OS.indexOf('win') >= 0 && path) {
							path += '/' + v2cexe;
							v2c.exec([path, '-c',th.url + th.localResCount]);
						}
					}
					ins.close();
				}
				catch (e) {
					v2c.println('[post.js:FutabaWriteForm():reply()] 画像がアップロード出来ませんでした。再度試みて下さい。');
				}
			}
			
		}
		conn.disconnect();
	}
	
	function createFormPanel()
	{
		with (SwingGui) {
			var p = new JPanel();
			with (p) {
				var gridBagLayout = new GridBagLayout();
				
				gridBagLayout.columnWidths = [119, 83, 83, 83, 112, 83, 0];
				gridBagLayout.rowHeights = [40, 40, 40, 120, 40, 40, 0];
				gridBagLayout.columnWeights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, java.lang.Double.MIN_VALUE];
				gridBagLayout.rowWeights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, java.lang.Double.MIN_VALUE];
				setLayout(gridBagLayout);
				
				if (nameFlag) {
					var nameLabel = new JLabel("\u306A\u307E\u3048");
					nameLabel.setHorizontalAlignment(SwingConstants.TRAILING);
					var gbc_nameLabel = new GridBagConstraints();
					gbc_nameLabel.fill = GridBagConstraints.BOTH;
					gbc_nameLabel.insets = new Insets(0, 0, 5, 5);
					gbc_nameLabel.gridx = 0;
					gbc_nameLabel.gridy = 0;
					add(nameLabel, gbc_nameLabel);
					
					nameTextField = new JTextField();
					nameTextField.setText(_wp.name);
					nameTextField.setColumns(10);
					nameTextField.addMouseListener(new MouseListener(new mouse()));
					var gbc_nameTextField = new GridBagConstraints();
					gbc_nameTextField.fill = GridBagConstraints.HORIZONTAL;
					gbc_nameTextField.insets = new Insets(0, 0, 5, 5);
					gbc_nameTextField.gridwidth = 2;
					gbc_nameTextField.gridx = 1;
					gbc_nameTextField.gridy = 0;
					add(nameTextField, gbc_nameTextField);
				}
				
				var mailLabel = new JLabel("E-Mail");
				mailLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_mailLabel = new GridBagConstraints();
				gbc_mailLabel.fill = GridBagConstraints.BOTH;
				gbc_mailLabel.insets = new Insets(0, 0, 5, 5);
				gbc_mailLabel.gridx = 0;
				gbc_mailLabel.gridy = 1;
				add(mailLabel, gbc_mailLabel);
				
				mailTextField = new JTextField();
				mailTextField.setText(_wp.mail);
				mailTextField.setColumns(10);
				mailTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_mailTextField = new GridBagConstraints();
				gbc_mailTextField.gridwidth = 2;
				gbc_mailTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_mailTextField.insets = new Insets(0, 0, 5, 5);
				gbc_mailTextField.gridx = 1;
				gbc_mailTextField.gridy = 1;
				add(mailTextField, gbc_mailTextField);
				
				if (titleFlag) {
					var titleLabel = new JLabel("\u984C\u540D");
					var gbc_titleLabel = new GridBagConstraints();
					gbc_titleLabel.anchor = GridBagConstraints.EAST;
					gbc_titleLabel.fill = GridBagConstraints.VERTICAL;
					gbc_titleLabel.insets = new Insets(0, 0, 5, 5);
					gbc_titleLabel.gridx = 0;
					gbc_titleLabel.gridy = 2;
					add(titleLabel, gbc_titleLabel);
					
					titleTextField = new JTextField();
					titleTextField.addMouseListener(new MouseListener(new mouse()));
					var gbc_titleTextField = new GridBagConstraints();
					gbc_titleTextField.gridwidth = 2;
					gbc_titleTextField.fill = GridBagConstraints.HORIZONTAL;
					gbc_titleTextField.insets = new Insets(0, 0, 5, 5);
					gbc_titleTextField.gridx = 1;
					gbc_titleTextField.gridy = 2;
					add(titleTextField, gbc_titleTextField);
					titleTextField.setColumns(10);
				}

				var replyButton = new JButton("\u8FD4\u4FE1\u3059\u308B");
				with (replyButton) {
					addActionListener(function(e) {
						setEnabled(false);
						reply();
						frame.dispose();
					});
				}
				var gbc_replyButton = new GridBagConstraints();
				gbc_replyButton.fill = GridBagConstraints.BOTH;
				gbc_replyButton.insets = new Insets(0, 0, 5, 5);
				gbc_replyButton.gridx = 4;
				gbc_replyButton.gridy = 2;
				add(replyButton, gbc_replyButton);
				
				var commentLabel = new JLabel("\u30B3\u30E1\u30F3\u30C8");
				var gbc_commentLabel = new GridBagConstraints();
				gbc_commentLabel.anchor = GridBagConstraints.EAST;
				gbc_commentLabel.fill = GridBagConstraints.VERTICAL;
				gbc_commentLabel.insets = new Insets(0, 0, 5, 5);
				gbc_commentLabel.gridx = 0;
				gbc_commentLabel.gridy = 3;
				add(commentLabel, gbc_commentLabel);
				
				var scrollPane = new JScrollPane();
				var gbc_scrollPane = new GridBagConstraints();
				gbc_scrollPane.gridwidth = 4;
				gbc_scrollPane.fill = GridBagConstraints.BOTH;
				gbc_scrollPane.insets = new Insets(0, 0, 5, 5);
				gbc_scrollPane.gridx = 1;
				gbc_scrollPane.gridy = 3;
				add(scrollPane, gbc_scrollPane);
				
				textArea = new JTextArea();
				textArea.setText(replaceFutabaAnchor());
				textArea.addMouseListener(new MouseListener(new mouse()));
				scrollPane.setViewportView(textArea);

				if (attachFlag) {
					var attachmentLabel = new JLabel("\u6DFB\u4ED8File");
					attachmentLabel.setHorizontalAlignment(SwingConstants.TRAILING);
					var gbc_attachmentLabel = new GridBagConstraints();
					gbc_attachmentLabel.fill = GridBagConstraints.BOTH;
					gbc_attachmentLabel.insets = new Insets(0, 0, 5, 5);
					gbc_attachmentLabel.gridx = 0;
					gbc_attachmentLabel.gridy = 4;
					add(attachmentLabel, gbc_attachmentLabel);

					var viewAttachFileLabel = new JLabel("\u30D5\u30A1\u30A4\u30EB\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
					var gbc_viewAttachFileLabel = new GridBagConstraints();
					gbc_viewAttachFileLabel.gridwidth = 3;
					gbc_viewAttachFileLabel.fill = GridBagConstraints.BOTH;
					gbc_viewAttachFileLabel.insets = new Insets(0, 0, 5, 5);
					gbc_viewAttachFileLabel.gridx = 2;
					gbc_viewAttachFileLabel.gridy = 4;
					add(viewAttachFileLabel, gbc_viewAttachFileLabel);

					var attachmentButton = new JButton("\u53C2\u7167...");
					with(attachmentButton) {
						addActionListener(function(e) {
							var fc = new javax.swing.JFileChooser();
							with (fc) {
								with (JavaImporter(javax.swing.filechooser)) {
									addChoosableFileFilter(new FileNameExtensionFilter("JPEG イメージ", "jpg", "jpeg"));
									addChoosableFileFilter(new FileNameExtensionFilter("GIF イメージ", "gif"));
									addChoosableFileFilter(new FileNameExtensionFilter("PNG イメージ", "png"));
								}
								if (showOpenDialog(frame) == APPROVE_OPTION) {
									var file = getSelectedFile();
									var matches = [];
									if (matches = /\.(gif|jpe?g|png)$/i.exec(file.getName())) {
										var name = file.getName();
										if (name.length() > 50) {
											name = name.substr(0, 40) + '...' + name.substr(-5, 5);
										}
										viewAttachFileLabel.setText(name);
										attachmentFilePath = file.getPath();
										mimeType = 'image/' + matches[1].toLowerCase();
										if (matches[1].toLowerCase() == 'jpg') { mimeType = 'image/jpeg'; }
									} else {
										v2c.println('[post.js: writeFutabaThread] GIF/JPG/PNG以外は添付できません。');
									}
								} else {
									viewAttachFileLabel.setText("\u30D5\u30A1\u30A4\u30EB\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
									attachmentFilePath = '';
									mimeType = 'application/octet-stream';
								}
							}
						});
					}
					var gbc_attachmentButton = new GridBagConstraints();
					gbc_attachmentButton.fill = GridBagConstraints.BOTH;
					gbc_attachmentButton.insets = new Insets(0, 0, 5, 5);
					gbc_attachmentButton.gridx = 1;
					gbc_attachmentButton.gridy = 4;
					add(attachmentButton, gbc_attachmentButton);
				}
				
				var delKeyLabel = new JLabel("\u524A\u9664\u30AD\u30FC");
				delKeyLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_delKeyLabel = new GridBagConstraints();
				gbc_delKeyLabel.fill = GridBagConstraints.BOTH;
				gbc_delKeyLabel.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyLabel.gridx = 0;
				gbc_delKeyLabel.gridy = 5;
				add(delKeyLabel, gbc_delKeyLabel);
				
				delKeyTextField = new JTextField();
				delKeyTextField.setColumns(8);
				delKeyTextField.enableInputMethods(false);
				var gbc_delKeyTextField = new GridBagConstraints();
				gbc_delKeyTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_delKeyTextField.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyTextField.gridx = 1;
				gbc_delKeyTextField.gridy = 5;
				add(delKeyTextField, gbc_delKeyTextField);
				delKeyTextField.setText(v2c.getProperty('_FUTABA_WRITE_FORM_DELKEY_'));
				
				var delKeyDescriptionLabel = new JLabel("(\u524A\u9664\u7528\u3001\u82F1\u6570\u5B57\u3067\uFF18\u5B57\u4EE5\u5185)");
				var gbc_delKeyDescriptionLabel = new GridBagConstraints();
				gbc_delKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_delKeyDescriptionLabel.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyDescriptionLabel.gridx = 2;
				gbc_delKeyDescriptionLabel.gridy = 5;
				add(delKeyDescriptionLabel, gbc_delKeyDescriptionLabel);
			}
			return p;
		}
	}

	this.show = function() {
		if (!initialized) { 
			return true; //true = 既定の書き込み機能を使う
		}
		frame.show();
		_wp.name.text = '';
		_wp.mail.text = '';
		_wp.message.text = '';
		return false; // 既定の書き込み機能をキャンセルする
	};

	if (wp.thread.url.toString().indexOf('2chan') < 0 || wp.thread.url.toString().indexOf('ascii') >= 0) {
		return this;
	}
	thUrl = String(wp.thread.url.toString()).replace(/http:\/\/(.+\.2chan\.net)\/test\/read\.cgi\/(\w+)\/(\d+).*/, function(a, g1, g2, g3) {
		var add = 1000000000;
		return 'http://' + g1 + '/' + g2 + '/res/' + (parseInt(g3) - add) + '.htm';
	});
	html = v2c.createHttpRequest(thUrl).getContentsAsString();
	
	if (html == null) { v2c.println('[post.js : FutabaWriteForm] HTMLの取得失敗。スレッドが寿命で消滅したかもしれません。'); throw '[post.js : FutabaWriteForm] HTMLの取得失敗。スレッドが寿命で消滅したかもしれません。' }
	
	nameFlag   = (html.indexOf('<td><input type=text name=name size="') >= 0);
	titleFlag  = (html.indexOf('<td><input type=text name=sub size="') >= 0);
	attachFlag = (html.indexOf('<td><input type=file name=upfile size="') >= 0);
	
	with (SwingGui) {
		with (frame = JFrame('レス送信モード')) {
			defaultCloseOperation = DISPOSE_ON_CLOSE;
			setSize(new Dimension(550, 380));
			setLayout(new BorderLayout());
			setResizable(false);
			setLocationRelativeTo(null);
			add(new createFormPanel());
		}
	}
	
	initialized = true;
}

function BakusaiWriteForm(wp, mouse)
{
// [設定] ---------------------------------------------
var win64    = false; // windowsを使用していてV2C_x64.exeを使用している場合はtrueにする
// [設定ここまで] -------------------------------------
var v2cexe = (win64) ? 'V2C_x64.exe' : 'V2C.exe';

	var SwingGui = JavaImporter(java.awt,
								java.awt.event,
								Packages.javax.swing,
								Packages.javax.swing.event
								);
	var _wp = wp;
	var frame;
	var nameTextField, delKeyTextField, mailTextField, tripTextField, textArea;
	var thUrl, acode, ctgid, bid, tid, html, title;
	var initialized = false;

	function impl_clickableListener()
	{
		this.mouseClicked = function(e) {
			doClickableMap(e.getX(), e.getY());
		};
		this.mouseEntered = function(e) {};
		this.mouseExited  = function(e) {};
		this.mousePressed = function(e) {};
		this.mouseReleased= function(e) {};
		
		function doClickableMap(x, y) {
			var codes = [
				'E63E','E63F','E640','E641','E642','E643','E644','E645','E646','E647','E648',
				'E649','E64A','E64B','E64C','E64D','E64E','E64F','E650','E651','E652','E653',
				'E654','E655','E656','E657','E658','E659','E65A','E65B','E65C','E65D','E65E',
				'E65F','E660','E661','E662','E663','E664','E665','E666','E667','E668','E669',
				'E66A','E66B','E66C','E66D','E66E','E66F','E670','E671','E672','E673','E674',
				'E675','E676','E677','E678','E679','E67A','E67B','E67C','E67D','E67E','E67F',
				'E680','E681','E682','E683','E684','E685','E686','E687','E688','E689','E68A',
				'E68B','E68C','E68D','E68E','E68F','E690','E691','E692','E693','E694','E695',
				'E696','E697','E698','E699','E69A','E69B','E69C','E69D','E69E','E69F','E6A0',
				'E6A1','E6A2','E6A3','E6A4','E6A5','E6CE','E6CF','E6D0','E6D1','E6D2','E6D3',
				'E6D4','E6D5','E6D6','E6D7','E6D8','E6D9','E6DA','E6DB','E6DC','E6DD','E6DE',
				'E6DF','E6E0','E6E1','E6E2','E6E3','E6E4','E6E5','E6E6','E6E7','E6E8','E6E9',
				'E6EA','E6EB','E70B','E6EC','E6ED','E6EE','E6EF','E6F0','E6F1','E6F2','E6F3',
				'E6F4','E6F5','E6F6','E6F7','E6F8','E6F9','E6FA','E6FB','E6FC','E6FD','E6FE',
				'E6FF','E700','E701','E702','E703','E704','E705','E706','E707','E708','E709',
				'E70A','E6AC','E6AD','E6AE','E6B1','E6B2','E6B3','E6B7','E6B8','E6B9','E6BA',
				'null','null','null','null',
				'E70C','E70D','E70E','E70F','E710','E711','E712','E713','E714','E715','E716',
				'E717','E718','E719','E71A','E71B','E71C','E71D','E71E','E71F','E720','E721',
				'E722','E723','E724','E725','E726','E727','E728','E729','E72A','E72B','E72C',
				'E72D','E72E','E72F','E730','E731','E732','E733','E734','E735','E736','E737',
				'E738','E739','E73A','E73B','E73C','E73D','E73E','E73F','E740','E741','E742',
				'E743','E744','E745','E746','E747','E748','E749','E74A','E74B','E74C','E74D',
				'E74E','E74F','E750','E751','E752','E753','E754','E755','E756','E757'
			];
			var bx1 = 2, by1 = 0, bx2 = 16, by2 = 12;
			var i = 1;
			for (var loop = 0; loop < 257; loop++) {
				if (loop == 176) {
					loop += 5
				}
				bx1 = (loop % 10) * 14 + 2;
				bx2 = (loop % 10) * 14 + 14 + 2;
				by1 = parseInt(loop / 10) * 14;
				by2 = parseInt(loop / 10) * 14 + 12;
				if ((bx1 <= x) && (x < bx2) && (by1 <= y) && (y < by2)) {
					textArea.setText(textArea.getText() + '&#x' + codes[loop] + ';');
					break;
				}
			}
		}
	}

	this.show = function() {
		if (!initialized) { 
			return true; //true = 既定の書き込み機能を使う
		}
		frame.show();
		_wp.name.text = '';
		_wp.mail.text = '';
		_wp.message.text = '';
		return false; // 既定の書き込み機能をキャンセルする
	};

	function reply()
	{
		var postUrl = 'http://bakusai.com/thr_rp1/';
		var boundary = "ghj39458tu43";
		var url = new java.net.URL(postUrl);
		var conn = url.openConnection();
		with (conn) {
			
			setDoOutput(true);
			
			setRequestProperty("Host", 'bakusai.com');
			setRequestProperty("Referer", thUrl);
			setRequestProperty("Content-Type", "multipart/form-data; boundary=-" + boundary);
			setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:25.0) Gecko/20100101 Firefox/25.0");
			var matches = [];
			var prof_flg = (/<input type="hidden" name="prof_flg"\s+value="([^"]+)"/.test(html)) ? RegExp.$1 : '';

			function putd(boun, name, val) {
				return '---' + boun + '\r\n' +
						'Content-Disposition: form-data; name="' + name + '"\r\n' +
						'\r\n' +
						val + '\r\n';
			}
			with (JavaImporter(java.io)) {
				var dos = new DataOutputStream(getOutputStream());
				var data = putd(boundary, 'bid', bid) +
						   putd(boundary, 'tid', tid) +
						   putd(boundary, 'ctgid', ctgid) +
						   putd(boundary, 'acode', acode) +
						   putd(boundary, 'tp', '1') +
						   putd(boundary, 'prof_flg', prof_flg) +
						   putd(boundary, 'name', nameTextField.getText()) +
						   putd(boundary, 'trip_pass', tripTextField.getText()) +
						   putd(boundary, 'mailaddr', mailTextField.getText()) +
						   putd(boundary, 'body', textArea.getText()) +
						   putd(boundary, 'del_path', delKeyTextField.getText());
				data += '---' + boundary + '--\r\n';
				data = new java.lang.String(data);
				var buf = data.getBytes("MS932");
				dos.write(buf, 0, buf.length);
				dos.flush();
				dos.close();
		
				// 削除キーの一時記憶
				v2c.putProperty('_BAKUSAI_WRITE_FORM_DELKEY_', delKeyTextField.getText());
				
				var ins = getInputStream();
				var bReader = new BufferedReader(new InputStreamReader(ins));

				var responseData = null;
				if (200 == getResponseCode() || 302 == getResponseCode()) {
					while ((responseData = bReader.readLine()) != null) {
						v2c.println(responseData);
					}
					java.lang.Thread.sleep(1000);
					var getdatobj = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/system/getdat.js'))));
					var fd = new getdatobj.BAKUSAItoDAT();
					var th = wp.thread;
					var dat = fd.exec(th);
					th.importDatBytes(dat.getBytes("MS932"));
					var res = th.getRes(th.localResCount - 1);
					var rl = v2c.getResLabel('書き込み');
					if (rl) { res.setResLabel(rl); }
					var OS = java.lang.System.getProperty("os.name").toLowerCase();
					var path = v2c.appDir;
					if (OS.indexOf('win') >= 0 && path) {
						path += '/' + v2cexe;
						v2c.exec([path, '-c',th.url + th.localResCount]);
					}
				}
				ins.close();
			}
		}
		conn.disconnect();
	}

	function createFormPanel()
	{
		with (SwingGui) {
			var p = new JPanel();
			with (p) {
				var gridBagLayout = new GridBagLayout();
				gridBagLayout.columnWidths = [75, 83, 83, 83, 112, 83, 0];
				gridBagLayout.rowHeights = [40, 40, 40, 120, 40, 40, 0];
				gridBagLayout.columnWeights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, java.lang.Double.MIN_VALUE];
				gridBagLayout.rowWeights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, java.lang.Double.MIN_VALUE];
				setLayout(gridBagLayout);
				
				var nameLabel = new JLabel("お名前");
				nameLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_nameLabel = new GridBagConstraints();
				gbc_nameLabel.fill = GridBagConstraints.BOTH;
				gbc_nameLabel.insets = new Insets(0, 0, 5, 5);
				gbc_nameLabel.gridx = 0;
				gbc_nameLabel.gridy = 0;
				add(nameLabel, gbc_nameLabel);
				
				nameTextField = new JTextField();
				nameTextField.setText(_wp.name);
				nameTextField.setColumns(10);
				nameTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_nameTextField = new GridBagConstraints();
				gbc_nameTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_nameTextField.insets = new Insets(0, 0, 5, 5);
				gbc_nameTextField.gridwidth = 2;
				gbc_nameTextField.gridx = 1;
				gbc_nameTextField.gridy = 0;
				add(nameTextField, gbc_nameTextField);
				
				var nameKeyDescriptionLabel = new JLabel("(全角8文字まで)");
				var gbc_nameKeyDescriptionLabel = new GridBagConstraints();
				gbc_nameKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_nameKeyDescriptionLabel.insets = new Insets(0, 0, 0, 5);
				gbc_nameKeyDescriptionLabel.gridx = 3;
				gbc_nameKeyDescriptionLabel.gridy = 0;
				add(nameKeyDescriptionLabel, gbc_nameKeyDescriptionLabel);
				
				var mailLabel = new JLabel("E-Mail");
				mailLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_mailLabel = new GridBagConstraints();
				gbc_mailLabel.fill = GridBagConstraints.BOTH;
				gbc_mailLabel.insets = new Insets(0, 0, 5, 5);
				gbc_mailLabel.gridx = 0;
				gbc_mailLabel.gridy = 1;
				add(mailLabel, gbc_mailLabel);
				
				mailTextField = new JTextField();
				mailTextField.setText(_wp.mail);
				mailTextField.setColumns(10);
				mailTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_mailTextField = new GridBagConstraints();
				gbc_mailTextField.gridwidth = 2;
				gbc_mailTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_mailTextField.insets = new Insets(0, 0, 5, 5);
				gbc_mailTextField.gridx = 1;
				gbc_mailTextField.gridy = 1;
				add(mailTextField, gbc_mailTextField);
				
				var tripLabel = new JLabel("トリップ");
				var gbc_tripLabel = new GridBagConstraints();
				gbc_tripLabel.anchor = GridBagConstraints.EAST;
				gbc_tripLabel.fill = GridBagConstraints.VERTICAL;
				gbc_tripLabel.insets = new Insets(0, 0, 5, 5);
				gbc_tripLabel.gridx = 0;
				gbc_tripLabel.gridy = 2;
				add(tripLabel, gbc_tripLabel);
				
				tripTextField = new JTextField();
				tripTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_tripTextField = new GridBagConstraints();
				gbc_tripTextField.gridwidth = 2;
				gbc_tripTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_tripTextField.insets = new Insets(0, 0, 5, 5);
				gbc_tripTextField.gridx = 1;
				gbc_tripTextField.gridy = 2;
				add(tripTextField, gbc_tripTextField);
				tripTextField.setColumns(10);

				var tripKeyDescriptionLabel = new JLabel("(全角8文字まで)");
				var gbc_tripKeyDescriptionLabel = new GridBagConstraints();
				gbc_tripKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_tripKeyDescriptionLabel.insets = new Insets(0, 0, 0, 5);
				gbc_tripKeyDescriptionLabel.gridx = 3;
				gbc_tripKeyDescriptionLabel.gridy = 2;
				add(tripKeyDescriptionLabel, gbc_tripKeyDescriptionLabel);

				var replyButton = new JButton("同意して投稿する");
				with (replyButton) {
					addActionListener(function(e) {
						setEnabled(false);
						reply();
						frame.dispose();
					});
				}
				var gbc_replyButton = new GridBagConstraints();
				gbc_replyButton.fill = GridBagConstraints.BOTH;
				gbc_replyButton.insets = new Insets(0, 0, 5, 5);
				gbc_replyButton.gridx = 4;
				gbc_replyButton.gridy = 2;
				add(replyButton, gbc_replyButton);
				
				var commentLabel = new JLabel("コメント");
				var gbc_commentLabel = new GridBagConstraints();
				gbc_commentLabel.anchor = GridBagConstraints.EAST;
				gbc_commentLabel.fill = GridBagConstraints.VERTICAL;
				gbc_commentLabel.insets = new Insets(0, 0, 5, 5);
				gbc_commentLabel.gridx = 0;
				gbc_commentLabel.gridy = 3;
				add(commentLabel, gbc_commentLabel);
				
				var scrollPane = new JScrollPane();
				var gbc_scrollPane = new GridBagConstraints();
				gbc_scrollPane.gridwidth = 4;
				gbc_scrollPane.fill = GridBagConstraints.BOTH;
				gbc_scrollPane.insets = new Insets(0, 0, 5, 5);
				gbc_scrollPane.gridx = 1;
				gbc_scrollPane.gridy = 3;
				add(scrollPane, gbc_scrollPane);
				
				textArea = new JTextArea();
				textArea.setText(_wp.message);
				textArea.getDocument().addDocumentListener(new DocumentListener() {
					changedUpdate: function(e) {},
					insertUpdate: function(e) { 
						var t = new java.lang.String(textArea.getText());
						var len = (1500 - t.getBytes("MS932").length) / 2;
						bodyKeyDescriptionLabel.setText("<html>(全角750文字まで:残り<font color=red><b>全角" + len + "文字</b></font>)<br>掲示板あらし行為、URLの記載は一回で書込み禁止措置と致します。</html>");
					 },
					removeUpdate: function(e) {
						var t = new java.lang.String(textArea.getText());
						var len = (1500 - t.getBytes("MS932").length) / 2;
						bodyKeyDescriptionLabel.setText("<html>(全角750文字まで:残り<font color=red><b>全角" + len + "文字</b></font>)<br>掲示板あらし行為、URLの記載は一回で書込み禁止措置と致します。</html>");
					}
				});
				textArea.addMouseListener(new MouseListener(new mouse()));
				scrollPane.setViewportView(textArea);

				var bodyKeyDescriptionLabel = new JLabel("<html>(全角750文字まで:残り<font color=red><b>全角750文字</b></font>)<br>掲示板あらし行為、URLの記載は一回で書込み禁止措置と致します。</html>");
				bodyKeyDescriptionLabel.setVerticalAlignment(SwingConstants.TOP);
				var gbc_bodyKeyDescriptionLabel = new GridBagConstraints();
				gbc_bodyKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_bodyKeyDescriptionLabel.insets = new Insets(0, 0, 0, 5);
				gbc_bodyKeyDescriptionLabel.gridwidth = 4;
				gbc_bodyKeyDescriptionLabel.gridx = 1;
				gbc_bodyKeyDescriptionLabel.gridy = 4;
				add(bodyKeyDescriptionLabel, gbc_bodyKeyDescriptionLabel);

				var delKeyLabel = new JLabel("削除パス");
				delKeyLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_delKeyLabel = new GridBagConstraints();
				gbc_delKeyLabel.fill = GridBagConstraints.BOTH;
				gbc_delKeyLabel.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyLabel.gridx = 0;
				gbc_delKeyLabel.gridy = 5;
				add(delKeyLabel, gbc_delKeyLabel);
				
				delKeyTextField = new JTextField();
				delKeyTextField.setColumns(8);
				delKeyTextField.enableInputMethods(false);
				var gbc_delKeyTextField = new GridBagConstraints();
				gbc_delKeyTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_delKeyTextField.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyTextField.gridx = 1;
				gbc_delKeyTextField.gridy = 5;
				add(delKeyTextField, gbc_delKeyTextField);
				
				delKeyTextField.setText(v2c.getProperty('_BAKUSAI_WRITE_FORM_DELKEY_'));
				
				var delKeyDescriptionLabel = new JLabel("(半角英数4文字)");
				var gbc_delKeyDescriptionLabel = new GridBagConstraints();
				gbc_delKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_delKeyDescriptionLabel.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyDescriptionLabel.gridx = 2;
				gbc_delKeyDescriptionLabel.gridy = 5;
				add(delKeyDescriptionLabel, gbc_delKeyDescriptionLabel);
				var icon = new ImageIcon(v2c.saveDir + "\\script\\system\\emojiPallet.jpg");
				var emoji = new JLabel(icon);
				emoji.addMouseListener(new MouseListener(new impl_clickableListener()));

				var gbc_EmojiKeyDescriptionLabel = new GridBagConstraints();
				gbc_EmojiKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_EmojiKeyDescriptionLabel.insets = new Insets(10, 10, 0, 5);
				gbc_EmojiKeyDescriptionLabel.gridx = 5;
				gbc_EmojiKeyDescriptionLabel.gridheight = 6;
				gbc_EmojiKeyDescriptionLabel.gridy = 0;
				add(emoji, gbc_EmojiKeyDescriptionLabel);
			}
			return p;
		}
	}
	if (wp.thread.url.toString().indexOf('bakusai') < 0) {
		return this;
	}

	thUrl = String(wp.thread.url.toString()).replace(/^http:\/\/bakusai\.com\/test\/read.cgi\/a(\d+)c(\d+)b(\d+)\/(\d+)\/.*/, function(a, g1, g2, g3, g4) {
		var add = 1000000000;
		acode = g1;
		ctgid = g2;
		bid = g3;
		tid = parseInt(g4) - add;
		return 'http://bakusai.com/thr_res/acode=' + g1 + '/ctgid=' + g2 + '/bid=' + g3 + '/tid=' + (parseInt(g4) - add) + '/';
	});
	html = v2c.createHttpRequest(thUrl).getContentsAsString();
	if (html == null) { v2c.println('[post.js : BakusaiWriteForm] HTMLの取得失敗。処理を中止します。'); throw '[post.js : BakusaiWriteForm] HTMLの取得失敗。処理を中止します。'; }
	
	title = (/<title>([\S\s]+?) - /.test(html)) ? RegExp.$1 : '';
	
	with (SwingGui) {
		with (frame = JFrame('『' + title + '』へのレス投稿')) {
			defaultCloseOperation = DISPOSE_ON_CLOSE;
			setSize(new Dimension(650, 420));
			setLayout(new BorderLayout());
			setResizable(false);
			setLocationRelativeTo(null);
			add(new createFormPanel());
		}
	}
	initialized = true;
}

function B4chanWriteForm(wp, mouse)
{
// [設定] ---------------------------------------------
var win64    = false; // windowsを使用していてV2C_x64.exeを使用している場合はtrueにする
// [設定ここまで] -------------------------------------
var v2cexe = (win64) ? 'V2C_x64.exe' : 'V2C.exe';

	var SwingGui = JavaImporter(java.awt,
								java.awt.event,
								Packages.javax.swing,
								Packages.javax.swing.event,
								javax.swing.border
								);
	var _wp = wp;
	var frame;
	var nameTextField, delKeyTextField, mailTextField, titleTextField, capreqKeyTextField, textArea;
	var attachmentFilePath = null, mimeType = null;
	var attachFlag  = false;
	var initialized = false;
	var replyButton = null, capLabel = null;
	var capUrl = null, capCField = null;
	var thUrl, host, server, thkey, html, cookie;

	function cookieGen(c)
	{
       return (c.match('(__cfduid=[^;]+?;)')) ? RegExp.$1 : '';
	}
	
	function challengeRecaptcha()
	{
		var hr = v2c.createHttpRequest(capUrl, '&recaptcha_challenge_field=' + capCField +
				 '&recaptcha_response_field=' + String(capreqKeyTextField.getText()).replace(/\s/g, ''));
		var tmp = hr.getContentsAsString();
		if (/<textarea rows="5" cols="100">([^<]+)<\/textarea>/.exec(tmp)) {
			var genecode = RegExp.$1;
			
			if (genecode.length > 0) {
				return genecode;
			}
		}
		return null;
	}
	
	function getRecaptcha()
	{
		var u = 'http:' + html.split('<iframe src="')[1].split('" height')[0];
		var hr = v2c.createHttpRequest(u);
		var tmp = String(hr.getContentsAsString());
		if (!tmp) throw 'reCAPTHCAのWebページが取得出来ませんでした。';
		var matches = [];
		var cfield = '';
		if (matches = /id="recaptcha_challenge_field" value="([^"]+?)"/.exec(tmp)) {
			cfield = matches[1];
		}
		var imgurl = '';
		if (matches = /alt="" src="([^"]+?)"/.exec(tmp)) {
			imgurl = 'http://www.google.com/recaptcha/api/' + matches[1];
		}

		hr = v2c.createHttpRequest(imgurl);
		var img = hr.getContentsAsBytes();
		var icon = new javax.swing.ImageIcon(img);
		if (!icon) throw 'reCAPTCHA画像ファイルが取得出来ませんでした。';
		velifyUrl = u;
		return {recaptcha_challenge_field: cfield, url: velifyUrl, obj: icon};
	}
	
	function replace4chanAnchor()
	{
		/(>>(\d+)(?:-(\d+))?)/.exec(_wp.message);
		var tmp = '';
		if (RegExp.$2.length > 0 && RegExp.$3.length > 0) {
			for (var i = parseInt(RegExp.$2) - 1; i < parseInt(RegExp.$3); i++) {
				var res = v2c.resPane.selectedThread.getRes(i);
				tmp += '>>' + res.aux.substring(3); + '\r\n';
			}
			return String(_wp.message.toString()).replace(RegExp.$1, tmp);
		}
		if (RegExp.$3.length == 0 && RegExp.$2.length > 0) {
			var res = v2c.resPane.selectedThread.getRes(RegExp.$2 - 1);
			var aux = res.aux.substring(3);
			return String(_wp.message.toString()).replace(RegExp.$1,  '>>' + aux);
		}
		return _wp.message;
	}
	
	function reply()
	{
	
		var genecode = challengeRecaptcha();
		if (!genecode) {
			return false;
		}
		var postUrl = 'https://sys.4chan.org/' + server + '/post';
		var boundary = "ghj39458tu43";
		v2c.println(postUrl);
		var url = new java.net.URL(postUrl);
		var conn = url.openConnection();
		
		with (conn) {
			setDoOutput(true);
			setRequestProperty("Host", url.host);
			setRequestProperty("Cookie", cookie);
			setRequestProperty("Referer", 'http://boards.4chan.org/' + server + '/res/' + thkey);
			setRequestProperty("Content-Type", "multipart/form-data; boundary=-" + boundary);
			setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:26.0) Gecko/20100101 Firefox/26.0");
			var matches = [];
			
			var mode_value = (/<input type="hidden" name="mode" value="(\w+)">/.test(html)) ? RegExp.$1 : '';
			var maxfsize_value = (/<input type="hidden" name="MAX_FILE_SIZE" value="(\d+)">/.test(html)) ? RegExp.$1 : '';
			var resto_value = (/<input type="hidden" name="resto" value="(\d+)">/.test(html)) ? RegExp.$1 : '';

			function putd(boun, name, val) {
				return '---' + boun + '\r\n' +
						'Content-Disposition: form-data; name="' + name + '"\r\n' +
						'\r\n' +
						val + '\r\n';
			}

			var data = putd(boundary, 'MAX_FILE_SIZE', maxfsize_value) +
					   putd(boundary, 'mode', mode_value) +
					   putd(boundary, 'resto', resto_value) +
					   putd(boundary, 'recaptcha_challenge_field', genecode) +
					   putd(boundary, 'recaptcha_response_field', 'manual_challenge');
			
			var tmp = (nameTextField.getText()) ? String(nameTextField.getText()) : '';
			data += putd(boundary, 'name', tmp);
			tmp = (mailTextField.getText()) ? String(mailTextField.getText()) : '';
			data += putd(boundary, 'email', tmp);
			tmp = (titleTextField.getText()) ? String(titleTextField.getText()) : '';
			data += putd(boundary, 'sub', tmp);
			data += putd(boundary, 'com', textArea.getText());

			with (JavaImporter(java.io)) {
				var dos = new DataOutputStream(getOutputStream());
				if (attachmentFilePath) {
					var file = new File(attachmentFilePath);
					data += '---' + boundary + '\r\n' +
						'Content-Disposition: form-data; name="upfile"; filename="' + file.getName() + '"\r\n' +
						'Content-Type: ' + mimeType + '\r\n' +
						'\r\n';
					data = new java.lang.String(data);
					buf = data.getBytes("UTF-8");
					dos.write(buf, 0, buf.length);
					var fin = new BufferedInputStream(new FileInputStream(file));
					var buff = 0;
					while ((buff = fin.read()) != -1) {
						dos.write(buff);
						dos.flush();
					}
					dos.flush();
					fin.close();

					data = '\r\n';
				}
				
				tmp = (delKeyTextField.getText()) ? String(delKeyTextField.getText()) : '';
				data += putd(boundary, 'pwd', tmp);
				data += '---' + boundary + '--\r\n';
				data = new java.lang.String(data);
				var buf = data.getBytes("UTF-8");
				dos.write(buf, 0, buf.length);
				dos.flush();
				dos.close();
				
				// 削除キーの一時記憶
				v2c.putProperty('_4CHAN_WRITE_FORM_DELKEY_', delKeyTextField.getText());
				
				var ins = getInputStream();
				var bReader = new BufferedReader(new InputStreamReader(ins));

				var responseData = null;
				if (getResponseCode() == 200) {
					while ((responseData = bReader.readLine()) != null) {
						v2c.println(responseData);
					}
					var getdatobj = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/system/getdat.js'))));
					var fd = new getdatobj.B4CHANtoDAT();
					var th = wp.thread;
					var dat = fd.exec(th);
					th.importDatBytes(dat.getBytes("MS932"));
					
					var res = th.getRes(th.localResCount - 1);
					var rl = v2c.getResLabel('書き込み');
					if (rl) { res.setResLabel(rl); }
					var OS = java.lang.System.getProperty("os.name").toLowerCase();
					var path = v2c.appDir;
					if (OS.indexOf('win') >= 0 && path) {
						path += '/' + v2cexe;
						v2c.exec([path, '-c',th.url + th.localResCount]);
					}
				}
				ins.close();
				
			}
			
		}
		conn.disconnect();
		frame.dispose();
		return true;
	}
	function createFormPanel()
	{
		with (SwingGui) {
			var p = new JPanel();
			with (p) {
				var gridBagLayout = new GridBagLayout();
				
				gridBagLayout.columnWidths = [119, 83, 83, 83, 112, 83, 0];
				gridBagLayout.rowHeights = [40, 40, 40, 120, 45, 40, 40, 40, 0];
				gridBagLayout.columnWeights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, java.lang.Double.MIN_VALUE];
				gridBagLayout.rowWeights = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, java.lang.Double.MIN_VALUE];
				setLayout(gridBagLayout);

				var nameLabel = new JLabel("名前");
				nameLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_nameLabel = new GridBagConstraints();
				gbc_nameLabel.fill = GridBagConstraints.BOTH;
				gbc_nameLabel.insets = new Insets(0, 0, 5, 5);
				gbc_nameLabel.gridx = 0;
				gbc_nameLabel.gridy = 0;
				add(nameLabel, gbc_nameLabel);

				nameTextField = new JTextField();
				nameTextField.setColumns(10);
				nameTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_nameTextField = new GridBagConstraints();
				gbc_nameTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_nameTextField.insets = new Insets(0, 0, 5, 5);
				gbc_nameTextField.gridwidth = 2;
				gbc_nameTextField.gridx = 1;
				gbc_nameTextField.gridy = 0;
				add(nameTextField, gbc_nameTextField);
				if (html.indexOf('data-type="Name"') < 0) {
					nameTextField.setEnabled(false);
				} else {
					nameTextField.setText(_wp.name);
				}
			
				var mailLabel = new JLabel("E-Mail");
				mailLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_mailLabel = new GridBagConstraints();
				gbc_mailLabel.fill = GridBagConstraints.BOTH;
				gbc_mailLabel.insets = new Insets(0, 0, 5, 5);
				gbc_mailLabel.gridx = 0;
				gbc_mailLabel.gridy = 1;
				add(mailLabel, gbc_mailLabel);
				
				mailTextField = new JTextField();
				mailTextField.setColumns(10);
				mailTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_mailTextField = new GridBagConstraints();
				gbc_mailTextField.gridwidth = 2;
				gbc_mailTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_mailTextField.insets = new Insets(0, 0, 5, 5);
				gbc_mailTextField.gridx = 1;
				gbc_mailTextField.gridy = 1;
				add(mailTextField, gbc_mailTextField);
				if (html.indexOf('data-type="E-mail"') < 0) {
					mailTextField.setEnabled(false);
				} else {
					mailTextField.setText(_wp.mail);
				}
				
				var titleLabel = new JLabel("\u984C\u540D");
				var gbc_titleLabel = new GridBagConstraints();
				gbc_titleLabel.anchor = GridBagConstraints.EAST;
				gbc_titleLabel.fill = GridBagConstraints.VERTICAL;
				gbc_titleLabel.insets = new Insets(0, 0, 5, 5);
				gbc_titleLabel.gridx = 0;
				gbc_titleLabel.gridy = 2;
				add(titleLabel, gbc_titleLabel);
				
				titleTextField = new JTextField();
				titleTextField.addMouseListener(new MouseListener(new mouse()));
				var gbc_titleTextField = new GridBagConstraints();
				gbc_titleTextField.gridwidth = 2;
				gbc_titleTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_titleTextField.insets = new Insets(0, 0, 5, 5);
				gbc_titleTextField.gridx = 1;
				gbc_titleTextField.gridy = 2;
				add(titleTextField, gbc_titleTextField);
				titleTextField.setColumns(10);
				if (html.indexOf('data-type="Subject"') < 0) {
					titleTextField.setEnabled(false);
				}

				replyButton = new JButton("\u8FD4\u4FE1\u3059\u308B");
				with (replyButton) {
					addActionListener(function(e) {
						setEnabled(false);
						var result = reply();
						if (!result) {
							setEnabled(true);
							var reqObj = getRecaptcha();
							capLabel.setIcon(reqObj.obj);
							capCField = reqObj.recaptcha_challenge_field;
						}
					});
				}
				var gbc_replyButton = new GridBagConstraints();
				gbc_replyButton.fill = GridBagConstraints.BOTH;
				gbc_replyButton.insets = new Insets(0, 0, 5, 5);
				gbc_replyButton.gridx = 4;
				gbc_replyButton.gridy = 2;
				add(replyButton, gbc_replyButton);
				
				var commentLabel = new JLabel("\u30B3\u30E1\u30F3\u30C8");
				var gbc_commentLabel = new GridBagConstraints();
				gbc_commentLabel.anchor = GridBagConstraints.EAST;
				gbc_commentLabel.fill = GridBagConstraints.VERTICAL;
				gbc_commentLabel.insets = new Insets(0, 0, 5, 5);
				gbc_commentLabel.gridx = 0;
				gbc_commentLabel.gridy = 3;
				add(commentLabel, gbc_commentLabel);
				
				var scrollPane = new JScrollPane();
				var gbc_scrollPane = new GridBagConstraints();
				gbc_scrollPane.gridwidth = 4;
				gbc_scrollPane.fill = GridBagConstraints.BOTH;
				gbc_scrollPane.insets = new Insets(0, 0, 5, 5);
				gbc_scrollPane.gridx = 1;
				gbc_scrollPane.gridy = 3;
				add(scrollPane, gbc_scrollPane);
				
				textArea = new JTextArea();
				textArea.setText(replace4chanAnchor());
				textArea.addMouseListener(new MouseListener(new mouse()));
				scrollPane.setViewportView(textArea);

				var attachmentLabel = new JLabel("\u6DFB\u4ED8File");
				attachmentLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_attachmentLabel = new GridBagConstraints();
				gbc_attachmentLabel.fill = GridBagConstraints.BOTH;
				gbc_attachmentLabel.insets = new Insets(0, 0, 5, 5);
				gbc_attachmentLabel.gridx = 0;
				gbc_attachmentLabel.gridy = 4;
				add(attachmentLabel, gbc_attachmentLabel);

				var viewAttachFileLabel = new JLabel("\u30D5\u30A1\u30A4\u30EB\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
				var gbc_viewAttachFileLabel = new GridBagConstraints();
				gbc_viewAttachFileLabel.gridwidth = 3;
				gbc_viewAttachFileLabel.fill = GridBagConstraints.BOTH;
				gbc_viewAttachFileLabel.insets = new Insets(0, 0, 5, 5);
				gbc_viewAttachFileLabel.gridx = 2;
				gbc_viewAttachFileLabel.gridy = 4;
				add(viewAttachFileLabel, gbc_viewAttachFileLabel);

				var attachmentButton = new JButton("\u53C2\u7167...");
				with(attachmentButton) {
					addActionListener(function(e) {
						var fc = new javax.swing.JFileChooser();

						with (fc) {
							with (JavaImporter(javax.swing.filechooser)) {
								addChoosableFileFilter(new FileNameExtensionFilter("JPEG イメージ", "jpg", "jpeg"));
								addChoosableFileFilter(new FileNameExtensionFilter("GIF イメージ", "gif"));
								addChoosableFileFilter(new FileNameExtensionFilter("PNG イメージ", "png"));
							}
							if (showOpenDialog(frame) == APPROVE_OPTION) {
								var file = getSelectedFile();
								var matches = [];
								if (matches = /\.(gif|jpe?g|png)$/i.exec(file.getName())) {
									var name = file.getName();
									if (name.length() > 50) {
										name = name.substr(0, 40) + '...' + name.substr(-5, 5);
									}
									viewAttachFileLabel.setText(name);
									attachmentFilePath = file.getPath();
									mimeType = 'image/' + matches[1].toLowerCase();
									if (matches[1].toLowerCase() == 'jpg') { mimeType = 'image/jpeg'; }
								} else {
									v2c.println('[post.js: writeFutabaThread] GIF/JPG/PNG以外は添付できません。');
								}
							} else {
								viewAttachFileLabel.setText("\u30D5\u30A1\u30A4\u30EB\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
								attachmentFilePath = '';
								mimeType = 'application/octet-stream';
							}
						}
					});
				}
				var gbc_attachmentButton = new GridBagConstraints();
				gbc_attachmentButton.fill = GridBagConstraints.BOTH;
				gbc_attachmentButton.insets = new Insets(0, 0, 5, 5);
				gbc_attachmentButton.gridx = 1;
				gbc_attachmentButton.gridy = 4;
				add(attachmentButton, gbc_attachmentButton);
				if (html.indexOf('data-type="File"') < 0) {
					attachmentButton.setEnabled(false);
				}

				var capreqKeyLabel = new JLabel("Verification");
				capreqKeyLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_capreqKeyLabel = new GridBagConstraints();
				gbc_capreqKeyLabel.fill = GridBagConstraints.HORIZONTAL;
				gbc_capreqKeyLabel.insets = new Insets(0, 0, 0, 5);
				gbc_capreqKeyLabel.gridheight = 2;
				gbc_capreqKeyLabel.gridx = 0;
				gbc_capreqKeyLabel.gridy = 5;
				add(capreqKeyLabel, gbc_capreqKeyLabel);
				
				capLabel = new JLabel();
				capLabel.setBorder(new LineBorder(Color.LIGHT_GRAY));
				capLabel.setToolTipText("Reload");
				capLabel.addMouseListener(new MouseListener({
					mouseClicked : function(e) {
						var capObj = getRecaptcha();
						capCField = capObj.recaptcha_challenge_field;
						capLabel.setIcon(capObj.obj);
						e.consume();
					},
					mouseEntered : function(e) {},
					mouseExited  : function(e) {},
					mousePressed : function(e) {},
					mouseReleased: function(e) {}
				}));
				var capObj = getRecaptcha();
				capUrl  = capObj.url;
				capCField = capObj.recaptcha_challenge_field;

				capLabel.setIcon(capObj.obj);
				var gbc_capLabel = new GridBagConstraints();
				gbc_capLabel.fill = GridBagConstraints.NONE;
				gbc_capLabel.insets = new Insets(10, 0, 5, 5);
				gbc_capLabel.anchor = GridBagConstraints.SOUTHWEST;
				gbc_capLabel.gridwidth = 3;
				gbc_capLabel.gridx = 1;
				gbc_capLabel.gridy = 5;
				add(capLabel, gbc_capLabel);
				
				capreqKeyTextField = new JTextField();
				capreqKeyTextField.setColumns(8);
				capreqKeyTextField.enableInputMethods(false);
				var gbc_capreqKeyTextField = new GridBagConstraints();
				gbc_capreqKeyTextField.fill = GridBagConstraints.BOTH;
				gbc_capreqKeyTextField.insets = new Insets(0, 0, 15, 5);
				gbc_capreqKeyTextField.gridwidth = 2;
				gbc_capreqKeyTextField.gridx = 1;
				gbc_capreqKeyTextField.gridy = 6;
				add(capreqKeyTextField, gbc_capreqKeyTextField);

				var delKeyLabel = new JLabel("\u524A\u9664\u30AD\u30FC");
				delKeyLabel.setHorizontalAlignment(SwingConstants.TRAILING);
				var gbc_delKeyLabel = new GridBagConstraints();
				gbc_delKeyLabel.fill = GridBagConstraints.BOTH;
				gbc_delKeyLabel.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyLabel.gridx = 0;
				gbc_delKeyLabel.gridy = 7;
				add(delKeyLabel, gbc_delKeyLabel);
				
				delKeyTextField = new JTextField();
				delKeyTextField.setColumns(8);
				delKeyTextField.enableInputMethods(false);
				var gbc_delKeyTextField = new GridBagConstraints();
				gbc_delKeyTextField.fill = GridBagConstraints.HORIZONTAL;
				gbc_delKeyTextField.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyTextField.gridx = 1;
				gbc_delKeyTextField.gridy = 7;
				add(delKeyTextField, gbc_delKeyTextField);
				delKeyTextField.setText(v2c.getProperty('_4CHAN_WRITE_FORM_DELKEY_'));
				
				var delKeyDescriptionLabel = new JLabel("(\u524A\u9664\u7528\u3001\u82F1\u6570\u5B57\u3067\uFF18\u5B57\u4EE5\u5185)");
				var gbc_delKeyDescriptionLabel = new GridBagConstraints();
				gbc_delKeyDescriptionLabel.fill = GridBagConstraints.BOTH;
				gbc_delKeyDescriptionLabel.insets = new Insets(0, 0, 0, 5);
				gbc_delKeyDescriptionLabel.gridx = 2;
				gbc_delKeyDescriptionLabel.gridy = 7;
				add(delKeyDescriptionLabel, gbc_delKeyDescriptionLabel);
			}
			return p;
		}
	}

	this.show = function() {
		if (!initialized)
			return true; //true = 既定の書き込み機能を使う
		frame.show();
		_wp.name.text = '';
		_wp.mail.text = '';
		_wp.message.text = '';
		return false; // 既定の書き込み機能をキャンセルする
	};

	if (wp.thread.url.toString().indexOf('4chan') < 0 || wp.thread.url.toString().indexOf('dis.4chan.org') >= 0) {
		return this;
	}
	if (/http:\/\/(.+\.4chan\.org)\/test\/read.cgi\/(\w+)\/(\d+).*/.exec(String(_wp.thread.url.toString()))) {
		host = RegExp.$1;
		server = RegExp.$2;
		thkey = RegExp.$3;
		var add = 1000000000;
		thUrl = 'http://' + host + '/' + server + '/res/' + (parseInt(thkey) - add);
	}

	{
		var hr = v2c.createHttpRequest(thUrl);
		html = hr.getContentsAsString();
		if (html == null) { v2c.println('[post.js : B4chanWriteForm] HTMLの取得失敗。スレッドが寿命で消滅したかもしれません。'); throw '[post.js : B4chanWriteForm] HTMLの取得失敗。スレッドが寿命で消滅したかもしれません。' }
		var c = hr.getResponseHeader('Set-Cookie');
		if (c)
			cookie = cookieGen(c);
	}

	with (SwingGui) {
		with (frame = JFrame('レス送信モード')) {
			defaultCloseOperation = DISPOSE_ON_CLOSE;
			setSize(new Dimension(550, 480));
			setLayout(new BorderLayout());
			setResizable(false);
			setLocationRelativeTo(null);
			add(new createFormPanel());
		}
	}
	initialized = true;
}

function roninLogin(wp, isRes)
{
	if ((String(wp.thread.url)).indexOf('bbspink') < 0) { return true; }

	// ---- [ログイン情報] --------------------------

	var userEmail = '';
	var secretKey = '';
	
	// [設定]書き込みの後書き込み欄を閉じる場合は true 、閉じない場合は false
	var setCloseAfterWrite = false;

	// ---- [初期認証] ------------------------------

	var session = v2c.getScriptObject();

	// 取得後23時間でセッション再取得
	if ((!session) || (session.lastUpdated + 86400000 - 3600000) < (new Date()).getTime()) {
		var data = new java.lang.String('ID=' + userEmail + '&PW=' + secretKey);
		var hr = v2c.createHttpRequest('http://auth.bbspink.com/ronin/?' + data);
		hr.setRequestProperty('User-Agent', 'DOLIB/1.00');
		hr.setRequestProperty('X-2ch-UA', 'V2C/2.11.4');
		hr.setRequestProperty('Referer', 'http://auth.bbspink.com');
		hr.setRequestProperty('Host', 'http://auth.bbspink.com');
		session = {};
		session.lastUpdated = (new Date()).getTime();
		session.sid = String(hr.getContentsAsString()).replace(/[\r\n]/g, '').replace('SESSION-ID=', '');
		if (session.sid.indexOf('SESSION-ID=ERROR:') >= 0) {
			v2c.println('[post.js:PINKチャンネル浪人BETA] セッションの取得に失敗しました。\r\nIDとパスワードに誤りがないか確認してください。');
			return false;
		}
		v2c.setScriptObject(session);
	}

	// ---- [POSTデータ作成] ------------------------
	
	var data = '';
	if (isRes) {
		data = 'bbs=' + wp.thread.board.key + '&key=' + wp.thread.key + '&sid=' +session.sid + '&FROM=' + wp.name + '&MESSAGE=' + wp.message + '&mail=' + wp.mail + '&time=1&submit=上記全てを承諾して書き込む&yuki=akari';
	} else {
		data = 'bbs=' + wp.thread.board.key + '&subject=' + wp.title + '&sid=' +session.sid + '&FROM=' + wp.name + '&MESSAGE=' + wp.message + '&mail=' + wp.mail + '&time=1&submit=上記全てを承諾して書き込む&yuki=akari';
	}

	// ---- [レスorスレ立て送信] --------------------

	var cookie = v2c.getProperty('2chan_cookie');
	var hr = v2c.createHttpRequest('http://' + wp.thread.url.host + '/test/bbs.cgi?guid=ON', data);
	hr.setRequestProperty('Host', wp.thread.board.url.host);
	hr.setRequestProperty('Referer', wp.thread.url);
	hr.setRequestProperty('User-Agent', 'Monazilla/1.00');
	if (cookie) {
		hr.setRequestProperty('Cookie', cookie);
	}
	var responseMes = String(hr.getContentsAsString());

	if (responseMes.indexOf('荒らし対策でクッキーを設定していない') >= 0) {
		var cookie = String(hr.getResponseHeader('Set-Cookie'));
		var pon = cookie.match(/PON=[^;]+/) || '';
		hr = v2c.createHttpRequest('http://' + wp.thread.url.host + '/test/bbs.cgi?guid=ON', data);
		hr.setRequestProperty('Host', wp.thread.board.url.host);
		hr.setRequestProperty('Referer', wp.thread.url);
		hr.setRequestProperty('User-Agent', 'Monazilla/1.00');
		hr.setRequestProperty('Cookie', pon + ';');
		responseMes = String(hr.getContentsAsString());
		
		if (responseMes.indexOf('貴方の忍法帳を作成します') >= 0) {
			var cookie = String(hr.getResponseHeader('Set-Cookie'));
			var hap = cookie.match(/HAP=[^;]+/) || '';
			if (pon && hap) {
				v2c.putProperty('2chan_cookie', pon + ';' + hap);
			}

			v2c.alert('忍法帳を作成しています。２０秒待ってから再度投稿してください');
			return false;
		}
	}

	if (responseMes.indexOf('書きこみが終わりました。') >= 0) {
		wp.name.text = '';
		wp.mail.text = '';
		wp.message.text = '';

		if (!isRes) {
			wp.title.text = '';
		} else {
			var th = wp.thread;
			th.updateAndWait();
			v2c.openURL(th.url);

			java.lang.Thread.sleep(300);
			var res = th.getRes(th.localResCount - 1);
			var rl = v2c.getResLabel('書き込み');
			if (rl) { res.setResLabel(rl); }

		}
		if (setCloseAfterWrite) {
			wp.close();
		}
	} else {
		v2c.println('[post.js:PINKチャンネル浪人BETA] Error : 書き込み出来ませんでした。\r\n' + responseMes);
	}

	return false;
}

function createThread2chsc(wp)
{
	// [設定]書き込みの後書き込み欄を閉じる場合は true 、閉じない場合は false
	var setCloseAfterWrite = true;

	if (wp.thread.board.url.host.indexOf('2ch.sc') < 0) {
		return true;
	}

	var bbsapi = 'http://' + wp.thread.board.url.host + '/test/bbs.cgi';
	var html = '';
	{
		var data = 'submit=新規スレッド書き込み画面へ&bbs=' + wp.thread.board.key;
		//data = EscapeSJIS(data);
		var hr = v2c.createHttpRequest(bbsapi + '?new', data);
		hr.setRequestProperty('Connection', 'keep-alive');
		hr.setRequestProperty('Host', wp.thread.board.url.host);
		hr.setRequestProperty('Referer', wp.thread.board.url);
		hr.setRequestProperty('User-Agent', 'Monazilla/1.00 (V2C post.js)');
		hr.setRequestProperty('Accept-Encoding', 'gzip, deflate');
		//hr.setRequestProperty('Cookie', 'READJS="off"; NAME=""; MAIL=""');
		html = String(hr.getContentsAsString());
	}
	var responseMes = '';
	
	if (html) {
		var subject = wp.title;
		var submit = '新規スレッド書込';
		var FROM = wp.name;
		var mail = wp.mail;
		var MESSAGE = wp.message;
		var bbs = wp.thread.board.key;
		var time = (/<input type=hidden name=time value="([^"]+?)">/.test(html)) ? RegExp.$1 : '';
		var check = (/<input type=hidden name=check value="([^"]+?)">/.test(html)) ? RegExp.$1 : '';
		var pass = (/<input type=hidden name=pass value="([^"]+?)">/.test(html)) ? RegExp.$1 : '';
		var data = 'subject=' + subject + '&submit=新規スレッド書込&FROM=' + FROM + '&mail=' + mail + '&MESSAGE=' + MESSAGE + '&bbs=' + bbs + '&time=' + time + '&check=' + check + '&pass=' + pass;
		//data = EscapeSJIS(data);
		var hr = v2c.createHttpRequest(bbsapi, data);
		hr.setRequestProperty('Connection', 'keep-alive');
		hr.setRequestProperty('Host', wp.thread.board.url.host);
		hr.setRequestProperty('Referer', wp.thread.board.url);
		hr.setRequestProperty('User-Agent', 'Monazilla/1.00 (V2C post.js)');
		hr.setRequestProperty('Accept-Encoding', 'gzip, deflate');
		//hr.setRequestProperty('Cookie', 'READJS="off"; NAME=""; MAIL=""');
		
		responseMes = String(hr.getContentsAsString());
		
		if (responseMes.indexOf('書きこみが終わりました。') >= 0) {
			wp.name.text = '';
			wp.mail.text = '';
			wp.message.text = '';
			wp.title.text = '';

			if (setCloseAfterWrite) {
				wp.close();
			}
			v2c.println('[post.js:createThread2chsc()] 成功 : スレッドを作成しました。スレ一覧を手動で更新して下さい。\r\n' + responseMes);
			return false;
		}
	}
	
	v2c.println('[post.js:createThread2chsc()] Error : スレ立て出来ませんでした。\r\n' + responseMes);
}

(function() {
	var macobj = {
		mouseObj : impl_mouseListener,
		bakusaiObj : BakusaiWriteForm,
		futabaObj : FutabaWriteForm,
		b4chanObj : B4chanWriteForm
	};
	return macobj;
})();


function makeParam(a) 
  [(enc=encodeURIComponent)(i)+"="+enc(a[i]) for (i in a)].join('&')

function tensai(wp) {
	var th = wp.thread;
	var bbs = th.bbs;
	var bd = th.board;
	var url = bd.url;
	
	if(bbs.is2ch && th.board.key.equals('poverty')){
		if(v2c.confirm('転載禁止語に変換しますか?')){
			var msg=wp.message.text+'';
			var ar=msg.split(/(>[>0-9\s]+)/);
			var msg2="";
			
			var max=ar.length;
			for(var i=0;i<max;i++){
				if(ar[i].length===0)continue;
				if(ar[i].match(/(>[>0-9\s]+)/)){
					msg2+=ar[i];
				}else{
					//v2c.println('(C)ar['+i+']:'+ar[i]+'('+ar[i].length+')');
					var url='http://anti.wkeya.com/etc/tools/tensai.php';
					var data=makeParam({
							t0: ar[i],
							enc: "1",
							b: "1"
						});
					var hr=v2c.createHttpRequest(url,data);
					var file=hr.getContentsAsString();
					msg2+=file;
				}
			}
			wp.message.text=msg2;
			return true;
		}else{
			if(v2c.confirm('そのまま投稿しますか?')){
				return true;
			}else{
				return false;
			}
		}
	}else{
		return true;
	}
};