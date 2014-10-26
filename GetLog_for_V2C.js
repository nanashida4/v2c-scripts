//【登録場所】 全体、レス表示、リンク
//【ラベル】 dat落ちログを取得
//【コマンド1】 ${SCRIPT:FwS} GetLog_for_V2C.js
//【コマンド2】 ${SCRIPT:FwS} GetLog_for_V2C.js mimizun //みみずんで取得
//※http://www.geocities.co.jp/lauhangwoo/jane/で以前あった"旧"「getlog.wsf」をV2C用にいじったもの。
// src,dstの値は"現"「GetLog.js」利用させてもらいました。
//※下のdstの[]内で行頭コメント『//』を削除したものが有効、巡回します。コマンド2はnameの""内が引数となります。
//※巡回停止条件は同じデータ（初期データ含む）が続いた場合（取得しないで停止）、データ数が1001以上の場合(取得して停止)です。
//【更新日】 2010/11/12
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/198,586
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var src = RegExp("^http://([^/]+)/test/[^/]+/(\\w+)/(((\\d+)\\d)\\d{5}).*");
var dst = [
	{url: "http://mimizun.com/log/2ch/$2/$3.dat", name:"mimizun" }, //みみずん
//	{url: "http://www.unkar.org/convert.php/$1/$2/$3/", name:"unkar" }, //うんかー
//	{url: "http://dat.tanabota.info/get_dat.php?dat=$1_$2_$3", name:"tanabota" }, //たなぼた
//	{url: "http://varda2.com/log/2ch/$2/$1/$2/kako/$5/$4/$3.dat", name:"varda" }, //ヴァルダ
];
var th = vcx.thread;
var lrc = th.localResCount;
try {
	GetLog();
} catch (e) {
	vcx.setStatusBarText( e.message );
}
function GetLog() {
	var li = vcx.link;
	var thu = String( th ? ( li ? li : th.url ) : v2c.prompt( "URL", "" ) || Err( "Cancelled" ) );
	var prm = thu.match( RegExp( src ) ) || Err( "Illegal URL (Pattern Matching)" );
	var gth = v2c.getThread( thu ) || Err( "Illegal URL (Get Thread)" );
	lrc = li ? gth.localResCount : lrc;
	var lrc0 = lrc;
	var sites = vcx.args;
	var site = sites[0] + ""
	var f = 0;
	for ( var i in dst ) with ( dst[i] ) {
		if ( site != name && sites.length > 0 ) continue;
		v2c.setStatus( "Now Loading... "+ name );
		var comp = GetDat( prm[0].replace( src, url ), prm );
		if ( Math.abs( comp ) != 1 ) f += 1;
		if ( comp < 1 ) break;
	}
	if ( lrc0 > lrc )  Err( "Failure!" );
	var name = ( i - f ) == -1 ? "No new log" : dst[ i - f ].name;
	var res = vcx.res;
	var idx = res ? res.index : lrc;
	vcx.setResIndexToJump( idx );
	vcx.setStatusBarText( "Success! [ " + name + " ] : " + v2c.getThread( thu ).title + " (+" + ( lrc - lrc0 ) + ")");
}
function GetDat(url,thu) {
	var hr = v2c.createHttpRequest( url );
	var bl = hr.getContentsAsBytes();
	var rc = hr.responseCode;
	var rm = hr.responseMessage;
	v2c.setStatus( rc + " " + rm );
	if ( !bl ) { //ないため次へ
		return 3;
	}
	var gnl = ( hr.getContentsAsString() + "" ).split( /\n/ ).length -1;
	if ( lrc > gnl || gnl == 1 ) { //取得済のため次へ
		return 2;
	} else if ( lrc < gnl && gnl >= 1001 ) { //取得して停止
		v2c.getThread( thu ).importDatBytes( bl );
		lrc = gnl;
		return -1;
	} else if ( lrc == gnl ) { //同データのため停止
		return 0;
	} else { //取得して次へ
		v2c.getThread( thu ).importDatBytes( bl );
		lrc = gnl;
		return 1;
	}
}
function Err( m ) {
  throw Error( m );
}
// ----- 前の行まで -----