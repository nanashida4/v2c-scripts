//【登録場所】リンク、URLExec
//【ラベル】Youtube動画情報
//【内容】Youtube動画情報のポップアップ
//【コマンド】${SCRIPT:FrxS} PopupStatusYoutube.js
//【URLExec*】https?://(?:\w+\.)?youtube\.(?:\w+|co\.\w+)/.*?v=[\-_\w]{11}.*	$&	${V2CSCRIPT:FrxS} PopupStatusYoutube.js
//【URLExec*(短縮URL用)】http://youtu\.be/[\-_\w]{11}	$&	${V2CSCRIPT:FrxS} PopupStatusYoutube.js
//【更新日時】2013/09/11 再生できない動画のステータスのyt:state name=processing時にスクリプトエラーが発生するケースの回避コードを追加
//【スクリプト】

// 実行時間計測用
// var odate = new Date;

// ============ 設定ここから ============
var closePopup = true;// リンククリックでポップアップを閉じるかどうか
var browseExt = false;// リンククリック時、外部ブラウザで開くかどうか(urlExecが優先)
var urlExec = true;// リンククリック時、URLExec.datの設定に従うかどうか
var browserPath = 'C:/Program Files/Internet Explorer/iexplore.exe';//URLEcex.datの設定に従うときに使用する規定のブラウザのパス(「\」は「/」に置換してください)
var zeroDate = true;// 日付の桁揃えをするかどうか
var zeroTime = true;// 時間の桁揃えをするかどうか
var commentMax = 500;// 表示する投稿者コメントの最大文字数(0で無制限)
var formatType = 2;// 数値のフォーマット（0：なし 1：3桁カンマ区切り 2：日本語表記）
var tagSeparater = '　';//タグの区切り文字(半角スペースは&nbsp;)
var maxPopupWidth = 500;// ポップアップの最大横幅
var closeOnMouseExit = true;// ポップアップからマウスカーソルを外した時、自動的に閉じるかどうか
var errorPopup = true;// エラーの時、エラー内容をポップアップとして表示
var ratingBarWidth = 150;// レーティングバーの長さ（単位pxを想定）
var downloaderPath = '';// ダウンローダのパス(「\」は「/」に置換してください)
var downloaderArgs = '$PSYURL';// ダウンローダに渡す引数($PSYURLを動画URLに置換して渡します)
var popupFocusable = true;// ポップアップの文字列を選択できるようにするかどうか
// ============ 設定ここまで ============

var info = [];
v2c.setStatus('PopupStatusYoutubeスクリプト実行中...');
PopupStatusYoutube();

// v2c.print( '実行時間：'+ (new Date - odate) + 'msec\n' );

// リンククリック時に呼ばれる関数
function redirectURL( u ) {
	if ( u ) {
		// ポップアップを再度開く
		if ( !closePopup ) {
			v2c.context.setPopupHTML( html );
			v2c.context.setMaxPopupWidth( maxPopupWidth );
			v2c.context.setRedirectURL( true );
			v2c.context.setPopupID( info.vid );
			v2c.context.setPopupFocusable( popupFocusable );
		}
		// URLExec
		if ( urlExec ) {
			v2c.println('teste');
			var f = openURLExec( u );
			if (f) return;
		}
		// 外部ブラウザで開く
		if ( browseExt ) {
			v2c.println('teste');
			v2c.browseURLExt( u );
		}
		// JDICがあれば内部ブラウザで開く
		else{
			v2c.browseURL( u );
		}
	}
	return;
}

