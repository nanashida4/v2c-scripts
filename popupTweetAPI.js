//API取得版
//スクリプトのパーミッションが変わっている（${SCRIPT:Fr}→${SCRIPT:FrS}）ので注意
//Web取得版より多少高速だがAPIの150リクエスト/h制限がある
//既知の問題：リツイート人数がうまく反映されない
//
//【登録場所】リンク、URLExec
//【ラベル】Tweetのポップアップ
//【内容】Tweetのポップアップ
//【コマンド】${SCRIPT:FrS} popupTweetAPI.js
//【URLExec】https?://twitter\.com/(?:#!/)?[^/]+?/status/\d+	$&	${V2CSCRIPT:FrS} popupTweetAPI.js
//【スクリプト】
// ----- 次の行から -----

// ---- 設定ここから ----

//ポップアップの最大幅
maxPopupWidth = 400;

//APIで取得できなかったときwebで取得するかどうか(0：しない、1：する)
useWeb = 1;

// ---- 設定ここまで ----

//スクリプト実行中にステータスバーに表示
v2c.setStatus('popupTweetAPIスクリプト実行中...');

//JAVAパッケージのインポート
importPackage(javax.xml.parsers);
importPackage(org.w3c.dom);

//グローバル変数
an = '';
un = '';
sid = 0;
text = '';
date = '';
via = '';
rtc = '0';
icon = '';
link = '';

//実行
if ( popupTweetAPI() && useWeb ) {
	popupTweet();
}

