//【登録場所】リンク、URLExec
//【ラベル】Tweetのポップアップ
//【内容】Tweetのポップアップ
//【コマンド】${SCRIPT:Fr} popupTweet.js
//【URLExec】https?://twitter\.com/(?:#!/)?[^/]+?/status/\d+	$&	${V2CSCRIPT:Fr} popupTweet.js
//【スクリプト】
// ----- 次の行から -----
//設定
//ポップアップの最大幅
var maxPopupWidth = 400;

//実行
popupTweet();

function popupTweet(){
	var body = '';
	var pid = 'idstring';
	var url = v2c.context.link;
	
	//ステータスの変数
	var an = '';
	var un = '';
	var sid = '';
	var text = '';
	var date = '';
	var via = '';
	var rtc = '';
	var icon = '';
	var icolink = '';

	//URLオブジェクトがあるかどうかの確認
	if (!url ){
		v2c.alert( 'URL取得失敗' );
		return;
	}

	//URLが正しいかどうかの確認
	if( url.toString().match( /(https?:\/\/twitter\.com\/(?:#!\/)?([^\/]+)\/status\/(\d+))/ ) ){

		//アカウント名の取得
		an = RegExp.$2;

		//ステータスIDの取得
		sid = RegExp.$3;

		//重複防止のためのポップアップID取得
		var pid = an + sid;

		//同じURLのポップアップを開いていたら終了
		if( v2c.context.getPopupOfID( pid ) ){
			return;
		}

		//htmlにアクセス
		v2c.setStatus( 'popupTweet通信中...' );
		var dat = v2c.readURL( RegExp.$1 );

		//本文の取得
		if( dat.match( /entry-content">(.+?)<\/span>/i ) ){
			text = RegExp.$1;
		}

		//投稿日時の取得
		if( dat.match( /published\stimestamp"[^>]+>(.+?)<\/span>[\s\S]+?<span>(.+?)から/i )){
			date = RegExp.$1;
			via = RegExp.$2;
		}

		//リツイート数の取得
		if( dat.match( /shared-content">(.+?)人がリツイート/i ) ){
			rtc = RegExp.$1;
		}

		//ユーザ名の取得
		if( dat.match( /full-name">(.+?)<\//i ) ){
			un = RegExp.$1;
		}
		
		//アイコンURL取得
		if( dat.match( /thumb">.+?href="([^"]+)"[\s\S]+?src="([^"]+)"/i )){
			icolink = RegExp.$1;
			icon = RegExp.$2;
		}

		//テンプレートを読み込み
		stream = v2c.readFile( v2c.saveDir + '\\script\\popupTweet\\template.txt' );

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
// ----- 前の行まで -----
