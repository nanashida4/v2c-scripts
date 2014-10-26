//【登録場所】レス表示
//【ラベル】ふたばレス参照
//【内容】参照対象のレスをポップアップ表示する
//【コマンド】$SCRIPT popupFutabaRes.js
//【更新日時】2014/07/25 java6で動かない不具合の修正
//            2014/07/15 引用の空白行で全レスポップアップしてしまう不具合の修正
//            2014/07/10 No.が取得出来ない場合にエラーで処理が止まらないように修正
//            2014/03/23 画像ファイル名引用＆本文引用からもポップアップレスを表示できるようにした
//【スクリプト】
/* ◆マウスジェスチャーの登録方法
   外部コマンドのレス表示にコマンド登録する際、ID欄に任意の半角英数字を指定しておいて、
   マウス→マウスジェスチャの最下段に [ID名] ふたばレス参照 の欄が追加されるので任意のジェスチャを登録する
*/
(function() {
if (v2c.context.thread.url.toString().indexOf('2chan') < 0) { return; }
var mes = v2c.context.res.message;
var nolist = [];

function getNoToRes(num) {
	for (var i = 0; i < v2c.context.thread.localResCount; i++) {
		var res = v2c.context.thread.getRes(i);
		if (res && res.aux && res.aux.indexOf(num) >= 0) {
			return res;
		}
	}
}

// >No.00000000 形式の参照レス判定
while (/No.(\d+)[^\d]/g.exec(mes)) {
	var res = null;
	if (res = getNoToRes(RegExp.$1)) {
		nolist.push(res);
	}
}
while (/No.(\d+)-(?:No.)?(\d+)/g.exec(mes)) {
	var r1, r2;
	r1 = ParseInt(RegExp.$1);
	r2 = ParseInt(RegExp.$2);
	if (r1 < r2) {
		for (var i = r1; i <= r2; i++) {
			var res = null;
			if (res = getNoToRes(i)) {
				nolist.push(res);
			}
		}
	}
}

// >00000000.jpg または 本文部分引用 の参照レス判定
{
	var reflines = [];
	while (/^>((?!No\.(?:\d+)).*?) ?$/mg.exec(mes)) {
		if (RegExp.$1.length > 0)
			reflines.push(RegExp.$1);
	}
	for (var i = 0; i < v2c.context.thread.localResCount; i++) {
		var res = v2c.context.thread.getRes(i);
		for (var j = 0; j < reflines.length; j++) {
			var tmp = res
			if (res.message.indexOf(reflines[j]) >= 0 && res.message.indexOf('>' + reflines[j]) == -1) {
				nolist.push(res);
				break;
			}
		}
	}
}

function unique(array) {
	var storage = {};
	var uniqueArray = [];
	for (var i = 0; i < array.length; i++) {
		var value = array[i];
		if (!(value in storage)) {
			storage[value] = true;
			uniqueArray.push(value);
		}
	}
	return uniqueArray;
};

v2c.context.setPopupRes(unique(nolist));

})();