//【登録場所】 "V2C\script\system\rescheck.js"
//【内容】rescheck.jsのまとめ
//【パーミッション】SF
//【更新日時】2014/10/24 特定の機能の組合せの場合スクリプトが作動しない不具合の修正(書換えを行う機能は全てjs stringで代入)
//            2014/10/23 sageteyonの追加
//            2014/06/13 NGBEID2.0 : BEの仕様変更に対応(bbspinkの追加) 07/03追記：バグ修正
//            2014/06/07 NGBEID2.0に対応したBe非表示機能の追加(パーミッションは「SF」のまま) 6/8追記：バグ修正
//            2014/05/19 重い処理のfutalogを消して軽いfchanlogを追加しました。
//            2014/04/28 ng_poverty_imgresを追加した。それに伴いパーミッションが「SF」に変更になります。
//            2014/03/20 obj.futalogでいままでは推測の画像URLでしたがfutalogスレを開いて厳密に画像URLを取得するようにした
//            2014/03/04 ニュース速報のランダム名無しを強制的に名無しにする ck.kyouseiNanasiNewsRandomを追加した
//【備考】beginCheckとendCheckの{}内で、行頭のコメント「//」を、利用する行ごとに解除することで、有効になります。
//【スクリプト】
// ----- 次の行から -----
function beginCheck( th, cx ) {
	var ck = {}, bd = th.board;
	// ***** 次の行から利用する行頭の「//」を削除する *****

//	cx.setCheckRawText( false ); //テキスト置換関数checkRawTextを実行しない。
//	if (bd.allAnonymousName.length > 0) ck.nanashi = bd.allAnonymousName;	//各板のデフォルト名無しを'名無し'に置換
//	ck.fukidasi = bd.key.search("live") != -1; //実況系板で名前が吹出しの場合、レスの最初に加える
//	ck.sankakke = true; //さんかっけーを△にする。
//	ck.no_anchor_1001 = th.bbs.is2ch; //1001のアンカーはリンクしない。
//	ck.renbanURL = true; //URLのみの行が連続する場合、各行に番号を振る
//	ck.ZentoHan = true; //全角英数を半角英数に
//	ck.YashitoKata = true; //香具師を方に
//	ck.kyouseiNanasi = true; //!ninja、!denki、!nanja、!kab、!omikuji、!damaのみを名無し扱いにする。
//  ck.kyouseiNanasi2 = true; ck.anonymousName = bd.anonymousName; // 地域表示が含まれるデフォルトな名前、投稿毎にランダムな文字列に変わるデフォルトな名前を名無し扱いする。
//  ck.kyouseiNanasiNewsRandom = th; //「リストからランダム(地域)@転載禁止」の投稿毎に変わる名前を名無し扱いにする。(リストURL http://ken.2ch.net/nanashi999.txt)
//	ck.yakitori = true; //名前欄の焼き鳥" [―{}@{}@{}-] "を消す。
//	ck.no_anchor_over_self = true; //自レス以上のレス番アンカーはリンクしない。
//	ck.breakWWWLink =true;//"www."から始まるURLはリンク化しない。
//	ck.fchanlog = th;	//ふたば画像URL直下にふたば画像保管サイト(2chanlog)のURLを付加する
//	ck.gif2short = true;	//gifの場合、スレ読み込み時に自動ダウンロードさせないようにGoogle短縮URLに置換する
	ck.sageteyon = 1;	//名前欄の転載禁止文字列を[1:削除する、2:短縮表記に置換する]
	
//	cx.setCheckAA( false ); //AA判定関数checkAAを実行しない。
//	ck.aa_type1 = bd.key.equals( "v2cj" ); //V2Cスクリプトのレスを自動AA判定する。
//	ck.aa_type2 = true; //（　・ｅ・）とノﾉ∮‘ _l‘）を自動AA判定する。

//	cx.setCheckNG( false ); //非表示判定関数checkNGを実行しない。
//	ck.ng_res1 = true; //レス１を常に非表示にする。
//	ck.ng_kote = bd.key.equals( "software" ) ? bd.anonymousName : null; //ソフ板でn|aさん以外のコテハンを非表示判定する。
//	ck.ng_poverty_imgres = 1;  // [1透明NG, 2通常NG] 嫌儲でスレ立て直後のスクリプトによる画像レスを非表示する(※別途vsutil.jsが必要。設定初期値240行目あたりで変更可)
	ck.ng_beid2 = (th.bbs.is2ch) ? getBeIdObj() : null; //  NGBEID2.0に対応したBe非表示機能。パーミッション「SF」 (※別途 registerNGBEID2.js、subject.js、threadld.jsが必要)
	
	// ***** 前の行まで *****
	for ( var i in ck ) {
		return ck;
	}
	return false;
}

