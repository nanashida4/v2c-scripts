//【登録場所】 "V2C\script\system\proxy.js"
//【内容】 URLによってProxyを変更
//【備考】・Proxy.txt内のProxyを選択してレスを書き込む時はcheckProxy(u,p)は実行されません。
//　　　　・proxy.jsを変更した時は「ファイル」メニューの「再読み込み」→「proxy.js」で再読み込みすることができます。 
//【スクリプト】
// ----- 次の行から -----
//V2Cがネットワーク接続する前に実行
function checkProxy(u,p) {
    /* [設定項目] 以下の使用する機能のみ文頭の「//」を削除して下さい */
//  useProxyBoardOfSoftware(u,p);  //ソフトウェア板でProxyを使用
//  useProxyBoardOfPoverty(u,p);   //ScriptAssasinを使用する為、ニュー速(嫌儲)の読込みでだけProxyを使用
}

// ■ソフトウェア板で以下の設定項目のProxyを使用
function useProxyBoardOfSoftware(u,p) {
  if (RegExp('^http://[0-9A-Za-z-]+\\.2ch\\.net/software/subject.txt$').test(u)) {
    p.host = 'localhost';       // [設定項目] 使用するときはホスト名を便宜変更して下さい
    p.port = 2020;              // [設定項目] 使用するときはポート番号を便宜変更して下さい
  }
}

// ■ScriptAssasinを使用する為、ニュー速(嫌儲)の読込みでだけProxyを使用
// ※V2Cの「設定」→「ネットワーク」で読込みProxy欄にのみlocalhost:2020を設定した状態で動作します
//   したがって読込みProxyと同じプロキシを書込みProxyにも書いた場合は正常に動作しません（別のプロキシ、或いはポート番号だけ変えれば大丈夫)
//   読込みProxy欄のプロキシがlocalhost:2020でない場合は以下の設定項目を同じホスト名、ポート番号になるように変更して下さい
function useProxyBoardOfPoverty(u,p) {
  var host = 'localhost';       // [設定項目] 使用するときはホスト名を便宜変更して下さい
  var port = 2020;              // [設定項目] 使用するときはポート番号を便宜変更して下さい
  if (p.host && p.port &&
     (p.host.indexOf(host) != -1) &&
     (p.port.toString().indexOf(port.toString()) != -1) &&
     (!/^http:\/\/[^\.]+\.2ch\.net\.*?\/poverty\//.test(u))) {
       p.direct();
       return;
  }
}