function formSubmitted ( u, sm, sd ) {
	var data = '';
	if ( sd.match( /(.+)=.+/i ) ) {
		var data = RegExp.$1;
		data = decodeURIComponent(data);
		switch (data) {
			case 'Fix':
				v2c.context.closeOriginalPanel();
				closePopup = true;
				v2c.context.setPopupHTML( html );
				v2c.context.setCloseOnLinkClick( false ) 
				v2c.context.setCloseOnMouseExit( false );
				v2c.context.setMaxPopupWidth( maxPopupWidth );
				v2c.context.setTrapFormSubmission( true );
				v2c.context.setRedirectURL( true );
				v2c.context.setPopupID( info.vid );
				v2c.context.setPopupFocusable( popupFocusable );
				break;
			case 'DL':
				if ( downloaderPath ) {
					downloaderArgs = downloaderArgs.replace( /\$PSYURL/, info.url );
					v2c.exec( [ downloaderPath, downloaderArgs ] );
				} else {
					v2c.alert( 'ダウンローダーのパスを設定してください' );
				}
				break;
			case 'Ext':
				// 外部ブラウザボタンクリック時、
				// ポップアップを閉じない場合はこの下の行をコメントアウト
				v2c.context.closeOriginalPanel();
				v2c.browseURLExt( info.url );
				break;
			case 'CopyTitle':
				v2c.context.setClipboardText( info.title );
				break;
			case 'CopyURL':
				v2c.context.setClipboardText( info.url );
				break;
			case 'CopyTytle+URL':
				v2c.context.setClipboardText( info.title + '\n' + info.url );
				break;
			case 'CopyInfo':
				var str = info.title + '\n'
					+ info.url + '\n'
					+ '再生時間：' + info.time
					+ '\n投稿者名：' + info.name
					+ '\n投稿日時：' + info.ye + '/' + info.mo + '/' + info.da + ' ' + info.ho + ':' + info.mi + ':' + info.se
					+ '\n再生回数：' + info.viewCount
					+ '回\nお気に入り：' + info.favCount
					+ '\n評価：高評価 ' + info.like + ' 人、低評価 ' + info.dislike + ' 人';
				v2c.context.setClipboardText( str );
				break;
		}
	}
	return;
}

