//【登録場所】 レス表示
//【ラベル】BEプロフを表示する
//【内容】文字化けさせずにBE2.0βをポップアップ表示するスクリプト (V2C標準のポップアップ表示だと文字化けする)
//【コマンド】$SCRIPT beProfPopup.js
//【更新日時】2014/06/13 BEの仕様変更に対応
//            2014/05/22 rev.1 旧式のBEプロフ(2ch.sc)の表示機能を追加
//            2014/05/22 初版
//【スクリプト】
var cx = v2c.context;

/* [設定項目] 有効にする場合以下の行頭の//外す ---------------- */
//  cx.setCloseOnMouseExit(true);   // ポップアップからマウスを外したとき閉じる
  cx.setPopupFocusable(true);     // ポップアップ上の文字をマウスで範囲選択可能にする
//  cx.setCloseOnLinkClick(false);  // ポップアップ上でクリックしたとき閉じる
/* ------------------------------------------------------------ */

var beID = (/ BE:(\d+)/.test(cx.res.source)) ? RegExp.$1 : '';
var thURL = cx.thread.url;
var errmes = [
	'[beProfPopup.js] BEプロファイルのWebページを取得できませんでした。',
	'[beProfPopup.js] BE番号(' + beID + ')が正しくないので取得できませんでした。',
	'[beProfPopup.js] BEプロファイルWebページのフォーマット変わったようです。スクリプトを修正してください'
];

var html = v2c.readURL('http://be.2ch.net/test/p.php?i=' + beID + '&u=d:' + thURL);
if (!html) { throw errmes[0]; }
else if (html == 'NG') { throw errmes[1]; }
else if (html.length() == 0) { beProfSc(); }
else {
	try {
		html = html.split('<div class="ic panel panel-default pull-left">');
		html =  '<html><body style="font-size:12px;"><h5 class="pull-right"> BE 2.0 β</h5>' + html[1].split('<!--info panel panel-default-->')[0] + '</body></html>';
		html = html.replace(/(<h5><strong>ポイント:)/, '<h3><strong>BEID番号:</strong<span>' + beID + '</span></h3>$1').replace(/<(\/?h)5>/g, '<$13>')
	} catch(e) {
		throw errmes[2];
	}
	v2c.context.setPopupHTML(html);
}
function beProfSc()
{
	html = v2c.readURL('http://be.2ch.sc/test/p.php?i=' + beID + '&u=d:' + thURL);
	if (!html) { errmes[0]; }
	else if (html == 'アカウント停止中') { throw errmes[1]; }
	else {
		try {
			var img  = html.match(/<img src="http:\/\/img\.2ch\.sc\/ico[^>]+>/);
			var tmp = html.match(/\n\n<p>\n(.*?)<\/p>\n\n<p><b>beポイント<\/b>:(\d+)<\/p>\n<p><b>登録日<\/b>:([0-9\-]+)<\/p>/);
			var name = tmp[1];
			var point= tmp[2];
			var regd = tmp[3];
			var comm = String(html.split('<p><b>紹介文</b></p>')[1]).match(/<p>(.*?)<\/p>/)[1];
			var trip = (/◆([a-zA-Z0-9\/\.]{10})/.test(comm)) ? RegExp.$1 : '';
			var html = '<html><body><div><center><div><h3>Profile</h3><br>'
					 + '<div>' + img + '</div><br><br>'
					 + '<div style="width:100%;word-wrap:break-word;text-align:left;">'
					 + 'BE番号: ' + beID + '<br><br>'
					 + '名前: ' + name + '<br><br>'
					 + 'ポイント: ' + point + '<br><br>'
					 + '登録日: ' + regd + '<br><br>'
					 + 'トリップ: ◆' + trip
					 + '<br><br><b>紹介文</b><br> <br>' + comm + '</div>'
					 + '<br><br><div><br></div></div></center></div></body></html>';
		} catch(e) {
			throw errmes[2];
		}
		v2c.context.setPopupHTML(html);
	}
}