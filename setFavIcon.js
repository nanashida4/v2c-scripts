//【登録場所】リンク
//【ラベル】リンク先のファビコンを表示する
//【コマンド】${SCRIPT:SF} setFavIcon.js
//【内容】リンク先のファビコンを取得してmsgkw.txtに追加を試みます
//        スレを開き直すとURLの先頭にアイコンが表示されます
//【説明】設定(P) → 外部コマンド(E)… → 一般 → リンク
//        に、ラベル、コマンドを入力して追加
//        レス表示欄の任意のURLリンクを右クリックで「リンク先のファビコンを表示する」を実行するとアイコンがURLの左側に表示されます
//        ※サイトによっては表示できないかもしれません。取得出来ない場合は変なアイコンが表示されると思いますが、
//          「ログ・設定保存用フォルダ/icon/message/」フォルダに、wwwdropboxcom.png(http://www.dropbox.com/のリンクの場合)のような形で保存されているので
//          手動で置き換えてV2C再起動すれば比較的簡単に対応できます。
//        ※一度コマンドを実行したサイトにはmsgkw.txtから手動で削除しない限りこのスクリプトで再取得することはできません。
//        ※サイズは16x16で作成されているのでURL文字列部分と重なるかも
//        ※V2C掲示板などで配布されているmsgkw.txtセットなどのように21x16の右側の余白はスクリプトからは追加できません(そういったwebサービスを行ってるサイトが見つかれば可能)
//【更新日時】2014/04/28 windows以外でも動くようにした。(動作テストはしていません)
//            2014/04/24 rev.1 favicon取得代行サービスを選択できるようにした
//            2014/04/24 初版
//【スクリプト】
// ---- [設定項目] -------------------------------------
// favicon取得代行サービスを選択します。以下の４つの内１つだけ先頭の「//」を外して下さい
//var api = 'http://www.google.com/s2/favicons?domain_url=';  // Googleの非公式API。精度は低く取得できてないケースも目立つ
//var api = 'http://g.etfv.co/';                              // Google AppEngine上で動作してる取得代行サービス。Googleよりは精度が良いがはてなよりは低い
var api = 'http://favicon.hatena.ne.jp/?url=';              // はてなの非公式API。精度が高く、サブディレクトリに設置されているファビコンも取得できるが、古いファビコンだったりするケースもある
//var api = 'http://favicon.qfor.info/f/';                    // ４つの内で一番多くのファビコンを取得できるが知名度の低いサイトには対応してないケースもある

// ---- [設定項目ここまで] -----------------------------


var chk = true;
var host = v2c.context.link.url.host;
var comm = ';setFavIcon.jsによる登録[site:' + host + ']';
var msgkw = v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/msgkw.txt'));
if (!msgkw) chk = false;
msgkw = String(msgkw);
if (msgkw.indexOf(comm) >= 0) chk = false;
var cpcmd = '';
var tmpf = v2c.getScriptDataFile('setFavIcon.tmp');
var OS = java.lang.System.getProperty("os.name").toLowerCase();
if (OS.indexOf('win') >= 0) {
	cpcmd = ['cmd', '/c', 'move', tmpf.getAbsolutePath(), v2c.saveDir + '\\msgkw.txt'];
} else if (/(?:mac|nix|nux|aix|sunos)/.test(String(OS))) {
	cpcmd = ['mv', '-f', tmpf.getAbsolutePath(), v2c.saveDir + '/msgkw.txt'];
} else {
	chk = false;
}
if (chk) {
	var name = String(host).replace(/\./g, '');
	var favurl = api + 'http://' + host + '/';

	var hr = v2c.createHttpRequest(new java.net.URL(favurl));
	var img = hr.getContentsAsBytes();

	if (img && !(typeof img == 'string' || img instanceof String)) {
		v2c.writeBytesToFile(new java.io.File(v2c.saveDir + '/icon/message/' + name + '.png'), img);
		if (msgkw) {
			msgkw += '\n' + comm + '\nACR:Nファビコン用\tm' + name + '\tWh?t?t?ps?://' + host + '(?:/[\\w -./?%&=]*)?\n';
			var tmpf = v2c.getScriptDataFile('setFavIcon.tmp');
			v2c.writeStringToFile(tmpf, msgkw, 'UTF-8');
			v2c.exec(cpcmd);
			java.lang.Thread.sleep('1000');
			v2c.reloadSettingFile('msgkw.txt');
		}
	}
}