//APIで取得
function popupTweetAPI() {

	//URLオブジェクトがあるかどうかの確認
	if (!v2c.context.link ) {
		v2c.print( 'URLの取得に失敗しました' );
		return 0;
	}

	//ID取得
	if ( v2c.context.link.toString().match( /https?:\/\/twitter\.com\/(?:#!\/)?[^\/]+\/status\/(\d+)/i ) ) {
		sid = RegExp.$1;
	}
	if ( !sid ) {
		v2c.print( '未対応のURLです' );
		return 0;
	}

	//同じURLのポップアップを開いていたら終了
	if( v2c.context.getPopupOfID( sid ) ) {
		return 0;
	}

	var url = 'http://api.twitter.com/1/statuses/show/' + sid + '.xml';	
	try {
		//XML DOMオブジェクトの作成
		var dbf = DocumentBuilderFactory.newInstance();
		var db = dbf.newDocumentBuilder();
	    var doc = db.parse( url );
	}
	catch (e) {
		v2c.print( 'XMLDOM Error\n' + e + '\n\nHTTP 400 の場合はAPIの150回制限かも' );
		return 1;
	}

	//XML解析
	traceNodes( doc );
	
	//本文ののリンクに<a>タグを付ける
	var tmp = '';
	var tmp2 = text;
	while (1) {
		if (tmp2.match( /(https?:\/\/[-_\.!~*\'\(\)a-zA-Z0-9;\/\?:\@&=?+\$,%#]+)/i ) ) {
			tmp = tmp + RegExp.leftContext + '<a href="' + RegExp.$1 + '">' + RegExp.$1 + '</a>';
			tmp2 = RegExp.rightContext;
		}
		else{
			tmp += tmp2; 
			break;
		}
	}
	text = tmp;

	//日付の整形	default:Mon Aug 16 14:14:01 +0000 2010
	var hh = '';
	if ( date.match( /(.+?)(\d{2})(:\d{2}:\d{2})\s\+\d{4}(\s\d{4})/ ) ) {
		//月と曜日
		date = RegExp.$1;
		//時間をUTCからJSTに変換(＋9時間)
		hh = parseInt(RegExp.$2) + 9;
		//時間の桁揃え
		date = date + ( '0' + hh ).slice( -2 ) + RegExp.$3;
		//年
		date += RegExp.$4;
	}

	//テンプレートを読み込み
	var stream = v2c.readFile( v2c.saveDir + '\\script\\popupTweet\\template.txt' );

	//パラメータの置換
	stream = stream.replaceAll( '%aname%', an );
	stream = stream.replaceAll( '%uname%', un );
	stream = stream.replaceAll( '%sid%', sid );
	stream = stream.replaceAll( '%text%', text );
	stream = stream.replaceAll( '%date%', date );
	stream = stream.replaceAll( '%via%', via );
	stream = stream.replaceAll( '%retweet%', rtc );
	stream = stream.replaceAll( '%icon%', icon );
	stream = stream.replaceAll( '%icolink%', link );

	//ポップアップの設定
	v2c.context.setPopupHTML( stream );
	v2c.context.setMaxPopupWidth( maxPopupWidth );
	v2c.context.setPopupID( sid );
	return 0;
}

//全てのXMLノードを走査
function traceNodes( node ) {

	var child = node.getFirstChild();

	//子ノードが無くなるまで繰り返し
	while ( child != null ) {

		//本文の取得
		if ( child.getNodeName() == 'text' ) {
			//child.getNodeValue()ではnullになる
			//※あるタグの中の文字列は、そのタグの子ノードである
			text = child.getFirstChild().getNodeValue();
		}

		//アカウント名の取得
		if ( child.getNodeName() == 'screen_name' ) {
			an = child.getFirstChild().getNodeValue();
		}

		//ユーザ名の取得
		if ( child.getNodeName() == 'name' ) {
			un=child.getFirstChild().getNodeValue();
		}

		//投稿日時の取得
		if ( child.getNodeName() == 'created_at' && child.getParentNode().getNodeName() == 'status' ) {
			date = child.getFirstChild().getNodeValue();
		}

		//投稿アプリケーション名の取得
		if ( child.getNodeName() == 'source' ) {
			via = child.getFirstChild().getNodeValue();
		}

		//リツイート数の取得
		if ( child.getNodeName() == 'retweet_count' ) {
			//存在しない場合もある為、存在チェック
			if( child.getFirstChild() ) {
				rtc = child.getFirstChild().getNodeValue();
			}
		}

		//アイコン画像のURL取得
		if ( child.getNodeName() == 'profile_image_url' ) {
			icon = child.getFirstChild().getNodeValue();
		}

		//アイコンのリンク取得
		if ( child.getNodeName() == 'url' ){
			link = child.getFirstChild().getNodeValue();
		}
		
		//再帰関数
		traceNodes( child );
		child = child.getNextSibling();
	}
	return;
}

//webで取得
function popupTweet() {
	var body = '';
	var pid = 'idstring';
	var url = v2c.context.link;
	
	//ステータスの変数
	var icolink = '';

	//URLが正しいかどうかの確認
	if ( url.toString().match( /(https?:\/\/twitter\.com\/(?:#!\/)?([^\/]+)\/status\/(\d+))/ ) ) {

		//アカウント名の取得
		an = RegExp.$2;

		//ステータスIDの取得
		sid = RegExp.$3;

		//同じURLのポップアップを開いていたら終了
		if ( v2c.context.getPopupOfID( sid ) ) {
			return;
		}

		//htmlにアクセス
		v2c.setStatus( 'popupTweet通信中...' );
		var dat = v2c.readURL( RegExp.$1 );

		//本文の取得
		if ( dat.match( /entry-content">(.+?)<\/span>/i ) ) {
			text = RegExp.$1;
		}

		//投稿日時の取得
		if ( dat.match( /published\stimestamp"[^>]+>(.+?)<\/span>[\s\S]+?<span>(.+?)から/i ) ) {
			date = RegExp.$1;
			via = RegExp.$2;
		}

		//リツイート数の取得
		if ( dat.match( /shared-content">(.+?)人がリツイート/i ) ) {
			rtc = RegExp.$1;
		}

		//ユーザ名の取得
		if ( dat.match( /full-name">(.+?)<\//i ) ) {
			un = RegExp.$1;
		}
		
		//アイコンURL取得
		if ( dat.match( /thumb">.+?href="([^"]+)"[\s\S]+?src="([^"]+)"/i ) ) {
			icolink = RegExp.$1;
			icon = RegExp.$2;
		}

		//テンプレートを読み込み
		var stream = v2c.readFile( v2c.saveDir + '\\script\\popupTweet\\template.txt' );

		//パラメータの置換
		stream = stream.replaceAll( '%aname%', an );
		stream = stream.replaceAll( '%uname%', un );
		stream = stream.replaceAll( '%sid%', sid );
		stream = stream.replaceAll( '%text%', text );
		stream = stream.replaceAll( '%date%', date );
		stream = stream.replaceAll( '%via%', via );
		stream = stream.replaceAll( '%retweet%', rtc );
		stream = stream.replaceAll( '%icon%', icon );
		stream = stream.replaceAll( '%icolink%', icolink );

		//ポップアップの設定
		v2c.context.setPopupHTML( stream );
		v2c.context.setMaxPopupWidth( maxPopupWidth );
		v2c.context.setPopupID( pid );

		return;
	}
	else{
		v2c.alert( '未対応のURLです' );
		return;
	}
}