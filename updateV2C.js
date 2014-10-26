//【登録場所】リンク
//【ラベル】人柱版V2Cの更新補助
//【コマンド】${SCRIPT:SFwxRx} updateV2C.js
//
//【登録場所】URLExec.dat
//【ラベル】人柱版V2Cの更新補助
//【内容】人柱版V2Cのjarファイルをダウンロード後、v2cjar.txtを自動更新
//【コマンド】ttp://v2c\.s50\.xrea\.com/(V2C_.+\.jar)	$&	${V2CSCRIPT:SFwxRx} updateV2C.js
//
//【注意】 アップデート後の不具合なども想定して、自力でV2Cのバージョンを元に戻せる人が使用してください。

var v2curl = String(v2c.context.link);
var fs = java.io.File.separator;
if (v2curl.match(/http:\/\/v2c\.s50\.xrea\.com\/(V2C_.+\.jar)$/i)) {
	if (v2c.confirm("V2Cを更新しますか？\nNew V2C:"+RegExp.$1)){
		var newjarfn = RegExp.$1;
		v2c.setStatus("Downloading... "+v2curl);
		var hr = v2c.createHttpRequest(v2curl);
		var newjar = hr.getContentsAsBytes();
		if (hr.responseMessage!="OK") {
			v2c.alert("エラー : "+hr.responseMessage);
		} else {
			v2c.writeBytesToFile(new  java.io.File(v2c.appDir+fs+"launcher"+fs+newjarfn),newjar);
			v2c.writeStringToFile(new java.io.File(v2c.appDir+fs+"launcher"+fs+"v2cjar.txt"),newjarfn+"\n");
			v2c.setStatus("Updated "+newjarfn);
			if(v2c.confirm("更新が完了しました。再起動しますか？")){
				v2c.restart();
			}
		}
	}
} else {
	v2c.alert("V2CのURLではありません : "+v2curl);
}