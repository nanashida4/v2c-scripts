//【登録場所】 全体、レス表示
//【ラベル】レスラベル抽出
//【内容】特定のラベル付きレス、加えてその返信レスを抽出、レス表示欄で表示またはポップアップする。
//【コマンド1】 $SCRIPT filterResLabels.js //全てのラベル付きレス
//【コマンド2】 $SCRIPT filterResLabels.js l //コマンド1と同じ
//【コマンド3】 $SCRIPT filterResLabels.js r //全てのラベル付きレスの返信のみ抽出
//【コマンド4】 $SCRIPT filterResLabels.js 書き込み //自分の書き込みを抽出（ラベル名が「書き込み」の場合）
//【コマンド5】 $SCRIPT filterResLabels.js 書き込み l r //自分の書き込みとその返信を抽出
//【コマンド6】 $SCRIPT filterResLabels.js 書き込み デフォルト//「書き込み」ラベルか「デフォルト」ラベルのどちらかが付いたレスを抽出
//【スクリプト】
// ----- 次の行から -----
//設定
var popupFilterdRes = false; //抽出レスをレス表示欄に表示しないでポップアップする。
//
var vcx = v2c.context,
	th = vcx.thread,
	as = vcx.args,
	l = as.length,
	addIdxLabel = false,
	addIdxRef = false,
	ln = [],
	li = [];

function getResLabels(th) {
	var max = th.localResCount,
		rri = [],
		res,
		rl,
		addIdx = function(i) {
				if (addIdxLabel) li.push(i);
				rri = res.refResIndex;
				if (rri && addIdxRef) {
					for (var j=0; j<rri.length; j++) {
						li.push(rri[j]);
					}
				}
			};
	for (var i = 0; i < max; i++) {
		res = th.getRes(i);
		rl = res.resLabel;
		if (ln.length) {
			for (var j = 0; j < ln.length; j++) {
				if (res && rl && rl.name == ln[j]+'') {
					addIdx(i);
				}
			}
		} else {
			if (res && rl) {
				addIdx(i);
			}
		}
	}
}

(function(){
	if (!th) return;
	if (l) {
		for (var i = 0; i < l; i++) {
			if(as[i] == 'r') {
				addIdxRef = true;
				continue;
			}
			if(as[i] == 'l') {
				addIdxLabel = true;
				continue
			}
			ln.push(as[i]);
		}
	}
	if (!l || (!addIdxRef && !addIdxLabel)) {
		addIdxLabel = true;
	}
	getResLabels(th);
	if (li.length) {
		popupFilterdRes ? vcx.setPopupResIndex(li) : vcx.setFilteredResIndex(li);
	} else {
		vcx.setStatusBarText('指定ラベルが見つかりませんでした。');
	}
}());
// ----- 前の行まで -----