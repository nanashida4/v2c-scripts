//【登録場所】 全体、レス表示
//【ラベル】 ツールバー、アイテム+α用アイコン編集
//【コマンド】 ${SCRIPT:Fx} assistIconEdit.js toolbar png
//引数1はtoolbar、itemが有効。
//引数2はjpeg、png、gif、bmpが有効。
//【内容】
//(toolbar|item)アイコンフォルダを開いて画像ファイルに拡張子(jpeg|png|gif|bmp)を付加 ⇒
//再起動ボタン表示 ⇒ 
//再起動ボタンクリック⇒ 
//アイコンを適応(拡張子を再び外す)してV2Cを再起動
//
//実行にはscriptフォルダ内にV2Creboot.vbsが必要。
//http://www39.atwiki.jp/v2cwiki/pages/55.html
//を参照。
//
//起動するファイラにWindowsのエクスプローラを指定しているため
//他のOSで使用するにはファイラの指定を変更する必要があります。
//【更新日】 2010/11/14
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/264-265,595
//【スクリプト】
//----- 次の行から -----
var vcx = v2c.context;
function formSubmitted(u,sm,sd) {
	startCommand(true);
}

function startCommand(reboot){
	var opts = vcx.args;
	var sd = v2c.saveDir;
	if((opts[0]+'').search(/(toolbar|item)/) == -1) return;
	if((opts[1]+'').search(/(jpeg|png|gif|bmp)/) == -1) return;
	if(reboot){
		v2c.exec('cmd /c ren "'+sd+'\\icon\\'+opts[0]+'\\*.'+opts[1]+'" "*."');
		v2c.exec('wscript "'+sd+'\\script\\V2Creboot.vbs" "'+v2c.appDir+'\\V2C.exe"');
	} else {
		//ファイラのパスを入れる
		//v2c.exec('"使用しているファイラの絶対パス" '+sd+'\\icon\\'+opts[0]);
		v2c.exec('"C:\\WINDOWS\\explorer" '+sd+'\\icon\\'+opts[0]);
		v2c.exec('cmd /c ren "'+sd+'\\icon\\'+opts[0]+'\\*." "*.'+opts[1]);
	}
}
startCommand(false);
vcx.setPopupHTML('<html><body style="margin:2px 2px 2px 18px;"><form action=""><input type="submit" value="再起動" name="reboot"></form></body></html>');
vcx.setTrapFormSubmission(true);
vcx.closeOriginalPopup();
//----- 前の行まで -----