//【登録場所】 "V2C\script\system\subject.js"
//【内容】 板のスレ一覧（subject.txt）を変更
//【パーミッション】A
//【更新日時】2014/10/24 特定の機能の組合せの場合スクリプトが作動しない不具合の修正(末尾の改行コードを統一)
//            2014/10/23 removeSageteyonの追加
//            2014/10/09 自分のBEID末尾付加のみ削除する機能の追加。スレタイPlus R2014072901を追加
//            2014/07/26 スレタイに含まれるBeIDをリストに追加してスレタイから除去する機能の追加 追記：色々と修正
//                       スレを開かなくてもNGBEIDのスレが非表示になり、Beでスレ立て時に「吸い込まれたかもしれない」ってエラーがでなくなる
//                       追記：設定項目を変更
//            2014/07/25 java6で動かない不具合の修正
//            2014/07/23 指定したレス数以下のスレッドを隠す機能の追加
//            2014/06/13 NGBEID2.0 : BEの仕様変更に対応(bbspinkの追加) 6/15追記バグ修正 7/3追記：バグ修正
//            2014/06/07 NGBEID2.0に対応したBe非表示機能の追加(パーミッションを「A」に変更して下さい。スレタイplusを追加する場合も「A」です。)
//            2014/04/19 2ch.scで立てられたスレのタイトルの先頭に【sc】を付ける機能を追加
//            2014/03/03 1001を下げる機能を追加
//【備考】・checkSubject(ss,bd,cx)はsubject.txtを実際に取得した時にのみ実行されます。
//　　　　（例えばHTTPレスポンスコードが 304 Not Modified. の時は実行されない。）
//　　　　・現在（2.10.0 [R20120923]）ローカル板・Twitter仮想板でcheckSubject(ss,bd,cx)は実行されませんが、
//　　　　将来実行される可能性があります。 
//　　　　・subject.jsを変更した時は「ファイル」メニューの「再読み込み」→「subject.js」で再読み込みすることができます。 
//【スクリプト】
// ----- 次の行から -----
//subject.txtを取得した後解析する前に実行
function checkSubject(ss,bd,cx) {
  /* 機能を有効にしたい場合、下の各行頭//を削除してください  */
//	ss = hideSmallThreads(ss, bd, cx); // 指定したレス数以下のスレッドを隠す
//	ss = sort924ToBottomLine(ss,bd,cx); //ソフトウェア板でスレッド924を下げてスレタイの先頭に★を追加
//	ss = deadThreadToBottomLine(ss, bd, cx); // dat落ち(1001のみ)したスレッドを下げます
//	ss = check2chscThread(ss, bd, cx); // 2ch.scで立てられたスレッドに【sc】の接頭詞をつけます
	ss = ngbeid2th(ss, bd, cx); //  NGBEID2.0に対応したBe非表示機能。(※パーミッション「A」) (※別途 registerNGBEID2.js、rescheck.js、threadld.jsが必要)

//	ss = ttp(ss,bd,cx); //スレタイplus
//	ss = removeMyBeId(ss, bd, '000000000'); // 自分のBEID末尾付加のみ削除する(※←の000000000をBE基礎番号に置き換えて下さい) (既定では嫌儲のみ有効。設定で変更可)
	ss = removeSageteyon(ss, bd, cx);       // スレタイの転載禁止文字列を削除する
	/* ---------------------------------------- */
	/*●自分のBE基礎番号を知りたいとき
	BEステータスページに行き公開プロフィールを開く
	URL http://be.2ch.net/test/p.php?i= の後に続く9桁の数字がBE基礎番号*/
	/* ---------------------------------------- */

  return ss;
}

function hideSmallThreads(ss, bd, cx) {
	var cnt = 0, et = [];
	// [設定項目] 非表示にするレス数の閾値
	cnt = 5;
	
	// [設定項目] 指定した板でのみ有効にする (有効にしたい場合、下の行頭//を削除してください)
	// et = [ news4vip, news, software ];

	if (
		bd.bbs.is2ch
		/* [設定項目] 2ｃｈ以外でも有効にしたい場合、下の各行頭//を削除してください  */
		//  || th.bbs.is2cheq		//BBSが2ch互換板の場合
		//  || th.bbs.shitaraba		//BBSがしたらばの場合
		//  || th.bbs.machi			//BBSがまちBBSの場合
		//  || th.bbs.twitter		//BBSがTwitterの場合
	) {
		if (bd.key && (et.length == 0 || arrayIndexOf(et, bd.key) != -1)) {
			var re=new RegExp('^\\d+\\.dat<>.+ \\((\\d+)\\)$','gm');
			var ls=[];
			var rt;
			while (rt = re.exec(ss)) {
				if (parseInt(rt[1]) > cnt) {
					ls.push(rt[0]);
				}
			}
			return ls.join('\n') + '\n';
		}
	}
	return ss;
}

function sort924ToBottomLine(ss,bd,cx) {
  if (!bd.bbs.is2ch||(bd.key!='software')) {
    return ss;
  }
  var re=new RegExp('^(\\d+)\\.dat<>(.+) \\((\\d+)\\)$','gm');
  var ls=[],ls9=[];
  var rt;
  while (rt=re.exec(ss)) {
    if (rt[1][0]=='9') {
      ls9.push(rt[1]+'.dat<>★ '+rt[2]+' ('+rt[3]+')\n');
    } else {
      ls.push(rt[0]+'\n');
    }
  }
  return ls.concat(ls9).join('');
}

