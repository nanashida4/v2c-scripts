//【登録場所】全体、レス表示
//【ラベル】スレッドを別名で保存
//【コマンド】${SCRIPT:F} saveDatAs.js
//【内容】 レス表示で表示されているスレッドをダイアログで保存
var th = v2c.context.thread;
var initName = null;

/* [設定] -----------------------------------------------------*/
// 保存名を自動的に作成する。好きな書式の行を一つだけ先頭の「//」を外す。初期名を付けたくない場合は一つも「//」を外さない
// initName = th.title + '.dat';                                // スレッド名.dat
initName = '【' + th.board.name + '】' + th.title + '.dat';   // 【板名】スレッド名.dat
// initName = '【' + th.board.name + '】' + th.title + ' (' + th.key + ').dat';  // 【板名】スレッド名 (スレキー).dat
// initName = '[' + th.key + '] ' + th.title + '.dat';           // [スレキー] スレッド名.dat ※スレキー＝スレ立て日時順
// initName = '【' + th.board.name + '】[' + th.key + '] ' + th.title + '.dat';  // 【板名】[スレキー] スレッド名.dat
/* ------------------------------------------------------------ */

var settingFile = v2c.getScriptDataFile('saveDatAs.settings');
var initDir = v2c.readStringFromFile(settingFile);

with(JavaImporter(java.awt, java.awt.event))
{
	var fd = new FileDialog(new Frame(), "名前を付けて保存", FileDialog.SAVE);
	try {
		if (initDir != null) {
			fd.setDirectory(new java.io.File(initDir));
			if (initName) {
				fd.setFile(new java.io.File(initName));
			}
		}
		fd.setVisible(true);
		if (fd.getFile() != null) {
			var path = fd.getDirectory() + fd.getFile();
			v2c.writeStringToFile(settingFile, fd.getDirectory());
			if (!/.*\.dat$/i.test(path)) {
				path += ".dat";
			}
			var log = v2c.readStringFromFile(th.localFile);
			if (log) {
				v2c.writeStringToFile(new java.io.File(path), log);
				v2c.context.setStatusBarText("[saveDatAs.js] スレッドを別名で保存しました。");
			}
			
		}
	} finally {
		fd.dispose();
	}
}