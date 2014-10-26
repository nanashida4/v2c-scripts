//【登録場所】 選択テキスト
//【ラベル】 (任意)
//【内容】 クリップボードへコピーした後，外部コマンドを実行
//【コマンド】 ${SCRIPT:Fx} runExtCmdAfterCopy.js 外部コマンド
//【コマンド例】 ${SCRIPT:Fx} runExtCmdAfterCopy.js "C:\\Program Files\\Kifu for Windows V7\\KifuW.exe" /C　//KifuW.exeに棋譜を送る
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
vcx.setClipboardText(vcx.selText);
v2c.exec(vcx.argLine);