function deadThreadToBottomLine(ss, bd, cx) {
	if (
		bd.bbs.is2ch
		/* 2ｃｈ以外でも有効にしたい場合、下の各行頭//を削除してください  */
		//  || th.bbs.is2cheq		//BBSが2ch互換板の場合
		//  || th.bbs.shitaraba		//BBSがしたらばの場合
		//  || th.bbs.machi			//BBSがまちBBSの場合
		//  || th.bbs.twitter		//BBSがTwitterの場合
	) {
		var re=new RegExp('^\\d+\\.dat<>.+ \\((\\d+)\\)$','gm');
		var ls=[],lsd=[];
		var rt;
		while (rt = re.exec(ss)) {
			if (parseInt(rt[1]) == 1001) {
				lsd.push(rt[0]);
			} else {
				ls.push(rt[0]);
			}
		}
		return ls.concat(lsd).join('\n') + '\n';
	}
	return ss;
}

function check2chscThread(ss, bd, cx)
{
// ---- [設定] ---------------------------------------------
var headname = '【sc】';  // 2ch.scのスレの場合に付ける接頭詞
var strict = false;        // コピースレ判定の制度を高めます(高コスト)
// ---- [設定ここまで] -------------------------------------

	if (bd.url.host.indexOf('2ch.sc') < 0)
		return ss;
	
	var bd2 = v2c.bbs2ch.getBoard(bd.key);
	var ss2 = v2c.readURL(bd2.url + 'subject.txt');
	
	if (!ss2) {
		v2c.println('[subject.js:check2chscThread()] 2ch.netのsubject.txtが取得出来なかったので処理を中止しました。');
		return ss;
	}
	
	var re = new RegExp('^(\\d+)\\.dat<>(.+) \\((\\d+)\\)$','gm');
	
	var ss2keys = [];
	var rt;
	while (rt = re.exec(ss2)) {
		ss2keys.push(rt[1]);
	}
	
	var ls = [];
	while (rt = re.exec(ss)) {
		if (arrayIndexOf(ss2keys, rt[1]) < 0) {
			var repflag = true;
			if (strict) {
				var tmp = v2c.readURL(bd2.url + 'test/offlaw2.so?shiro=kuma&bbs=' + bd2.key + '&key=1' + rt[1] + '&sid=ERROR');
				if (tmp && tmp.indexOf('ERROR ret=2001') < 0) {
					repflag = false;
				}
			}
			if (repflag)
				ls.push(rt[1]+'.dat<>'+headname+rt[2]+' ('+rt[3]+')\n');
			else
				ls.push(rt[0] + '\n');
		} else {
			ls.push(rt[0] + '\n');
		}
	}
	return ls.join('');
}

function removeMyBeId(ss, bd, myBeId)
{
	var checkbds = [];
	/* ---------------------------------------- */
	/* [設定項目] スレタイのBeIDを削除する板を限定する
	              有効にする場合、checkbdsの左側の「 // 」を削除、無効の場合2ch＆bbspinkの全ての板で有効
	              追加する場合、[ 'poverty', 'news' ] のようにコンマ区切りで記入する */
	checkbds = [ 'poverty' ];  // 嫌儲のみ
	/* ---------------------------------------- */
	
	if (checkbds.length > 0 && arrayIndexOf(checkbds, bd.key) == -1)
		return ss;
	return removeBeOnSubject(ss, myBeId);
}

function removeSageteyon(ss, bd, cx)
{
	var re = /^(\d+)\.dat<>\[転載禁止\] (.+)&copy;2ch\.net\t(.*?) \((\d+)\)$/gm;
	return ss.replace(re, '$1.dat<>$2$3 ($4)\n');
}

function getBeIdThreadList()
{
	var l = null;
	var js = v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/registerNGBEID2.js'));
	if (js) {
		l = eval(String(js));
		if (l) {
			l = l.getNgThreadBeList();
			if (l && l.length == 0)
				l = null;
		}
	} else {
		v2c.println('[subject.js:ngbeid2th()] registerNGBEID2.jsが開けませんでした。');
	}
	return l;
}

function getBeSubObj(s, bd)
{
	var re = /(\d+)\.dat<>(.*?)(?: \[(\d+)\])? \((\d+)\)/;
	var ret = { newEntry : '', beId : '', divBeSub : s, key : '', title : '' };
	var m = re.exec(s);
	if (m) {
		ret.key = m[1];
		ret.title = m[2];
		ret.divBeSub = m[1] + '.dat<>' + m[2] + ' (' + m[4] + ')';
		ret.beId = m[3] || '';
		var entry = bd.key + '\t' + ret.key + '\t\t\t' + ret.title + '\t' + ret.beId;
		ret.newEntry = (ret.beId) ? entry : '';
	}
	return ret;
};