var pu = java.util.regex.Pattern.compile('((?:h|&#x68;)?ttps?://[!#-;=?-Z_a-z~ ]+ ?(?:<br> ?|$)){2,}');
var pb = java.util.regex.Pattern.compile(' ?(?:<br> ?|$)');
var pn = java.util.regex.Pattern.compile('(?: </b>(?:忍法帖【Lv=\\d+,xxxPT?】[\\(\\)\\+\\-\\d：]*|'
	+ '【(?:北陸?|東北?|中(?:部|国)|関|四国?|九州?|沖縄?)電 (?:<font color=red>)?[.\\d-]+(?:<\/font>)? %】|'
	+ '【D\\w+\\d{16}】|株価【(?:E|\\d+)】|【(?:大吉|中吉|吉|小吉|末吉|凶|大凶|豚|ぴょん吉|だん吉|神|女神)】|'
	+ '【\\d+円】)<b>[ 　]+)+');
var pn2a = java.util.regex.Pattern.compile('番組の途中ですが<\\/b>.+<b>です');
var pn2b = java.util.regex.Pattern.compile('</b>\\(.+\\)<b>');
var pa = java.util.regex.Pattern.compile('((?:(?:&gt;)+|＞+) ?)(\\d+)');
var pw = java.util.regex.Pattern.compile('((?:^|[^/])(?:www))(\\.)');

function getBeIdObj()
{
	var l = null; w = 0;
	var js = v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/registerNGBEID2.js'));
	if (js) {
		l = eval(String(js));
		if (l) {
			w = l.getMaxWeight();
		}
	}
	if (!l) {
		v2c.println('[rescheck.js:getBeIdObj()] registerNGBEID2.jsが読み込めませんでした。');
		return null;
	}
	return { list: l, weight: w };
}

