//【登録場所】 全体、レス表示、選択テキスト ※基本は選択テキストで
//【ラベル】 Googleイメージ検索ポップアップ
//【内容】 Googleイメージ検索のサムネイル一覧を簡易ポップアップ表示。 セーフサーチ: 中。 ”他のキーワード”は表示させてない。
//【コマンド1】 ${SCRIPT:S} gimage.js
//【コマンド2】 ${SCRIPT:S} gimage.js 1 //画像のみ
//※選択テキストに加えて、全体かレス表示にも同じ設定をすると設定のShowLastResultが利用可能です。
//【スクリプト】
// ----- 次の行から -----
//設定
var CloseMainOnMouseExit = true; //サムネイル一覧をポップアップ外で閉じるか
var OpenOnImageClick = false; //画像クリックでURLを開くか
var BrowseExt = false; //外部ブラウザ(ture)で開くか、内部(false)で開くか
var OpenClickImage = false; //画像クリックで元画像リンク(true)を開くか、元画像ページリンク(false)を開くか
var PopupImage = false; //ポップアップ(true)するか、ブラウザで開く(false)か ※ポップアップは元画像リンクの場合（↑で選択）のみで「原寸」です。サイズ調整はしません。
var ShowCopyButton = false; //「コピー」ボタンを表示するか
var ShowOpenButton = false; //ブラウザで「開く」ボタンを表示するか
var ShowInsertButton = false; //書き込み欄に「送る」ボタンを表示するか
var InputImageURL = true; //コピー、またはブラウザで開くボタンに元画像リンク(true)を使用するか、元画像ページリンク(false)を使用するか
var ShowLastResult = true; //選択テキストが空の場合、最後に閉じたポップアップを再表示(true)するか、記憶したデータを削除(false)するか
//設定ここまで
var vcx = v2c.context,
	data = v2c.getScriptObject() || {},
	ss = vcx.selText || v2c.prompt('キーワードは？','');
function redirectURL( u ) {
	u = encodeURI( u.toString() );
	if ( u.match( new RegExp( '&safe=images&gbv=1&start=' + '(\\d+?)$', 'i' ) ) ) {
		vcx.closeOriginalPopup();
		data.count = RegExp.$1;
		popupGoogleImage( RegExp.$1 );
		return;
	} else {
		if( OpenClickImage && PopupImage ) {
			vcx.setPopupHTML( '<html><body style="margin:10px 0 10px 10px;"><img src="'+u+'"></body></html>' );
		} else {
			BrowseExt ? v2c.browseURLExt(u) : v2c.browseURL(u);
		}
		return;
	}
}
function formSubmitted( u, sm, sd ) {
	if ( sd.indexOf('copy=') > -1 ) {
		u = (u+'').replace( /\?copy.+?$/i,'' );
		vcx.setClipboardText( u );
	} else if ( sd.indexOf('open=') > -1 ) {
		u = (u+'').replace( /\?open.+?$/i,'' );
		BrowseExt ? v2c.browseURLExt(u) : v2c.browseURL(u);
	} else if ( sd.indexOf('insert=') > -1 ) {
		u = (u+'').replace( /\?insert.+?$/i,'' );
		vcx.insertToPostMessage( u + '\n' );
	}
	return;
}
function popupGoogleImage( count ) {
	var hl = data.html,
		url = 'http://images.google.co.jp/images?q=' + encodeURIComponent(ss) + '&safe=images&gbv=1&start=';
	count = parseInt( count );
	if ( count >= 1001 ) count = 1000;
	var page = count/20;
	if ( !hl[page] ) {
//		v2c.println( 'ページの取得' );
		var sh = v2c.readURL( url + count );
		if ( !sh ) {
			v2c.alert( 'ページを取得できませんでした。' );
			return;
		}
		if ( !sh.match( /(約 [^]+?件[^]+?秒\))/i ) ) {
			v2c.alert( '抽出できませんでした。（検索結果数）' );
			return;
		}
		var sr = RegExp.$1;
		sh = RegExp.rightContext;
		if ( !sh.match( /(<table[^]+?<\/table>)/i ) ) {
			v2c.alert( '抽出できませんでした。（イメージ一覧）' );
			return;
		}
		var tr = RegExp.$1;
		if ( count ) {
			var pl = '';
			if( count >= 980 ) {
				pl = '<a href="' + url + ( count - 20 ) + '">&#9664;前へ</a>';
			} else {
				pl = '<a href="' + url + ( count - 20 ) + '">&#9664;前へ</a>　<a href="' + url + ( count + 20 ) + '">次へ&#9654;</a>';
			}
		} else {
			pl = '<a href="' + url + 20 + '">次へ&#9654;</a>';
		}
		tr = tr.replace(/\/imgres\?imgurl=(.+?)&amp;imgrefurl=(.+?)&amp;usg=.+?("><img.+?<\/a>)(.+?)(<\/td>)/ig,
			function(a,u,r,g,i,e) {
				if ( parseInt(vcx.args[0]) ) i = '';
				if ( ShowCopyButton || ShowOpenButton || ShowInsertButton ) {
					if( InputImageURL ) {
						i += '<form action="' + u + '">'; //画像リンク
					} else {
						i += '<form action="' + r + '">'; //画像元ページリンク
					}
					if( ShowCopyButton ) i += '<input type="submit" name="copy" value="コピー">';
					if( ShowOpenButton ) i += '<input type="submit" name="open" value="開く">';
					if( ShowInsertButton ) i += '<input type="submit" name="insert" value="送る">';
				}
				e = '</form>' + e;
				if ( OpenOnImageClick ) {
					if( OpenClickImage ) {
						u = decodeURIComponent(u); //画像リンク
					} else {
						u = decodeURIComponent(r); //画像元ページリンク
					}
				} else {
					u = ''
				}
				return u+g+i+e;
			});
		hl[page] = '<html><body style="margin:10px;"><h2>検索結果　：　' + ss
				+ '</h2><center style="text-align:right;">' + sr + '<center>' + pl + '</center>'
				+ '</center><br>' + tr + '<center>' + pl + '</center></body></html>';
		data.html = hl;
		v2c.setScriptObject( data );
	}
//	vcx.setResPaneHTML( hl[page], ss, true );//新レスタブ
	vcx.setPopupHTML( hl[page] );//ポップアップ
	vcx.setRedirectURL( true );
	if( CloseMainOnMouseExit ) vcx.setCloseOnMouseExit( true );
	vcx.setCloseOnLinkClick( false );
	vcx.setTrapFormSubmission( true );
}
function createPopupString() {
	if ( ss ) {
		ss = ss.trim();
	}
	if ( !ss || ss.length() == 0 ) {
		if ( !data.keyword || !data.html ) {
			v2c.alert( '検索語を取得できませんでした。' );
			return;
		} else {
			if ( ShowLastResult && data.count ) {
				ss = data.keyword; //データの再利用
			} else {
				v2c.setScriptObject( {} );
				v2c.alert( 'データを削除しました。' );
				return;
			}
		}
	} else if ( data.html && data.keyword && ss == data.keyword ) {
		data.count = 0;
	} else {
		data.keyword = ss;
		data.html = [];
		data.count = 0;
	}
	popupGoogleImage( data.count );
}
createPopupString();
// ----- 前の行まで -----