function removeBeOnSubject(ss /* justme */)
{
	var justme = arguments[1]; // 自分のBEID
	var re;
	if (justme) {
		if (!/\d{5,10}/.test(justme))
			return ss;
		re = new RegExp('(\\d+)\\.dat<>(.*?)(?: \\[' + justme + '\\] )\\((\\d+)\\)');
	} else {
		re = /(\d+)\.dat<>(.*?)(?: \[\d+\] )\((\d+)\)/;
	}
	var subLines = splitSS(ss);
	for (var i = 0; i < subLines.length; i++) {
		var m = re.exec(subLines[i]);
		if (m) {
			subLines[i] = m[1] + '.dat<>' + m[2] + ' (' + m[3] + ')';
		}
	}
	return subLines.join('\n') + '\n';
};


function ngbeid2th(ss, bd, cx)
{
	var checkbds = [];
	/* ---------------------------------------- */
	/* [設定項目] NGにヒットしたスレのDATを自動削除するならtrue。しないならfalse (推奨)。
	              ※注意事項: スレ一覧からは見えなくなるが閲覧履歴には残るのでそこから開いたあとにスレ更新した場合、
	                メモリキャッシュの影響でバグります(レスが重複したり、スレ一覧の「+R」がマイナス表示になる) */
	var isRemoveDat = false;
	
	/* [設定項目] スレタイのBeIDを使用する (スレタイ末尾の[XXXXXX]もNGBE判定に含めます。スレ立て主がBeを使用したかどうかは調べないので誤判定の可能性があります)
	             【 0 】無効
	             【 1 】スレタイのBeIDをリストに追加する
	             【 2 】リストに追加せず非表示にする (推奨) */
	var isTTP = 2;
	
	/* [設定項目] スレタイのBeIDを使用する板を限定する(スレタイ誤判定防止用。 設定項目isRemoveBeNumとisTTPに影響します)
	              有効にする場合、checkbdsの左側の「 // 」を削除、無効の場合2ch＆bbspinkの全ての板で有効
	              追加する場合、[ 'poverty', 'news' ] のようにコンマ区切りで記入する */
	checkbds = [ 'poverty' ];  // 嫌儲のみ
	
	/* [設定項目] スレタイからBeID部分を削除するならtrue (推奨)。しないならfalse
	              ttp(スレタイPlus)を使う時はfalseにして下さい */
	var isRemoveBeNum = false;
	
	/* [設定項目] BEスレリストの最大保持数の設定。0で無制限。最大保持数に達したら古い方から半分削除します。 */
	var limit = 5000;
	/* ---------------------------------------- */

	if (!bd.bbs.is2ch) { return ss; }
	var nlf = new java.io.File(v2c.saveDir + '/script/scdata/ngbelist/' + bd.key + '.txt');
	var bethl = Array.prototype.slice.call(v2c.readLinesFromFile(nlf, 'UTF-8'));	// BEスレリスト
	var ngl   = getBeIdThreadList() || [];											// スレ非表示が有効なNGBEリスト
	var sl = splitSS(ss);

	if (checkbds && checkbds.length > 0) {
		if (arrayIndexOf(checkbds, bd.key) == -1) {
			isTTP = 0;
			isRemoveBeNum = false;
		}
	}
	if (ngl.length == 0 && isTTP != 1) {
		return (isRemoveBeNum) ? removeBeOnSubject(ss) : ss;
	}

	var ngthKeys = [];								// NGBEに一致したスレKeyリスト
	for (var i = 0; i < bethl.length; i++) {
		if (bethl[i].length == 0) {
			bethl.splice(i--, 1);
			continue;
		}
		var tmp = bethl[i].split('\t');
		if (arrayIndexOf(ngl, tmp[5]) >= 0) {		// tmp[5] = BEID
			ngthKeys.push(tmp[1]);					// tmp[1] = threadKey
		}
	}
	
	var oldBethlLen = bethl.length;
	for (var i = 0; i < sl.length; i++) {
		var removed = false;
		var bso = getBeSubObj(sl[i], bd);
		if (bso.beId) {
			if (isTTP > 0) {
				if (arrayIndexOf(ngl, bso.beId) != -1) {
					sl.splice(i--, 1);
					removed = true;
				}
				if (isTTP == 1) {
					bethl.push(bso.newEntry);
				}
			}
		}
		if ((!removed) && arrayIndexOf(ngthKeys, bso.key) >= 0) {
			sl.splice(i--, 1);
			removed = true;
		}
		if ((!removed) && isRemoveBeNum) {
			sl[i] = bso.divBeSub;
		}
		if (removed && isRemoveDat) {
			var dirname = (String(bd.url).indexOf('bbspink') >= 0) ? 'bbspink_' : '2ch_';
			var fname = v2c.saveDir + '/log/' + dirname + '/' + bd.key + '/' + bso.key;
			var datfile = new java.io.File(fname + '.dat');
			if (datfile.exists()) {
				var txtfile = new java.io.File(fname + '.txt');
				if (txtfile.exists()) {
					txtfile["delete"]();
				}
				v2c.println('[subject.js:ngbeid2th()] NGBEが立てたスレを削除しました。\n\t' + datfile.getAbsolutePath() + '\n\t' + bso.title);
				datfile["delete"]();
			}
		}
	}
	if (limit > 0 && bethl.length > limit) {
		var num = parseInt(limit / 2);
		if (num > 0) {
			bethl.splice(0, num);
		}
	}
	if (bethl.length != oldBethlLen) {
		v2c.writeLinesToFile(nlf, bethl, 'UTF-8');
	}

	return sl.join('\n') + '\n';
}

