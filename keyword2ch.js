//【登録場所】全体、レス表示
//【ラベル】タグクラウド
//【内容】2chキーワードのタグクラウド風ポップアップ
//【コマンド】${SCRIPT:S} keyword2ch.js
//【スクリプト】
// ----- 次の行から -----
//単語の途中で改行するのを禁止するかどうか(0:しない、1:する)
var nowrap = 1;
//ポップアップの最大横幅px
var maxwidth = 300;
//タイトル(空の場合はスレッドタイトル)
var title = '';
//cssの設定 変更するときは書式に注意してください
var css = '<!--'
+ 'body{ background-color: #eeeeee; margin: 5px; }'	//全体
+ '.L1 { font-size: 220%; font-weight: bold; }'		//100～回マッチした単語
+ '.L2 { font-size: 190%; font-weight: bold; }'		//75～99回マッチした単語
+ '.L3 { font-size: 160%; font-weight: bold; }'		//50～74回マッチした単語
+ '.L4 { font-size: 130%; }'						//25～49回マッチした単語
+ '.L5 { font-size: 100%; }'						//～25回マッチした単語
+ 'a { color: #8888dd; text-decoration: none; }'	//リンク
+ 'div { font-style: italic; }'						//タグ全体
+ 'font { font-weight: bold; }'						//タイトル
+ '-->';
//ここから実行部分
keyword2ch();
function keyword2ch() {
	var i, j, k, body = '';
	var v = v2c.context;
	var t = v.thread;
	if ( !title ) title = t.title;
	if ( !t.bbs.is2ch ) return v2c.alert( 'このスクリプトは2chでのみ使用できます' );
	if ( t.url.toString().match( /http:\/\/([^\/]+)\/test\/read\.cgi\/([^\/]+)\/(\d+)\/?/ ) ) {
		var u = 'http://p2.2ch.io/getf.cgi?' + RegExp.$1 + '+' + RegExp.$2 + '+' + RegExp.$3;
		try {
			var hr = v2c.createHttpRequest(u);
			var s = hr.getContentsAsString();
		} catch (e) {
			return v2c.alert( '通信失敗' + e );
		}
	}
	var keywords = '';
	if ( s.match( /(var[\s\t]+?keywords[\s\t]+?=[\s\t]+?{.+?};)/ ) ) eval(RegExp.$1);
	if( !keywords ) {
		if ( s.match( /(【 準備中 】)/ ) ) return v2c.alert( 'この板ではキーワードは未実装です' );
		return v2c.alert( 'キーワードが見つかりませんでした' );
	}
	var kw = keywords;
	for ( i in kw ) {
		k = 0;
		for ( j = 0; j < t.resCount; j++ )
			if ( t.getRes(j).message.match( i ) ) k++;
		var a = '<a href="http://find.2ch.net/?BBS=ALL&TYPE=TITLE&ENCODING=SJIS&STR='
				+ kw[i] + '">' + i + '</a>'; 
		if ( k > 99 )      kw[i] = '<span class="L1">' + a + '</span>';
		else if ( k > 74 ) kw[i] = '<span class="L2">' + a + '</span>';
		else if ( k > 49 ) kw[i] = '<span class="L3">' + a + '</span>';
		else if ( k > 24 ) kw[i] = '<span class="L4">' + a + '</span>';
		else               kw[i] = '<span class="L5">' + a + '</span>';
		if(nowrap) kw[i] = '<nobr>' + kw[i] + '</nobr>';
		body += kw[i] +'　';
	}	
	var h = '<html><head><style type="text/css">' + css + '</style></head><body>' 
			+ '<font color="#777777">' + title + '</font><hr>'
			+ '<div>' + body + '</div></body>';
	v.setMaxPopupWidth( maxwidth );
	v.setPopupHTML( h );
}
// ----- 前の行まで -----