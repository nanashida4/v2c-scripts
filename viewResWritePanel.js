//【登録場所】 全体
//【ラベル】 書き込み欄でレスの確認、アンカー付加
//【内容】 書き込み欄で番号を入力→（番号の後にカーソルがある状態で）スクリプト実行
//→番号のレスを抽出、書き込み欄の番号が選択状態→再度スクリプト実行→アンカーに変換
//【コマンド】 $SCRIPT viewResWritePanel.js
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context,
	th = vcx.thread,
	lrc = th.localResCount,
	wp = th.openWritePanel(),
	wm = wp.message,
	pt1 = new RegExp('\\d+$');
	pt2 = new RegExp('^\\d+$');
	pos = wm.caretPos,
	slt = wm.selText,
	txt = wm.text.substring(0, pos)+'',
	num = txt.match(pt1)-1,
	anc = slt ? slt.search(pt2) : -1;
if(anc < 0 && num >= 0 && num <= lrc){
//	vcx.setResIndexToJump(num);//ジャンプ
	vcx.setFilteredResIndex([num]);//抽出
//	vcx.setPopupResIndex([num]);//抽出ポップアップ
	wm.select(pos-((num + 1) +'').length,pos);
} else if(anc >= 0){
	v2c.replaceSelectedText('>>'+slt+'\n'); //選択範囲にアンカー
	/* --- 表示を元に戻す(ここから) --- */
//	var as = [];
//	for(var i = 0; i<=lrc; i++) {
//		as.push(i);
//	}
//	vcx.setFilteredResIndex(as);
	/* --- 表示を元に戻す(ここまで) --- */
}
// ----- 前の行まで -----