function checkRawText( res, cx ) {
	var name = res.name;
	if (name) name = res.name + '';
	var msg = res.message + '';
	var num = res.number;
	var obj = cx.checkObject;
	if ( obj.fukidasi ) {
		if ( name.search(/(-v-|￣(V|Ｖ|∨|＼\||\|／)￣)/) != -1 ) {
			msg = name + '\n' + msg;
		}
	}
	if ( obj.kyouseiNanasi ) {
		if (name && pn.matcher(name).matches()) {
			res.setNanasi(true);
		}
	}
	if ( obj.kyouseiNanasi2 && name ) {
		if (pn2a.matcher(name).matches()) {
			res.setNanasi(true);
		} else if ((name.indexOf(obj.anonymousName) >= 0) && (name != obj.anonymousName)) { 
			var divname = name.split(obj.anonymousName);
			//if (divname[0]) { }		/* デフォ名の前部分の判定 */
			if (divname[1]) {			/* デフォ名の後部分の判定 */
				if (pn2b.matcher(divname[1]).matches()) {
					res.setNanasi(true);
				}
			}
		}
	}
	if ( obj.kyouseiNanasiNewsRandom && name ) {
		var th = obj.kyouseiNanasiNewsRandom;
			if (/<b>[@＠]転載禁止$/.test(name)) {
				res.setNanasi(true);
			}
	}
	if ( obj.yakitori ) name = name.replace( / <\/b>\[―\{\}@\{\}@\{\}-\]<b> /g, '' );
	if ( obj.sankakke ) msg = msg.replace( /さんかっけー/g, '△' );
	if ( obj.YashitoKata ) msg = msg.replace( /香具師/g, '方' );
	if ( obj.no_anchor_1001 && num > 1000 ) {
		var sti=res.timeid;
		if (sti.startsWith( 'Over ' )) {
			msg = msg.replace( /(>>)(\d+)/g, '$1&lrm;$2' );
		}
	}
	if ( obj.no_anchor_over_self && num > 1 ) {
		var mt = pa.matcher(msg);
		if (mt.find()) {
			mt.reset();
			var sb = java.lang.StringBuffer();
			var lpc = 0;
			while (mt.find() && lpc < 10) {
				if (mt.group(2) >= num) {
					mt.appendReplacement(sb, '$1&lrm;$2');
								v2c.println(msg);
				}
				lpc++;
			}
			msg = mt.appendTail(sb) + '';
		}
	}
	if( obj.nanashi ) {
		for(var i = 0;i<obj.nanashi.length;i++) {
			if(name == obj.nanashi[i]) {
				name = '名無し' 
				break;
			}
		}
	}
	if ( obj.renbanURL ) {
		var mu=pu.matcher(msg);
		if (mu.find()) {
			var su=mu.group();
			var mb=pb.matcher(su);
			var sb=new java.lang.StringBuilder(msg.substring(0,mu.start()));
			sb.append('<font color="gray">');
			var i=1;
			var ip0=0;
			while (mb.find()) {
				var ip=mb.end();
				if (ip==ip0) {
					break;
				}
				if (i<=9) {
					sb.append('0');
				}
				sb.append(String(i++));
				sb.append('.  ');
				sb.append(su.substring(ip0,mb.start()));
				sb.append(mb.group());
				ip0 = ip;
			}
			sb.append('</font>');
			sb.append(msg.substring(mu.end()));
			msg = sb + '';
		}
	}
	if ( obj.breakWWWLink ) {
		var mt = pw.matcher(msg);
		if (mt.find()) {
			msg = mt.replaceAll('$1<!-- -->$2') + '';
		}
	}
	if ( obj.ZentoHan ) {
		msg = (msg+'').replace(/([０-９ａ-ｚＡ-Ｚ])/g,function(whole,reg){
			var sub = '０'.charCodeAt(0)-'0'.charCodeAt(0);
			return String.fromCharCode(reg.charCodeAt(0)-sub);
		});
	}
	if (obj.fchanlog) {
		//if (/(?:may|img|jun|dec|dat)\.2chan\.net/.test(obj.fchanlog.url.host.toString())) {
			msg = msg.replace(/h?t?t?p:\/\/\w+\.2chan\.net\/(may|img|jun|dec|dat)\/b\/src\/((\d{3})(\d{2})(\d{2})\d+)\.(jpe?g|gif|png)/ig,
						'$&<br> ┗ http://$1.2chanlog.net/$1/$3/$4/$5/$2.$6');
		//}
	}
	if (obj.gif2short) {
		var apiUri = "https://www.googleapis.com/urlshortener/v1/url";
		msg = String(msg).replace(/(?:h|&#x68;)?ttps?:\/\/(.*?\.gif)/ig, function(a, g1) {
			var json = '{"longUrl": "http://' + g1 + '"}';
			var hr = v2c.createHttpRequest(apiUri, json);
			hr.setRequestProperty('Content-type', 'application/json');
			var content = hr.getContentsAsString();
			if (content) {
				var args = eval('(function() { return ' + content + ' })();');
				if (args.id) {
					return args.id;
				}
			}
			return a;
		});
	}
	if (obj.sageteyon) {
		var repstr = (obj.sageteyon == 2) ? ' 転載禁止&copy;2ch.net' : '';
		name = name.replace(/ <small>[^<]+?<\/small>/i, repstr);
	}
	res.setName( name );
	res.setMessage( msg );
}