function PopupStatusYoutube() {
	info.vid = '';			// 動画ID
	info.url = '';			// 動画URL
	info.thumb = '';		// サムネイルURL
	info.title = '';		// 動画タイトル
	info.date = '';			// 投稿日時
	info.ye = '';			// 西暦
	info.mo = '';			// 月
	info.da = '';			// 日
	info.ho = '';			// 時
	info.mi = '';			// 分
	info.se = '';			// 秒
	info.ms = '';			// ミリ秒 ※多分常に0
	info.name = '';			// 投稿者名
	info.uri = '';			// 投稿者URI
	info.keywords = 'なし';	// キーワード(タグ)
	info.time = '';			// 再生時間
	info.viewCount = '0';	// 再生回数
	info.favCount = '0';	// お気に入り数
	info.comment = '説明はありません';	// 投稿者コメント
	info.like = 0;			// 高評価
	info.dislike = 0;		// 低評価
	info.likeWidth = 0;		// 高評価バーの長さ
	info.state = '';		// エラー情報
	
	// ポップアップIDの初期化
	var pid = 'idstring';
	
	// URLオブジェクトの取得
	var url = v2c.context.link;
	info.url = url;

	// URLオブジェクトがあるかどうかの確認
	if ( !url ) {
		v2c.print( 'URL取得失敗\n\n' );
		if ( errorPopup ) onErrorPopup( 'URL取得失敗' );
		return;
	}

	// URLがYoutubeかどうか
	if ( url.toString().match( /h?t?tps?:\/\/(?:\w+\.)?youtube\.(?:\w+|co\.\w+)\/.*?v=([\-_\w]{11}).*/i ) ) {
		info.vid = RegExp.$1;
		var xmlUrl = 'http://gdata.youtube.com/feeds/api/videos/' + info.vid;
	} else if ( url.toString().match( /h?t?tps?:\/\/youtu\.be\/([\-_\w]{11})/i ) ) {
		info.vid = RegExp.$1;
		var xmlUrl = 'http://gdata.youtube.com/feeds/api/videos/' + info.vid;
	}
	else{
		if ( errorPopup ) onErrorPopup( 'YoutubeのURLではない' );
		v2c.print( 'Error:YoutubeのURLではない\n' );
		return;
	}
	
	// VIDEO_ID取得失敗
	if ( !info.vid  ) {
		v2c.print( 'Error:VIDEO_ID取得失敗\n' + url + '\n' );
		if ( errorPopup ) onErrorPopup( 'VIDEO_ID取得失敗' );
		return;
	}
	
	// 同じURLのポップアップを開いていたら終了
	if ( v2c.context.getPopupOfID( info.vid ) ) {
		v2c.print( 'Error:同じURLのポップアップ\n' );
		return;
	}

	// XML DOMオブジェクトの作成
	try {
		var dbf = javax.xml.parsers.DocumentBuilderFactory.newInstance();
		var db = dbf.newDocumentBuilder();
		var doc = db.parse( xmlUrl ); // GET
	}
	catch (e) {
		v2c.print( 'Error:XMLの取得に失敗\n' + e + '\n' );
		if ( errorPopup ) {
			if ( e.toString().indexOf('java.io.FileNotFoundException') != -1 ) {
				onErrorPopup( 'この動画は削除されています', info.vid );
			} else if ( e.toString().indexOf('Server returned HTTP response code: 403') != -1 ) {
				onErrorPopup( '動画情報にアクセス出来ません\nこの動画は非公開等の理由で閲覧できない可能性があります', info.vid );
			} else {
				onErrorPopup( '動画情報へのアクセスに失敗しました', info.vid );
			}
		}
		return;
	}
	
	// XML解析
	traceNodes( doc );
	
	// 投稿日時をUTC→ローカル時間に ISO8601形式 例:2010-01-01T00:00:00.000Z
	if( info.date.match( /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z/ ) ) {
		var dd = new Date( RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6, RegExp.$7 );
		info.ye = dd.getUTCFullYear().toString();
		info.mo = dd.getUTCMonth().toString();
		info.da = dd.getUTCDate().toString();
		info.ho = dd.getUTCHours().toString();
		info.mi = dd.getUTCMinutes().toString();
		info.se = dd.getUTCSeconds().toString();
		info.ms = dd.getUTCMilliseconds().toString();
		
		// 12月=0月？
		if ( info.mo==0 ) {
			info.mo = '12';
		}
		
		// 日付の桁揃え
		if ( zeroDate ) {
			info.mo = zeroPlus( info.mo );
			info.da = zeroPlus( info.da );
		}
		
		// 時間の桁揃え
		if ( zeroTime ) {
			info.ho = zeroPlus( info.ho );
			info.mi = zeroPlus( info.mi );
			info.se = zeroPlus( info.se );
		}
	}
	
	// キーワードにリンクを付ける
	info.keywords = info.keywords.replace( ' ', '' );
	info.keywords = info.keywords.replace( '　', '' );
	tmp = info.keywords.split( ',' );
	if ( info.keywords != 'なし' ) {
		info.keywords = '';
		for ( i = 0; i < tmp.length; i++ ) {
			info.keywords = info.keywords 
				+ '<a href="http://www.youtube.com/results?search_query='
				+ encodeURIComponent( tmp[i] ) + '&search=tag">'
				+ tmp[i] + '</a>' + tagSeparater;
		}
	}

	// 再生時間の整形
	info.time = zeroPlus( parseInt( info.time / 3600 ) ) + '：' 
			+ zeroPlus( parseInt ( ( info.time % 3600 ) / 60 ) ) + '：' 
			+ zeroPlus( ( info.time % 3600 ) % 60 );
			
	// コメントの文字数制限の適用
	// コメントをjavascriptのString形式に変換
	info.comment += '';
	if ( commentMax ) {
		tmp = info.comment;
		tmp2 = 0;
		reg = new RegExp( '(https?:\/\/[\-_\.!~*\'\(\)a-zA-Z0-9;\/\?:\@&=?+\$,%#]+)', 'i' );
		// コメント中のURLが途中で切れないようにするための処理
		while(1){
			if( tmp.match( reg ) ) {
				tmp2 = tmp2 + RegExp.leftContext.length + RegExp.$1.length;
				if( tmp2 > commentMax ){
					commentMax = tmp2;
					break;
				}
				tmp = RegExp.rightContext;
			}
			else{
				break;
			}
		}
		// コメントのカット
		if ( info.comment.length > commentMax ) {
			info.comment = info.comment.slice( 0, commentMax ) + ' ...';
		}
	}
	// コメントにリンクを付ける
	tmp = info.comment;
	info.comment = '';
	while (1) {
		if ( tmp.match( reg ) ) {
				info.comment = info.comment + RegExp.leftContext 
					+ '<a href="' + RegExp.$1 + '">' + RegExp.$1 + '</a>';
				tmp = RegExp.rightContext;
		}
		else {
			info.comment += tmp; 
			break;
		}
	}
	
	// 数値の整形
	info.viewCount = formatNum( info.viewCount, formatType );
	info.favCount = formatNum( info.favCount, formatType );
	
	// 置換文字に「$」が入っているとエラーが出る問題の修正
	info.title = (info.title+'').replace( /\$/g, '＄' );
	info.comment = (info.comment+'').replace( /\$/g, '＄' );
	info.keywords = (info.keywords+'').replace( /\$/g, '＄' );
	
	// エラーの場合コメントにエラーの理由を設定
	if ( !info.thumb && info.state ) {
		if ( errorPopup ) onErrorPopup( info.state );
		v2c.print( 'Error:' + info.state + '\n' );
		return;
	}
	
	// テンプレートを読み込み
	var fs = java.io.File.separator;
	html = v2c.readFile( v2c.saveDir + fs + 'script' + fs + 'PopupStatusYoutube'
		+ fs + 'template.txt' );
	
	// デバッグ用 変数出力
	//for ( i in info ) { v2c.print( 'info.' + i + ' = ' + info[i] + '\n' ); }
	
	// パラメータの置換
	html = html.replaceAll( '%vid%', info.vid )
		.replaceAll( '%thumb%', info.thumb )
		.replaceAll( '%title%', info.title )
		.replaceAll( '%ye%', info.ye )
		.replaceAll( '%mo%', info.mo )
		.replaceAll( '%da%', info.da )
		.replaceAll( '%ho%', info.ho )
		.replaceAll( '%mi%', info.mi )
		.replaceAll( '%comment%', info.comment )
		.replaceAll( '%name%', info.name )
		.replaceAll( '%uri%', info.uri )
		.replaceAll( '%keywords%', info.keywords )
		.replaceAll( '%time%', info.time )
		.replaceAll( '%viewCount%', info.viewCount )
		.replaceAll( '%favCount%', info.favCount )
		.replaceAll( '%movie%', url )
		.replaceAll( '%like%', info.like )
		.replaceAll( '%dislike%', info.dislike )
		.replaceAll( '%likeWidth%', info.likeWidth );

	// ポップアップの設定
	v2c.context.setPopupHTML( html );
	v2c.context.setMaxPopupWidth( maxPopupWidth );
	v2c.context.setCloseOnMouseExit( closeOnMouseExit );
	v2c.context.setTrapFormSubmission( true );
	v2c.context.setRedirectURL( true );
	v2c.context.setPopupID( info.vid );
	v2c.context.setPopupFocusable( popupFocusable );
}

