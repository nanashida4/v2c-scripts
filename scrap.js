//【登録場所】 選択テキスト
//【ラベル】ast形式で保存
//【内容】選択範囲をast形式(AAエディタとかで読める形式)で保存する的なものを作ってみました。
//　　　　複数のレスが1つのファイルに格納されます。
//【コマンド】${SCRIPT:F} scrap.js
//--- ここから ---
importPackage(java.io)

function scrap(filename, save_res_info){
  var file = new File(v2c.saveDir,filename)
  var p = new PrintWriter(new FileWriter(file, true));
  p.print("[AA]");

  if(save_res_info || save_res_info == undefined){
    var res = v2c.context.res;
    var res_str = res.number + ": "
              + res.name
              + " [" + res.mail + "] "
              + res.date
              + " ID:" + res.id
              + " " + res.beID
              + " " + res.aux;
    var title = v2c.context.thread.title;
    var board = v2c.context.thread.board.key
    p.print("[" + board + " / " + title  + " / " + res_str + "]");
  }

  p.println();
  p.println(v2c.context.selText);
  p.close();
  v2c.alert("正常に保存されました。");
}

//保存場所
scrap("script\\hoge.ast")

//--- ここまで ---