function checkAA( res, cx ) {
	var msg = res.message + '';
	var obj = cx.checkObject;
	if ( obj.aa_type1 && msg.indexOf( 'function' ) >= 0 ) {
		res.setAA(true);
	}
	if ( obj.aa_type2 && ( msg.indexOf( '（　・ｅ・）' ) >= 0  || msg.indexOf( 'ノﾉ∮‘ _l‘）' ) >= 0 ) ) {
		res.setAA(true);
	}
}

function checkNG( res, cx ) {
	var sn = res.name;
	var obj = cx.checkObject;
	if ( obj.ng_res1 && res.number == 1 ) {
		res.setNG( 'レス1' );
	}
	if ( obj.ng_kote && ( sn != null ) && !sn.startsWith( 'n|a' ) && !sn.equals( obj.ng_kote ) ) {
		res.setNG( 'コテハン' );
	}
	if ( obj.ng_poverty_imgres ) {
		/* 設定 */
		// 2レス目に画像リンクが一つだけ貼られているようなレスをNGにするには mi = 2、hi = 2、mu = false に設定して下さい
		var mi = 2;    // チェックを開始するレス番号
		var hi = 10;   // チェックを終了する最大レス番号(ヒットした時点で終了する)
		var mu = true; // 本文に複数のURLが貼られてる場合もヒットさせる場合はtrue、URLが１つの時だけヒットさせたい場合はfalse
		/* ここまで */
		if (res.number >= mi && res.number <= hi) {
			var re = (mu) ? /h?t?t?ps?:\/\/(?:[\w -.\/?%&=]*\.(?:jpe?g|gif|png|bmp))[\r\n]+/g
			              : /h?t?t?ps?:\/\/(?:[\w -.\/?%&=]*\.(?:jpe?g|gif|png|bmp))[\r\n]+/;
			if (String(res.message).replace(re, '').length == 0) {
				res.setNG('嫌儲画像レス', (obj.ng_poverty_imgres == 1));
				var vsutil = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/vsutil.js'))));
				var addlines = [];
				var ngfile = v2c.readStringFromFile(v2c.saveDir + '/ngfile.txt');
				var addtime = parseInt((new Date()).getTime() / 1000);
				var endl = java.lang.System.getProperty("line.separator");
				for (var item in res.links) {
					var cache = res.links[item].imageCacheFile;
					var sha;
					if (cache) {
						sha = vsutil.getSHA(v2c.readBytesFromFile(cache));
						/*
						var refpath = cache.getParentFile().getName() + '/' + cache.getName();
						cache["delete"]();
						var f = new java.io.File(v2c.saveDir + '/image/props/' + refpath);
						f["delete"]();
						f = new java.io.File(v2c.saveDir + '/image/thumbs/' + refpath);
						f["delete"]();
						*/
					} else {
						var hr = v2c.createHttpRequest(res.links[item]);
						var tmp = hr.getContentsAsBytes();
						if (tmp && hr.contentType.indexOf('image') >= 0)
							sha = vsutil.getSHA(tmp);
					}
					if (sha) {
						if (ngfile.indexOf(sha) < 0) {
							addlines.push(sha +',' + addtime + ',' + addtime + ',嫌儲画像レス' + endl);
						}
					}
				}
				if (addlines.length > 0) {
					for (var i = 0; i < addlines.length; i++) {
						ngfile += addlines[i];
					}
					vsutil.writeStringToSettingFile('ngfile.txt', ngfile);
				}
				obj.ng_poverty_imgres = false;
			}
		}
	}
	if (obj.ng_beid2 && res.beID && ((res.weight - obj.ng_beid2.weight) <= 0)) {

		var list = obj.ng_beid2.list;
		var beID, item;
		if ((beID = (/ BE:(\d+)/.test(res.source)) ? RegExp.$1 : null) &&
		    (item = list.getItem(beID)) &&
		    (item.number == beID) &&
		    (item.res)
		   ) {
			res.setNG('Be2.0:' + item.label, item.transparent, item.weight);
		}
	}

}

function endCheck( th, cx ) {
	// ***** 次の行から利用する行頭の「//」を削除する *****
	//java.lang.System.gc(); //自動的にガベージコレクションを実行する。

	// ***** 前の行まで *****
}
// ----------------------

// ----- 前の行まで -----