// 全てのXMLノードを走査
function traceNodes( node ) {
	var child = node.getFirstChild();

	// 子ノードが無くなるまで繰り返し
	while ( child != null ) {

		// ノードが持つ属性(NamedNodeMap)
		var attrs = child.getAttributes();

		// 動画タイトルの取得
		if ( child.getNodeName() == 'title' ) {
			// テキストノード
			info.title = child.getFirstChild().getNodeValue();
		}
		
		// サムネイルURLの取得
		if ( child.getNodeName() == 'media:thumbnail' ) {
			var tmp = attrs.getNamedItem( 'url' ).getNodeValue();
			if ( tmp.match( /http:\/\/.+?0\.jpg/i ) ) {
				info.thumb = tmp;
			}
		}

		// 投稿日時の取得 <published>
		if ( child.getNodeName() == 'published' ) {
			info.date = child.getFirstChild().getNodeValue();
		}

		// 投稿者コメントの取得
		if ( child.getNodeName() == 'content' ) {
			//存在しない場合もある為、存在チェック
			if( child.getFirstChild() ) {
				info.comment = child.getFirstChild().getNodeValue();
			}
		}

		// 投稿者名の取得
		if ( child.getNodeName() == 'name' ) {
				info.name = child.getFirstChild().getNodeValue();
				info.uri = 'http://www.youtube.com/user/' + info.name;
		}
		
		// 投稿者URLの取得

		// キーワード(タグ)の取得
		if ( child.getNodeName() == 'media:keywords' ) {
			// 存在しない場合もある為、存在チェック
			if( child.getFirstChild() ) {
				info.keywords = child.getFirstChild().getNodeValue();
			}
		}

		// 再生時間の取得
		if ( child.getNodeName() == 'yt:duration' ) {
			// タグの属性として格納されている
			if( attrs ) {
				// 再生時間(秒)の取得
				if( attrs.getNamedItem( 'seconds' ) ) {
					info.time = attrs.getNamedItem( 'seconds' ).getNodeValue();
				}
			}
		}

		// 再生回数、お気に入り数の取得
		if ( child.getNodeName() == 'yt:statistics' ) {
			if(attrs){
				// 再生回数の取得
				if( attrs.getNamedItem( 'viewCount' ) ) {
					info.viewCount = attrs.getNamedItem('viewCount').getNodeValue();
				}
				// お気に入り数の取得
				if( attrs.getNamedItem( 'favoriteCount' ) ) {
					info.favCount = attrs.getNamedItem('favoriteCount').getNodeValue();
				}
			}
		}
		
		// 評価の取得
		if ( child.getNodeName() == 'gd:rating' ) {
			if(attrs){
				var average = attrs.getNamedItem('average').getNodeValue();
				var numRaters =  attrs.getNamedItem('numRaters').getNodeValue();
				// ratingは、高評価=5・低評価=1の2種のみとして算出
				if ( average && numRaters ) {
					info.like = Math.round( numRaters * ( average - 1 ) / 4 );
					info.dislike = numRaters - info.like ;
					info.likeWidth = Math.round( ratingBarWidth * ( info.like / numRaters ) );
				}
			}
		}
		
		// 再生できない動画のステータス
		if ( child.getNodeName() == 'yt:state' ) {
			if(attrs){
				var name = attrs.getNamedItem('name').getNodeValue();
				if ( name == 'processing') { 
					info.state = 'この動画は現在閲覧できません。';
				} else {
					var reasonCode =  attrs.getNamedItem('reasonCode').getNodeValue();
					if ( reasonCode ) {
						if ( reasonCode == 'requesterRegion' ) info.state = 'この動画はユーザーの地域では利用できません。';
						// これ以下は通常403が返る？
						else if ( reasonCode == 'private' ) info.state = 'この動画は非公開動画です。';
						else if ( reasonCode == 'copyright' ) info.state = '動画が著作権を侵害しています。';
						else if ( reasonCode == 'inappropriate' ) info.state = '動画に不適切なコンテンツが含まれています。';
						else if ( reasonCode == 'termsOfUse' ) info.state = '動画が利用規約に違反しています。';
						else if ( reasonCode == 'suspended' ) info.state = '動画に関連付けられたアカウントは停止されています。';
						else if ( reasonCode == 'blocked' ) info.state = '動画がコンテンツの所有者によりブロックされています';
						else info.state = '';
					}
				}
			}
		}

		
		// 再帰
		traceNodes( child );
		child = child.getNextSibling();
	}
	return;
}

