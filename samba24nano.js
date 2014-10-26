//【登録場所】全体、レス表示
//【ラベル】Samba24.txtの更新
//【内容】Samba24 なの（仮）：http://nullpo.s101.xrea.com/samba24/
//　　　　　からSamba24.txtを取得して～\BBS\2ch\に保存する
//【コマンド】${SCRIPT:FrwS} samba24nano.js
//【スクリプト】
// ----- 設定ここから -----

//Samba24.txtの自動バックアップを(0:とらない、1:とる)
// ''で括らないでください
var backup = 1;

// 秒数の設定
// 'majority'：サーバ上の各板で最多数の秒数
// 'max'：各サーバ上の各板の最大値
// 'min'：各サーバ上の各板の最小値
var decsec = 'majority';

//補正秒数の設定 '-10'～'10' の整数
var offset = '0';

//改行の設定
// 'crlf'：CR+LF（Windows 標準）
// 'lf'：LF（Mac OS X、Linux/UNIX 標準）
var newline = 'crlf';

//----- 設定ここまで -----

getSamba24Txt();
function getSamba24Txt() {
	var host = 'nullpo.s101.xrea.com';
	var file = new java.io.File( v2c.saveDir, '\\BBS\\2ch\\samba24.txt' );
	var bfile = new java.io.File( v2c.saveDir, '\\BBS\\2ch\\samba24.txt.bak' );
	var url = 'http://' + host + '/samba24/';
	var data = 'conv.xcg?browser=v2c' + '&decsec=' + decsec +
	'&offset=' + offset + '&newline=' + newline + '&output=download';
	var hr = v2c.createHttpRequest(url);
	hr.getContentsAsString();
	hr = v2c.createHttpRequest(url + data);
	hr.setRequestProperty('User-Agent', '	Mozilla/5.0 (Windows NT 6.3; WOW64; rv:29.0) Gecko/20100101 Firefox/29.0');
	hr.setRequestProperty('Host', host);
	var s = hr.getContentsAsString();
	if (!s) return v2c.alert( '通信エラー' );
	var s2 = v2c.readFile( file );
	if ( backup ) {
		if ( s2 ) v2c.writeStringToFile( bfile, s2 );
	}
	v2c.writeStringToFile( file, s );
	//ダイアログがいらない時は↓をコメントアウト
	v2c.alert( 'samba24.txtを更新しました' );
}
