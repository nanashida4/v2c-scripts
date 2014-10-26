//【登録場所】 選択テキスト
//【ラベル】 選択テキストからお気に入りに追加
//【内容】 選択テキストに含まれる2chスレURLのスレをお気に入りに追加する
//【コマンド】 ${SCRIPT:Vf} AddFavFromSelText.js
var fvs = v2c.favorites;
var fav = fvs.getFavorite(0);
var f = fav.root;
var selText = new String(v2c.context.selText);
var st = java.util.StringTokenizer(selText,'\n');
while(st.hasMoreTokens()){
  var temp = urlText;
  var urlText = st.nextToken().replaceAll("^[\\s　]*", "").replaceAll("[\\s　]*$", "");
  if(urlText.startsWith("ttp://")){
    urlText = "h" + urlText;
  }
  var th = v2c.getThread(urlText,temp);
  fav.appendItem(f,th);
}