// 桁揃え関数
function zeroPlus( str ) {
	return ( '0' + str ).slice( -2 );
}

// フォーマット関数
function formatNum( num, type ) {
	var str = java.lang.String.valueOf(num);
	var tmp = new Array();
	var mod,i;
	// 3桁カンマ区切り
	if ( type == 1 ) {
		mod = str.length() % 3;
		if ( mod ) {
			tmp.push( str.substring( 0, mod ) );
		}
		for ( i = 0; i < parseInt( str.length() / 3 ); i++) {
			tmp.push( str.substring( mod, mod + 3 ) );
			mod += 3;
		}
		return tmp.join(',');
	}
	// 日本語表記、億まで対応
	if ( type == 2 ) {
		mod = str.length() % 4;
		// 億以上
		if ( 2 <= parseInt( str.length() / 4 ) ){
			if ( mod ) {
				tmp.push( str.substring( 0, mod ) + '億' );
			}
			if ( str.substring( mod, mod + 4 ).match( /0{0,3}([1-9](\d+)?)/ ) ) {
				tmp.push( RegExp.$1 + '万' );
			}
			if ( str.substring( mod + 4, mod + 8 ).match( /0{0,3}([1-9](\d+)?)/ ) ) {
				tmp.push( RegExp.$1 );
			}
		}
		// 億未満、万以上
		else if ( 1 <= parseInt( str.length() / 4 ) ) {
			if ( mod ) {
				tmp.push( str.substring( 0, mod ) + '万' );
			}
			if ( str.substring( mod, mod + 4 ).match( /0{0,3}([1-9](\d+)?)/ ) ) {
				tmp.push( RegExp.$1 );
			}
		}
		// 万未満
		else {
			tmp.push( str );
		}
		return tmp.join('');
	}
	// そのまま
	else {
		return str;
	}
}

