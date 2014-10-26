//【登録場所】 全体、レス表示
//【ラベル】 テレビ実況板の勢いポップアップ
//【内容】 http://bc2ch.net/から”勢い”と部分をポップアップ表示する。
//【コマンド1】 $SCRIPT tv.js
//【スクリプト】
//設定
var closeOnMouseExit = false; //カーソルをポップアップ内から外に移動で、そのポップアップを閉じる
var closeOnLinkClick = false; //ポップアップのリンクをクリックで、そのポップアップを閉じる
//設定ここまで

var vcx = v2c.context;
vcx.setDefaultCloseOnMouseExit( closeOnMouseExit );
function createPopupString() {
	var html = v2c.readURL('http://bc2ch.net');
	if (html) {
		html = String(html);
		html = html.split('<div id="content_area_upper"></div>')[1];
		html = html.split('<div id="content_middle_a">')[0];
		var tmp;
		if (/<li>(\d{4}\/\d{2}\/\d{2}\([月火水木金土日]\))/.exec(html)) {
			tmp = '<table><tr><td>' + RegExp.$1 + '</td>';
		}
		if (/<span id="renew_his">(.*?)<\/span>.*?(レス総数 : \d+res\/分)/.exec(html)) {
			tmp += '<td>' + RegExp.$1 + '</td><td>' + RegExp.$2 + '</td>';
		}
		if (/(\(更新間隔:約\d+分\))/.exec(html)) {
			tmp += '<td>' + RegExp.$1 + '</td></tr></table>';
		}
		html = html.replace(/(<div id="content_area_upper2_left">.*?)<table class="sitetotal">/, tmp);
		html = tmp + '<table class="sitetotal">' + html.split('<table class="sitetotal">')[1];

		html = '<html><head><link rel="stylesheet" media="screen,projection" type="text/css" href="http://static.bc2ch.net/jp/pc/v1/css/reset.css" title="04">' +
				'<link rel="stylesheet" media="screen,projection" type="text/css" href="http://static.bc2ch.net/jp/pc/v1/css/base.css" title="04" />' +
				'<link rel="stylesheet" media="screen,projection" type="text/css" href="http://static.bc2ch.net/jp/pc/v1/css/user.css" title="04" />' +
				'</head><body><div id="wrap"><div id="clear"></div><div id="content_title"><a href="http://bc2ch.net"><h3>現在の勢い</h3></a></div>' +
				'<div id="content_area">' + html + '</div></div></body></html>';
	  vcx.setPopupHTML(html);
	  vcx.setRedirectURL(false);
	  vcx.setPopupFocusable(true);
	  if ( !closeOnLinkClick ) vcx.setCloseOnLinkClick(false);
  }
}
createPopupString();