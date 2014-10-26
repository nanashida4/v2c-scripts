//【登録場所】全体
//【ラベル】V2C非対応板用の書き込み欄を開く
//【内容】警告なしでふたば、爆サイ書き込みパネルを開く
//        ※V2Cの書き込み欄を閉じた状態で本スクリプトを実行した場合は書き込み欄の書き込み内容を反映できません。
//【コマンド】${SCRIPT:A} openWritePanel.js
//【更新日時】2014/10/18 8chanの追加
//            2014/06/03 post.jsの機能追加をしやすくするためにちょっと変更
//            2013/12/25 初版
//【スクリプト】
var wp = v2c.resPane.selectedThread.mayOpenWritePanel();
if (!wp) {
	wp = {
		thread: v2c.resPane.selectedThread,
		name: '',
		mail: '',
		message: ''
	};
}
var postobjs = eval(String(v2c.readStringFromFile(new java.io.File(v2c.saveDir + '/script/system/post.js'))));
var u = v2c.context.thread.url.toString();
if (u.indexOf('2chan') >= 0 && u.indexOf('ascii') < 0) {
	var obj = new postobjs.FutabaWriteForm(wp);
	obj.show();
} else if (u.indexOf('bakusai') >= 0) {
	var obj = new postobjs.BakusaiWriteForm(wp);
	obj.show();
} else if (u.indexOf('4chan') >= 0) {
	var obj = new postobjs.B4chanWriteForm(wp);
	obj.show();
} else if (u.indexOf('8chan') >= 0) {
	var obj = new postobjs.B8chanWriteForm(wp);
	obj.show();
} else {
	v2c.context.setStatusBarText('ふたば、爆サイ以外のスレッドなので書き込みパネルを開けませんでした。');
}