function onErrorPopup( errStr, vid ) {
	if ( !vid ) vid = 'None';
	v2c.context.setPopupText( errStr );
	v2c.context.setMaxPopupWidth( maxPopupWidth );
	v2c.context.setCloseOnMouseExit( true );
	v2c.context.setTrapFormSubmission( false );
	v2c.context.setRedirectURL( false );
	v2c.context.setPopupID( 'PSY_' + vid );
}

function openURLExec( url ) {
	var url = new java.lang.String( url );
	var fs = java.io.File.separator;
	var tmp = v2c.readFile( v2c.saveDir + fs + 'URLExec.dat', 'Shift-JIS' );
	if ( !tmp ) {
		v2c.println( 'URLExec.datが見つかりませんでした' );
		return false;
	}
	var lines = tmp.split( '\n' );
	var ptn = java.util.regex.Pattern.compile("^(?<!;|'|//)([^\t]+\t){2}[^\t]+$");
	for( var i=0,len=lines.length; i<len; i++ ) {
		var matcher = ptn.matcher(lines[i]);
		if ( matcher.matches() ) {
			//v2c.println( '有効行：' + matcher.group(0) );
		} else {
			//v2c.println( '！無効行：' + lines[i] );
			continue;
		}
		
		var matchFlg = false;
		var item = lines[i].split( '\t' );
		if ( item.length != 3 ) { // 念のため
			v2c.println( 'Tabの数が不正：' + (item.length-1) );
			continue;
		}
		item[1] = (new java.lang.String(item[1])).replaceAll( '\\$&', '\\$0' );
		
		try {
			var ptn2 = java.util.regex.Pattern.compile(item[0]);
		} catch( e ) { // 不正な正規表現を無視
			v2c.println( e );
			continue;
		}
		if ( ptn2.matcher(url).find() ) {
				matchFlg = true;
				url = url.replaceFirst( item[0], item[1] );
				break;
		}
	}
	if ( !matchFlg ) {
		v2c.println( 'URLExec.dat：マッチなし\n' + url );
		return false;
	}

	var cmds = item[2].split( ' ' );
	if ( cmds.length == 0 ) {
		v2c.println( 'URLExec.dat：コマンドがありません' );
		return false;
	}
	for ( i=0; i<cmds.length; i++ ) {
		var matcher = java.util.regex.Pattern.compile('\\$VIEW').matcher(cmds[i]);
		if ( matcher.find() ) {
			if ( i==0 ){
				v2c.println( 'URLExec.dat：無効なキーワード"$VEIW"' );
				return false;
			}
		}
		
		// $BROWSER
		if ( browserPath ) {
			cmds[i] = cmds[i].replaceAll( '\\$BROWSER', browserPath );
		} else {
			// ブラウザを指定していない場合で、更にURLExec.datのコマンドが、
			// ブラウザにURLを渡すだけの場合はデフォルト外部ブラウザで開く(応急処置)
			if( item[2].matches( '"?\\$BROWSER"? "?\\$(URL|LINK)"?' ) ) { //完全一致
				v2c.browseURLDefExt(url);
				v2c.println( 'cmd='+item[2] );
				return true;
			}
		}
		
		// $LINK 置換しない場合は、この下の行をコメントアウト
		cmds[i] = cmds[i].replaceAll( '\\$LINK', url );
		
		// $URL 置換しない場合は、この下行をコメントアウト
		cmds[i] = cmds[i].replaceAll( '\\$URL', url );
		
		// $BASEPATH
		if ( i==0 ) {  // コマンドの場合
			cmds[i] = cmds[i].replaceAll( '\\$BASEPATH', v2c.saveDir.toString()
				.replaceAll( '\\\\', '/' ) + '/' );
		} else { // 引数の場合
			cmds[i] = cmds[i].replaceAll( '\\$BASEPATH', v2c.saveDir.toString()
				.replaceAll( '\\\\', '\\\\\\\\' ) + '\\\\' );
		}
		
		// $POSX $POSY
		var p = v2c.context.mousePos;
		if ( p ) {
			cmds[i] = cmds[i].replaceAll( '\\$POSX', p.x );
			cmds[i] = cmds[i].replaceAll( '\\$POSY', p.y );
		}
		v2c.println( 'cmd['+i+']='+cmds[i] );
	}
	v2c.exec(cmds);
	return true;
}