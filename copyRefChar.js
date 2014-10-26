//【登録場所】レス表示
//【ラベル】本文を参照でコピー
//【コマンド】$SCRIPT copyRefChar.js
//【更新日】2013/03/30
//【内容】ユニコードのAAを文字化けさせずにコピーする
(function() {
	try {
		var endl = java.lang.System.getProperty("line.separator");
		var res = v2c.context.res.source.split('<>');
		if (res.length >= 4) { res = String(res[3]); }
		else { throw 'DATが不正。本文が見つからない。' }
		res = res.replace(/(?:^ | $)/g, '').replace(/<(?:\/|hr|a|img)[^>]+>/ig, '').replace(/(&lt;|&gt;|&amp;| ?<br> ?)/gi, function() {
			if (arguments[0] === '&lt;') return '<';
			else if (arguments[0] === '&gt;') return '>';
			else if (arguments[0] === '&amp;') return '&';
			else return endl;
		});
		v2c.context.setClipboardText(res);
		v2c.context.setStatusBarText('本文を参照でコピーしました。');
	} catch(e) {
		v2c.context.setStatusBarText('本文をコピー出来ませんでした。');
		v2c.println('[copyRefChar.js] 本文をコピー出来ませんでした。 (' + e + ')');
	}
})();