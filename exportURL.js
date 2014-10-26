//【登録場所】全体、レス表示
//【ラベル】全レスからURLを抽出しTXT作成
//【コマンド】${SCRIPT:Fw} exportURL.js
//【内容】 スレ中の外部URLを抽出してテキストに保存する
var th = v2c.context.thread;
var lines = []
var urlReg = new RegExp("h?t?t?ps?://[\\w/:%#\\$&\\?\\(\\)~\\.=\\+\\-]+", "ig");
var res;
var i = 0;
while (res = th.getRes(i++)) {
	var m = [];
	while (m = urlReg.exec(res.message)) {
		lines.push(m[0]);
	}
}
with(JavaImporter(java.awt, java.awt.event))
{
	var fd = new FileDialog(new Frame(), "名前を付けて保存", FileDialog.SAVE);
	try {
		fd.setVisible(true);
		if (fd.getFile() != null) {
			var path = fd.getDirectory() + fd.getFile();
			if (!/.*\.txt$/i.test(path)) {
				path += ".txt";
			}
			v2c.writeLinesToFile(new java.io.File(path), lines);
			v2c.context.setStatusBarText("[exportURL.js] スレ中のURLをテキストファイルに保存しました。");
		}
	} finally {
		fd.dispose();
	}
}