//【登録場所】レス表示、全体
//【ラベル】Softalkを有効にする
//【更新日】2014/04/04 初版
//【コマンド】${SCRIPT:F} softalkconfig.js $ON
//            ${SCRIPT:F} softalkconfig.js $OFF
//            ${SCRIPT:F} softalkconfig.js $SKIP
// コマンドの書式
//    ${SCRIPT:F} softalkconfig.js
//    ■引数 $ON … softalkを有効にする
//    ■引数 $OFF … softalkを無効にする
//    ■引数 $SKIP … 読み上げを更新１スレ分読み飛ばす
//【内容】 threadld.js softalkの機能をオンオフする
//【スクリプト】
var config = v2c.getScriptDataFile('softalk.settings');
var softalkEnable = 0;
if (v2c.context.args.length > 0) {
	var argLine = v2c.context.argLine;
	if (/\$ON/i.test(argLine)) {
		softalkEnable = 1;
		v2c.writeStringToFile(config, 'Enable = ' + softalkEnable);
		v2c.context.setStatusBarText('[softalkconfig.js] Softalkを有効にしました。');
	}
	if (/\$OFF/i.test(argLine)) {
		softalkEnable = 0;
		v2c.writeStringToFile(config, 'Enable = ' + softalkEnable);
		v2c.context.setStatusBarText('[softalkconfig.js] Softalkを無効にしました。');
	}
	if (/\$SKIP/i.test(argLine)) {
		v2c.putProperty('Softalk_Skip', 1);
	}
}
