// 【登録場所】 全体、レス表示
// 【ラベル】 嫌儲スクリプトIDNG
// 【コマンド】 $SCRIPT kenmoNG.js
// 【内容】 ttp://sass.m35.coreserver.jp/NGID_today.txt からIDを取得し、嫌儲板のNGIDに登録する。更新間隔は15分。再度実行すると更新停止。

var t = true; //透明非表示にしない場合はfalseに
var w = 0 ;   //ウェイト（-9≦w≦9)

var r=new java.lang.Runnable() {
  run: function() {
    var idList = v2c.readURL('h' + 'ttp://sass.m35.coreserver.jp/NGID_today.txt');
    if (!idList) {
      v2c.alert("嫌儲NGリストを取得できませんでした。");
    }
    else {
      var IDa = idList.split('\r\n');
      for (var i = 0; i < IDa.length; i++) {
        bd.addNGID(IDa[i], 0, t, w);
      }
      v2c.println('嫌儲NGリスト更新');
      v2c.resPane.checkNG(bd);
    }
    var tm=v2c.getScriptObject();
    if (tm) {
      tm.start();
    }
  }
}

var al=new java.awt.event.ActionListener() {
  actionPerformed: function(e) {
    new java.lang.Thread(r).start();
  }
};

var bd = v2c.bbs2ch.getBoard('poverty');
if (bd) {
  var tm = v2c.getScriptObject();
  if (tm) {
    v2c.setScriptObject(null);
    v2c.alert("自動チェック停止");
    tm.stop();
  }
  else {
    tm = new javax.swing.Timer(900000, al);
    tm.setRepeats(false);
    v2c.setScriptObject(tm);
    v2c.alert('自動チェック開始');
    r.run();
  }
}
