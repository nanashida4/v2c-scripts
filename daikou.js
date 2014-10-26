//【登録場所】レス表示
//【ラベル】レス代行テンプレ取得
//【内容】書き込みたいスレで実行すると、レス代行テンプレをクリップボードにコピーする
//　*レス代行テンプレを書き込み欄へ直接送るには
//　　//vcx.insertToPostMessage(message);
//　　の文頭の「//」を削除する。
//【コマンド】${SCRIPT:Fr} daikou.js
//【更新日】 2010/11/28
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/630
//【スクリプト】
var vcx = v2c.context;
var th = vcx.thread;

if(th) {
	var bd = th.board;
	var bdName = getBoardName(bd.url);
	if (!bdName) {
		bdName = bd.key;
		v2c.alert("板名の取得に失敗しました。");
	}
	var message = "【*板名】 " + bdName + "\n" 
		+ "【*スレ名】 " + th.title + "\n"
		+ "【*スレのURL】 " + th.url + "\n"
		+ "【名前欄】\n【メール欄】 sage\n【*本文】\n";
	//vcx.insertToPostMessage(message);
	vcx.setClipboardText(message);
}

function getBoardName(url) {
	var boards = v2c.readFile( v2c.saveDir + '\\BBS\\2ch\\bbstree.txt' );
	if(!boards) {
		return null;
	}
	
	if (boards.match("\\d," + url + ",(.+)[\\s]")) {
		return RegExp.$1;
	}
	else {
		return null;
	}
}