function arrayIndexOf(array, item)
{
	if (array) {
		for (var i = 0; i < array.length; i++) {
			if (array[i] == item) {
				return i;
			}
		}
	}
	return -1;
};

function splitSS(ss)
{
	var ss2 = ss.split('\n');
	if (ss2[ss2.length - 1].length == 0) {
		ss2.splice(ss2.length - 1, 1);
	}
	return ss2;
};

// スレタイplus for V2C R2014072901
/*
ss … 取得したsubject.txt 
bd … 板オブジェクト 
cx … （現在はダミー）
*/
jl=java.lang;
awt=java.awt;

function ttp(ss,bd,cx){
	if(!bd.bbs.is2ch)return ss;
	switch(bd.key+""){//無効にしたい板はコメントアウト
		case 'eqplus'://臨時地震+
		case 'be'://面白ネタnews
		case 'nandemo'://なんでも質問
		case 'argue'://朝生
		case 'bizplus'://ビジネスnews+
		case 'newsplus'://ニュース速報+
		case 'wildplus'://ニュース二軍+
		case 'moeplus'://萌えニュース+
		case 'mnewsplus'://芸スポ速報+
		case 'femnewsplus'://ほのぼのnews+
		case 'dqnplus'://痛いニュース+
		case 'scienceplus'://科学ニュース+
		case 'owabiplus'://お詫び+
		case 'liveplus'://ニュース実況+
		case 'liveplus'://ニュース実況+
		case 'news'://ニュース速報
		case 'news4plus'://東アジアnews+
		case 'news5plus'://ニュース国際+
		case 'qa'://初心者の質問
		case 'gline'://ガイドライン
		case 'offevent'://突発OFF
		case 'chiri'://地理お国自慢
		case 'ticketplus'://Walker+
		case 'ex'://カップル
		case 'news4viptasu'://ニュー速VIP+
		case 'poverty'://ニュー速(嫌儲)
		case 'bbynews'://速報headline<-本家で扱っていない
		case 'phs'://携帯・ＰＨＳ<-本家で扱っていない
			break;
		default :
			return ss;
	}
//--------------------------------------
// 設定
//--------------------------------------
	// ▼各種ファイル名等(systemフォルダに配置) 新たにファイルを追加/削除する場合はここを編集
	//   str_add :スレタイ先頭に付加する文字列
	//   flag    :比較の対象(0:BEID,1:記者,2:名前,3:ID),
	// ★th_shift:該当スレを 0:通常表示,1:上げる,2:下げる,3:非表示
	var ar_replace=[
		{filename:"myngbe.txt",   str_add:"【NGBE】",  file_encode:"UTF-8",flag:0,th_shift:2,abone:0},//NGBE
		{filename:"myokbe.txt",   str_add:" ⇒ ",      file_encode:"UTF-8",flag:0,th_shift:1,abone:0},//注目BE
		{filename:"myngkisya.txt",str_add:"【NG記者】",file_encode:"UTF-8",flag:1,th_shift:2,abone:0},//NG記者
		{filename:"myokkisya.txt",str_add:" ⇒ ",      file_encode:"UTF-8",flag:1,th_shift:1,abone:0} //注目記者
	];
	// ▼既定リストの設定
	//   use_label   :V2Cに設定されたNG用ラベルをスレタイ先頭に付加する文字列として true:使用する,false:使用しない
	//                ただしラベルがBEIDそのままの場合や空白の場合はstr_addが使用される
	//   label_format:use_labelがtrueのときスレタイ先頭に付加する文字列のフォーマット(%label%はラベルに置換される)
	var ar_replace_sys={
		//BE情報のないスレ(クローラがBE情報を取得できなかったスレ,スレッド924含む) 嫌儲のみ有効,BE隠しかも?
		hidden: {str_add:"【notbe?*】",th_shift:2},
		//情報未取得(クローラが情報未取得)のスレ
		noinfo: {str_add:"【noinfo*】",th_shift:2},
		//V2Cに登録されたNGIDが立てたスレ
		v2c_ngid: {str_add:"【NGID*】",th_shift:2},
		//V2Cに登録されたNGBEが立てたスレ
		v2c_ngbe: {str_add:"【NGBE*】",th_shift:2,use_label:true,label_format:'【%label%】'},
		//V2C保存用フォルダ内のNGBE.txt(Jane互換)
		v2c_ngbe_j: {str_add:"【NGBE*】",th_shift:2},
		//新参BE(BE情報の後ろに表示) threshold==0で無視
		newcomer: {str_add:"[新参BE]",th_shift:0,threshold:0}
	};
	// ▼鮮度判定の設定
	var fleshnesscheck=true;//鮮度判定を true:行う,false:行わない
	var fleshness=300*1000;//鮮度判定(ミリ秒)
	var cache_encode='UTF-8';//キャッシュの文字コード
	// ▼その他の設定
	var beid_padding=false;//BEIDに対し0埋め等のフォーマットを行う
	var beid_format="%1$06d";//BEIDのフォーマット 6桁まで0パディングする場合は"%1$06d"
	var title_spacing=false;
	var title_spacing_px=300;
	var bename_display=true;
	var getidfromtitle=true;//スレタイからBEIDを取得する(嫌儲のみ有効)
	var abone_text='あぼ～ん';//スレタイを置換する場合のスレタイ
//--------------------------------------
// 設定ここまで
//--------------------------------------
	
	//var ar_all=['eqplus','be','nandemo','argue','bizplus','bizplus','newsplus','wildplus','moeplus','mnewsplus','femnewsplus','dqnplus','scienceplus','owabiplus','liveplus','liveplus','news','news4plus','news5plus','qa','gline','offevent','chiri','ticketplus','ex','news4viptasu','poverty','bbynews','phs'];
	var ar_sass=['eqplus','be','nandemo','argue','bizplus','bizplus','newsplus','wildplus','moeplus','mnewsplus','femnewsplus','dqnplus','scienceplus','owabiplus','liveplus','liveplus','news','news4plus','news5plus','qa','gline','offevent','chiri','ticketplus','ex','news4viptasu','poverty'];
	var ar_hacca=["poverty","news","newsplus","mnewsplus","be","bbynews","phs"];
	// ▼スレッド情報配信サーバURL 優先順に並べ、他の配信サイトを追加する場合はここに追記する
	var ar_server=[//type 0:anosono(json), 1:normal(txt), 2:subject(txt)
	//	{name:"hacca",url:"http://ame.hacca.jp/sasss/?i="+bd.key,type:1,ar_bd:ar_hacca},//薄荷飴 6分
		{name:"sass1",url:"http://sass.m35.coreserver.jp/thdat/"+bd.key+".txt",type:1,ar_bd:ar_sass},//本家1
		{name:"sass2",url:"http://sass.m35.coreserver.jp/thdatU/"+bd.key+".txt",type:1,ar_bd:ar_sass},//本家2
		{name:"anosono2",url:"http://anosono.mooo.com/static/sass/"+bd.key+".txt",type:1,ar_bd:["poverty"]},//5分
		{name:"anosono3",url:"http://anosono.mooo.com/static/sassU/"+bd.key+".txt",type:1,ar_bd:["poverty"]},//5分
		{name:"anosono1",url:"http://anosono.mooo.com/2ch/cache/"+bd.key+".json",type:0,ar_bd:["poverty"]},//5分
		{name:"kiki",url:"http://kiki.mods.jp/be/"+bd.key+"_subject.txt",type:2,ar_bd:["poverty","news"]}//ｽﾄｰｶｰ 10分
	];
	
	var v2cobj=v2c.getScriptObject();//V2Cが終了するまで記憶される
	if(!v2cobj)v2cobj={lastModified:null,lastModified_js:null,lists:{}};
	
	var fs=java.io.File.separator;
	var dr=v2c.saveDir+fs+'script'+fs+'system'+fs;
	if(!v2cobj.lastModified_js)v2cobj.lastModified_js=null;
	
	var tmp_file=new java.io.File(dr+'subject.js');
	if(tmp_file.exists()){
		var time_file=tmp_file.lastModified();
		if(v2cobj.lastModified_js){
			if(v2cobj.lastModified_js<time_file){//subject.jsが更新された場合は内部キャッシュを破棄する
				v2cobj.lastModified_js=time_file;
				v2c.println('内部キャッシュが破棄されました(1)');
			}
		}else{
			v2cobj.lastModified_js=time_file;
			v2c.println('内部キャッシュが破棄されました(2)');
		}
	}
	
	if(bd.key+""!="poverty")getidfromtitle=false;//嫌儲以外ではスレタイからの抽出を行わない
	
	// ■スレッド情報配信サーバから情報を取得する
	if(getidfromtitle===false){
		
		for(var i=0;i<ar_server.length;i++){//配信サイト
			if(in_array(ar_server[i].ar_bd,bd.key+"")===false)continue;
			//配信サイト・板ごとにファイルを確認
			var cache_name=dr+hash_md5(ar_server[i].name+'_'+bd.key)+'.txt';
			var loaded=false;
			if(fleshnesscheck){
				var cache_file=new java.io.File(cache_name);
				if(cache_file.exists()){//キャッシュが存在
					var time_now=new Date();
					var time_file=v2cobj.lastModified;//前回取得のlast-modifiedがあればそれを使う
					if(!time_file)time_file=cache_file.lastModified();
					if(time_now-time_file<fleshness){//経過時間が短い場合はキャッシュを使用
						file=v2c.readFile(cache_name,cache_encode);
						loaded=true;
						v2c.println('cache(fleshnesscheck):'+ar_server[i].name+'_'+bd.key);
					}
				}
			}
			if(!loaded){
				//var file=v2c.readURL(ar_server[i].url+"");//anosono(json)を使わない場合はこちらでもok この場合ﾊﾟｰﾐｯｼｮﾝSは不要
				var hr=v2c.createHttpRequest(ar_server[i].url+"");
				var file=hr.getContentsAsString();
				v2c.writeStringToFile(cache_name,file,cache_encode);
				var lm=hr.lastModified;
				v2cobj.lastModified=(lm)?lm:null;
				v2c.println('HttpRequest: '+ar_server[i].name+', '+bd.key);
			}
			
			var ls=[];
			if(ar_server[i].type==0){//anosono
				var obj=eval("("+file+")");
				if(obj.length===0)continue;
				for(var j=0;j<obj.length;j++){//共通の形式に変換
					if(obj[j].key)ls[obj[j].key]=obj[j];
				}
			}else if(ar_server[i].type==1){//normal
				var re=new RegExp('^([a-zA-Z0-9]*)\\t(\\d*)\\t(.*)\\t(.*)\\t(\\d*)\\t(.*)\\t$','gm');
				var rt;
				while(rt=re.exec(file)){
					var resid=(rt[3].match(/ID:(.+)/))?RegExp.$1:null;
					var be_id=(rt[5].length>0)?rt[5]:null;
					var be_nm=(rt[6].length>0)?rt[6]:null;
					var res_c=(rt[4].match(/([^<>]+ ★)/))?RegExp.$1:null;
					ls[rt[2]]={bbs:rt[1],key:rt[2],created:rt[2],"creator.id":resid,"creator.cap":res_c,"creator.name":rt[4],"creator.be.id":be_id,"creator.be.name":be_nm};
					//rt[0]全体,[1]板,[2]dat番(key),[3]ID,[4]名前欄,[5]BEID,[6]BE名
				}
			}else if(ar_server[i].type==2){//subject
				var re=new RegExp('^(\\d+)\\.dat<>(.+) \\((\\d+)\\)<>(\\d+)$','gm');//sbj各行のマッチ
				var rt;
				while(rt=re.exec(file)){
					ls[rt[1]]={"key":rt[1],"created":rt[1],"title":rt[2],"length":rt[3],"creator.be.id":be_id};
					//rt[0]全体[1]dat番[2]スレタイ[3]レス数
				}
			}
			if(ls.length>0)break;
		}
		if(!ls)return ss;
		else if(!ls.length)return ss;
	}else{
		ls=[];
	}
	
	// ■V2Cから渡されたsubjectの処理
	var re_sbj=new RegExp('^(\\d+)\\.dat<>(.+) \\((\\d+)\\)$','gm');//sbj各行のマッチ
	var ls_sbj=[];
	var rt_sbj;
	while(rt_sbj=re_sbj.exec(ss)){
		ls_sbj.push(rt_sbj);//rt_sbj[0]全体[1]dat番[2]スレタイ[3]レス数
	}
	
	// ■各種ユーザ指定リストの処理
	var ar_lists={};
	for(var i=0;i<ar_replace.length;i++){
		var fn=ar_replace[i].filename;
		var tmp_file=new java.io.File(dr+fn);
		var loaded=false;
		if(tmp_file.exists()){//リストファイルが存在
			var time_file=tmp_file.lastModified();
			if(v2cobj.lists[fn]){//リストのキャッシュが利用可能か確認
				if(v2cobj.lists[fn]['obj']){
					if(v2cobj.lists[fn]['obj']['lastModified']){
						if(v2cobj.lists[fn]['obj']['lastModified']>=time_file){//ファイルが更新されていない場合
							loaded=true;
							ar_lists[fn]=v2cobj.lists[fn];//前回以前に処理したものを利用
							v2c.println('cache(userlist):'+fn);
						}
					}
				}
			}
			if(loaded===false){
				var tmp_filestr=v2c.readLinesFromFile(dr+fn,ar_replace[i].file_encode);//array
				
				//var tmp_filestr=v2c.readStringFromFile(dr+fn,ar_replace[i].file_encode);//array
				
				if(tmp_filestr){
					ar_lists[fn]={};
					ar_lists[fn]['data']={};
					ar_lists[fn]['obj']=ar_replace[i];
					ar_lists[fn]['obj']['lastModified']=time_file;
					for(var j=0,l=tmp_filestr.length;j<l;j++){
						if(j==0/*&&ar_replace[i].file_encode=='UTF-8'*/){
							if((tmp_filestr[j].charCodeAt(0)).toString(16)=='feff'){
								tmp_filestr[j]=tmp_filestr[j].slice(1);
							}
						}
						var tmp_ar_line=tmp_filestr[j].split('<>');
						ar_lists[fn]['data'][tmp_ar_line[0]]=tmp_ar_line;
					}
					v2cobj.lists[fn]=ar_lists[fn];
					loaded=true;
					v2c.println('readFile(userlist):'+fn);
				}else{
					v2c.println('ERROR:readLinesFromFile('+fn+','+ar_replace[i].file_encode+')');
				}
			}
		}else{
			v2c.println('ファイルが存在しません:'+dr+fn);
		}
		if(!loaded){
			if(v2cobj.lists[fn]){//ファイル取得に失敗したら前回取得分を利用
				ar_lists[fn]=v2cobj.lists[fn];
				v2c.println('前回取得分を利用:'+fn);
			}else{
				ar_lists[fn]=null;
				v2c.println('読込失敗:'+fn);
			}
		}
	}
	
	// ■NGIDリストの処理
	if(getidfromtitle===false){
		var brdprops=v2c.readLinesFromFile(v2c.saveDir+fs+'log'+fs+'2ch_'+fs+bd.key+fs+'brdprops.txt','UTF-8');
		var ls_ngid={};
		if(brdprops){
			v2c.println('readFile(sys#NGID):brdprops.txt');
			for(var i=0;i<brdprops.length;i++){
				if(brdprops[i].match(/^ResHide\.ID:=.+/)){//NGIDの登録行
					var re_ngid=new RegExp('A:(\\d+):([a-zA-Z0-9+/]+)','gm');
					var rt_ngid;
					while(rt_ngid=re_ngid.exec(brdprops[i])){//NGID
						ls_ngid[rt_ngid[2]]=[rt_ngid[2]];
					}
				}
			}
		}
		ar_lists['#NGID']={"data":ls_ngid,"obj":ar_replace_sys.v2c_ngid};
		ar_lists['#NGID']['obj'].filename="#NGID";
		ar_lists['#NGID']['obj'].flag=3;//IDで比較
		
		v2cobj.lists['#NGID']=ar_lists['#NGID'];
	}
	
	// ■NGBEリストの処理
	var usrprops=v2c.readLinesFromFile(v2c.saveDir+fs+'usrprops.txt','UTF-8');
	var ls_ngbe={};
	if(usrprops){
		v2c.println('readFile(sys#NGBE):usrprops.txt');
		for(var i=0;i<usrprops.length;i++){
			if(usrprops[i].match(/^Be\.ID:=.+/)){//NGBEの登録行
				var re_ngbe=new RegExp('H:I(\\d+)\\tL(([^,\\\\]|\\\\(.|\\n))*)','gm');
				var rt_ngbe;
				while(rt_ngbe=re_ngbe.exec(usrprops[i])){//NGBE
					var tmp_label=(rt_ngbe[1]==rt_ngbe[2]||!ar_replace_sys.v2c_ngbe.use_label||rt_ngbe[2].length==0)?null:ar_replace_sys.v2c_ngbe.label_format.replace('%label%',rt_ngbe[2]);
					ls_ngbe[rt_ngbe[1]]=[rt_ngbe[1],tmp_label];
				}
			}
		}
	}
	ar_lists['#NGBE']={"data":ls_ngbe,"obj":ar_replace_sys.v2c_ngbe};
	ar_lists['#NGBE']['obj'].filename="#NGBE";
	ar_lists['#NGBE']['obj'].flag=0;//BEIDで比較
	
	v2cobj.lists['#NGBE']=ar_lists['#NGBE'];
	
	// ■NGBE.txt(Jane互換)の処理
	
	var tmp_filestr=v2c.readLinesFromFile(v2c.saveDir+fs+'NGBE.txt');
	if(tmp_filestr){
		v2c.println('readFile(sys#NGBE_J):NGBE.txt');
		ar_lists['#NGBE_J']={"data":{},"obj":ar_replace_sys.v2c_ngbe_j};
		for(var j=0,l=tmp_filestr.length;j<l;j++){
			var tmp_ar_line=tmp_filestr[j].split('<>');
			ar_lists['#NGBE_J']['data'][tmp_ar_line[0]]=tmp_ar_line;
		}
		v2cobj.lists['#NGBE_J']=ar_lists['#NGBE_J'];
		loaded=true;
	}
	
	v2c.setScriptObject(v2cobj);
	
	// ■メイン 2chからのsubjectについて各行を処理
	var ar_output=[],ar_output_age=[],ar_output_sage=[];
	var ar_flgls=[
		"creator.be.id",//BEIDで判別
		"creator.cap",//記者で判別
		"creator.name",//名前で判別
		"creator.id" //IDで判別
	];
	if(title_spacing){
		var space_px=fontwidth(' ');
		if(title_spacing_px<space_px){
			title_spacing=false;
		}else{
			title_spacing_px-=space_px-1;
		}
	}
	for(var i=0;i<ls_sbj.length;i++){//ls_sbj[i][0]全体[1]dat番[2]スレタイ[3]レス数
		var th_id=ls_sbj[i][1];
		var line_tmp,tmp_space,tmp_space_px;
		if(getidfromtitle===false){
			if(ls[th_id]){//スレ情報あり
				var ng_flag='',nm_flag='';
				ls[th_id].type=0;//とりあえず通常表示
				
				if(ls[th_id]["creator.be.id"]){//BEIDが存在する
					if(beid_padding){
						ls[th_id]["creator.be.id"]=jl.String.format(beid_format,jl.Integer.valueOf(ls[th_id]["creator.be.id"]));
					}
					if(ls[th_id]["creator.be.name"]&&bename_display){//BE名が存在する
						nm_flag+='[BE:'+ls[th_id]["creator.be.id"]+' '+ls[th_id]["creator.be.name"]+']';
					}else{
						nm_flag+='[BE:'+ls[th_id]["creator.be.id"]+']';
					}
					if(ar_replace_sys.newcomer.threshold>0){
						if(Number(ls[th_id]["creator.be.id"])>=ar_replace_sys.newcomer.threshold){
							nm_flag+=ar_replace_sys.newcomer.str_add;
							ls[th_id].type=ar_replace_sys.newcomer.th_shift;
						}
					}
				}else{//BEIDが存在しない
					if(bd.key+""=="poverty"){
						ng_flag+=ar_replace_sys.hidden.str_add;
						ls[th_id].type=ar_replace_sys.hidden.th_shift;//BE隠しかも
					}
				}
				if(ls[th_id]["creator.cap"])nm_flag+='〔'+ls[th_id]["creator.cap"]+'〕';//記者名が存在する
				
				var abone_tmp=0;
				for(var j in ar_lists){
					if(!ar_lists[j])continue;
					var ls_key=ar_lists[j]['obj'].flag;
					var ls_key_=ar_flgls[ls_key];
					if(ls_key_){
						if(ls[th_id][ls_key_]){//判別に使用する情報が存在する
							if(ar_lists[j]['data'][ls[th_id][ls_key_]]){//登録されている
								var ls_add=ar_lists[j]['data'][ls[th_id][ls_key_]][1];
								ng_flag+=(ls_add)?ls_add:ar_lists[j]['obj'].str_add;
								if(ls[th_id].type<ar_lists[j]['obj'].th_shift)ls[th_id].type=ar_lists[j]['obj'].th_shift;
								abone_tmp=abone_tmp|ar_lists[j]['obj'].abone;
							}
						}
					}
				}
				if(abone_tmp==1&&abone_text){
					tmp_space=ng_flag+abone_text;
				}else{
					tmp_space=ng_flag+ls_sbj[i][2];
				}
				if(title_spacing){
					tmp_space_px=fontwidth(tmp_space);
					while(tmp_space_px<title_spacing_px){
						tmp_space+=' ';
						tmp_space_px+=space_px;
					}
				}
				line_tmp=th_id+'.dat<>'+tmp_space+nm_flag+' ('+ls_sbj[i][3]+')';
			}else{//スレ情報なし 情報未取得
				line_tmp=th_id+'.dat<>'+ar_replace_sys.noinfo.str_add+ls_sbj[i][2]+' ('+ls_sbj[i][3]+')';
				ls[th_id]={type:ar_replace_sys.noinfo.th_shift}
			}
		}else{//スレタイからBEIDを抽出
			var ng_flag='',nm_flag='';
			var re=new RegExp('^(.*)\\[(\\d{5,10})\\]$','m');
			var rt;
			if(rt=re.exec(ls_sbj[i][2])){
				var beid_tmp=rt[2]+'';
				var abone_tmp=0;
				ls[th_id]={type:0,"creator.be.id":beid_tmp};//とりあえず通常表示
				for(var j in ar_lists){
					if(!ar_lists[j])continue;
					if(ar_lists[j]['data'][beid_tmp]){//登録されている
						var ls_add=ar_lists[j]['data'][beid_tmp][1];
						ng_flag+=(ls_add)?ls_add:ar_lists[j]['obj'].str_add;
						if(ls[th_id].type<ar_lists[j]['obj'].th_shift)ls[th_id].type=ar_lists[j]['obj'].th_shift;
						abone_tmp=abone_tmp|ar_lists[j]['obj'].abone;
					}
				}
				//abone_text
				if(abone_tmp==1&&abone_text){
					tmp_space=ng_flag+abone_text+'['+beid_tmp+']';
				}else{
					tmp_space=ng_flag+ls_sbj[i][2];
				}
				line_tmp=th_id+'.dat<>'+tmp_space+nm_flag+' ('+ls_sbj[i][3]+')';
			}else{
				line_tmp=th_id+'.dat<>'+ar_replace_sys.noinfo.str_add+ls_sbj[i][2]+' ('+ls_sbj[i][3]+')';
				ls[th_id]={type:ar_replace_sys.noinfo.th_shift}
			}
		}
		switch(ls[th_id].type){//0:通常表示,1:上げる,2:下げる,3:非表示
			case 0://通常表示
				ar_output.push(line_tmp);
				break;
			case 1://上げる
				ar_output_age.push(line_tmp);//上げる
				break;
			case 2://下げる
				ar_output_sage.push(line_tmp);//下げる
				break;
			default ://非表示
				break;
		}
	}//for終わり
	//v2c.println(fontwidth2(" "));
	return ar_output_age.concat(ar_output).concat(ar_output_sage).join("\n")+"\n";
}

