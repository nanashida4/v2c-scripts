//【登録場所】 選択テキスト
//【ラベル】スクリプト簡易インストール
//【内容】テキストの選択範囲をUTF-8で保存するだけのスクリプト用超簡易インストーラです。
//【コマンド１】 ${SCRIPT:F} script_install.js
function install(filename){
  var f = new java.io.File(v2c.saveDir, "script\\" + filename)
  v2c.writeStringToFile(f,v2c.context.selText,"UTF-8")
}

var title = v2c.prompt("タイトル","")
if(title != null && !title.equals("")){
  install(title)
}