function in_array(ar,el){
	for(var i=0,l=ar.length;i<l;i++){
		if(i in ar && ar[i]===el){
			return true;
			break;
		}
	}
	return false;
}

function hash_md5(a){
	var dg=java.security.MessageDigest.getInstance("MD5");
	var s=new jl.String(a);
	var hash=dg.digest(s.getBytes());
	var hash2="";
	var jli=jl.Integer;
	for(var i=0;i<hash.length;i++){
		hash2+=jli.toHexString(hash[i] & 0xff);
	}
	return hash2;
}

function fontwidth(str){
	var bi=new awt.image.BufferedImage(100,100,awt.image.BufferedImage.TYPE_INT_RGB);
	var g2d=bi.createGraphics();
	g2d.setFont(new awt.Font("ＭＳ Ｐゴシック",awt.Font.PLAIN,12));
	var fm=g2d.getFontMetrics();
	var width=0;
	var data=new jl.String(str);
	for(var j=0;j<data.length();j++){
		width+=fm.charWidth(data.charAt(j));
	}
	return width;
}
function fontwidth2(str){
	var g=awt.Graphics;
	//g.setFont(new awt.Font("ＭＳ Ｐゴシック",awt.Font.PLAIN,12));
	var fm=g.getFontMetrics();
	//awt.Graphics.setFont(new awt.Font("ＭＳ Ｐゴシック",awt.Font.PLAIN,12));
	//var fm=awt.Component.getFontMetrics(new awt.Font("ＭＳ Ｐゴシック",awt.Font.PLAIN,12));
	return fm.stringWidth(str);
}
//BE情報などの付加位置
//スレ情報取得が間に合わなかったスレタイは透明あぼーん
