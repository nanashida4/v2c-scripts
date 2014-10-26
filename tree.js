//【登録場所】 全体、レス表示
//【ラベル】 　被参照レスでツリー表示
//【コマンド1】 $SCRIPT tree.js　（開始レスからのツリー(アウトライン)表示、non-outlineがない場合デフォルトはこのタイプの表示）
//【コマンド2】 $SCRIPT tree.js non-outline　（開始レスからのツリー(非アウトライン)表示、以降のコマンドに追加で非アウトライン化）
//【コマンド3】 $SCRIPT tree.js name　（名前で抽出）
//【コマンド4】 $SCRIPT tree.js trip　（トリップで抽出）
//【コマンド5】 $SCRIPT tree.js id　（IDまたはHOSTで抽出）
//【コマンド6】 $SCRIPT tree.js be　（beIdで抽出）
//【コマンド7】 $SCRIPT tree.js aux　（補助情報で抽出）
//【コマンド8】 $SCRIPT tree.js mail　（メールで抽出）
//        $SCRIPT tree.js mail -age - -sage （メールで抽出、age, 空, sageを抽出対象から除く、対象はこの3ついずれかのみ）
//【コマンド9】 $SCRIPT tree.js link　（リンクを抽出）
//        $SCRIPT tree.js link image　（リンクを抽出、引数がimageのみの場合ImageViewURLReplace.datも考慮した画像リンクのみ抽出）
//        $SCRIPT tree.js link zip lzh　（リンクを抽出、zip lzhファイルリンクのみ抽出、link後の引数は拡張子やドメインが対象）
//        $SCRIPT tree.js link -zip -lzh　（リンクを抽出、zip lzhファイルリンクを除外して抽出）
//        $SCRIPT tree.js link -zip -lzh jp com　（『-』と『-』無しがあると無しのリンクが優先、その中で『-』有りが各当するレス番は対象から除外）
//【コマンド10】$SCRIPT tree.js line　（本文の行数が3以上のレスを抽出、行数＝改行の数、連続改行はまとめて1行）
//        $SCRIPT tree.js line 5 more　（本文の行数が5以上のレスを抽出）
//        $SCRIPT tree.js line 2 less　（本文の行数が2以下のレスを抽出）
//        $SCRIPT tree.js line input less　（数字の変わりにinputがあると、本文がダイアログからの入力行数以上のレスを抽出）
//【コマンド11】$SCRIPT tree.js ref　（3以上の被参照レスを抽出）
//        $SCRIPT tree.js ref 5　（ref後に(1以上の)数字があるとそれ以上の被参照レスを抽出、この場合は5以上）
//        $SCRIPT tree.js ref input　（数字の変わりにinputがあると、ダイアログからの入力値以上の被参照レスを抽出）
//【コマンド12】$SCRIPT tree.js daily　（日で抽出）
//【コマンド13】$SCRIPT tree.js day　（対象を開始日とした7日分のレスを抽出）
//        $SCRIPT tree.js day 30 start　（day後に(1以上の)数字があると対象を開始日とした期間分のレスを抽出、この場合は対象から30日間）
//        $SCRIPT tree.js day 30 end　（数字後にendがあると対象を終了日とした期間分のレスを抽出、この場合は対象までの30日間）
//        $SCRIPT tree.js day input end　（数字の変わりにinputがあると、ダイアログ入力した期間分のレスを抽出）
//【コマンド14】$SCRIPT tree.js min　（対象を開始時とした60分間のレスをツリー抽出）
//        $SCRIPT tree.js min 30 start　（min後に(1以上の)数字があると対象を開始時とした時間分のレスを抽出、この場合は対象から30分間）
//        $SCRIPT tree.js min 30 end　（数字後にendがあると対象を終了時とした時間分のレスを抽出、この場合は対象までの30分間）
//        $SCRIPT tree.js min input end　（数字の変わりにinputがあると、ダイアログ入力した時間分のレスを抽出）
//【コマンド15】$SCRIPT tree.js all　（全レスをツリー表示）
//【コマンド16】$SCRIPT tree.js new　（新着レスをツリー表示）
//【コマンド17】$SCRIPT tree.js old　（既読レスをツリー表示）
//【コマンド18】$SCRIPT tree.js ng　（NGレスを表示、ツリー対象は連鎖[参照]も含む）
//        $SCRIPT tree.js ng reason　（NGレスを表示、本文ではなく非表示理由を表示）
//【コマンド19】$SCRIPT tree.js filter　（抽出、チェックされていれば、その対象レスを表示、チェック優先）
//        $SCRIPT tree.js filter day 30 end　（上記の引数にfilterを置くと、allを除いてツリー表示後、元スレ表示欄で抽出して表示）
//【コマンド20】$SCRIPT tree.js id respane　（上記の引数にrespaneを置くと、ポップアップではなくレス表示欄に表示）

// * $SCRIPT tree.js ref 1など表示に時間がかかる(その間操作不可の)場合がある点は注意。自分の場合例でレス700に被参照レス合計1200で表示に１分
// * 抽出対象のレス番号は太字、【コマンド12～17】では重複しているレス番号は除外
// * 重複レス番号の最初の番号色は赤(初期設定色)、それ以降は被参照レスがあれば語尾に「…」(ただし【コマンド2】は先頭のツリーマークを「▲」)
// * 【コマンド3～8, 18】の抽出対象のコメント色は緑(初期設定色)
// * レス番号マウスオーバーでのポップアップが早くてクリック出来ない場合は
//　 設定→レス表示→レスポップアップ→遅延時間　を変更してみてください。
//　 なお変更後、「再起動」しないと適用されません。また「Shift＋」によるポップアップ抑制はききません。
//　 ポップアップからの非アウトライン表示の場合、ポップアップ下部に「戻る」ボタンを押すと、切り替え前のアウトライン表示に戻ります。

/* 各種設定 */
var LeftMargin = 15; //非アウトラインの場合の左スペース、n階層深くなると LeftMargin×n[ピクセル] スペースが空きます。
var NumCharOutline = 40; //アウトライン本文を NumCharOutline文字以下にする。
var SameLengthOutline = true; //アウトラインの文字数をおおよそ揃える。
var RootResMsg = false; //【コマンド1】でルートレスの本文を表示する。
var ReTreePopup = true; //アウトライン表示の場合、番号クリックでその番号からの非アウトラインのポップアップを表示する。
var ReResTreePane = false; //【コマンド20】のアウトライン表示の場合、番号クリックでその番号からの非アウトラインをレス表示欄で表示する。
var NewResPane = true; //【コマンド20】の場合、新しいタブでレス表示欄に表示する。;
var StressRes = true; //【コマンド3～8, 18】で抽出レスを強調(太字 or 色)する。

//ポップアップCSS（アウトライン表示）
var css1 = "<style type = 'text/css'><!--"
+"body{margin:5px 0 5px 5px; font-size: small;}" //ポップアップ全体
+".title{padding:0px 5px; font-weight:bold; font-size: medium;}" //抽出時の１行目(書き込み数・被参照レスなどの)
+".branch{font-weight:bold;}" //アウトライン表示でのツリーの枝(罫線)
+".num{}" //通常レス番号
+".overlap{color:red;}" //重複レス番号の最初のレス番号
+".msg{}" //レス本文
+".keymsg{color:rgb(0, 96, 0);}" //【コマンド3～8, 18】の抽出対象のコメント色
+"--></style>";
//ポップアップCSS（非アウトライン表示）
var css2 = "<style type = 'text/css'><!--"
+"body{margin:5px 0 5px 5px; font-size: small;}" //ポップアップ全体
+".title{padding:0px 5px; font-weight:bold; font-size: medium;}" //抽出時の１行目(書き込み数・被参照レスなどの)
+".inf{padding:0px 5px; background-color:#f0f0f0}" //ツリーマーク(▲or▼)からIDまでの行
+".treemark{color:green;font-size: large;}" //【コマンド2】で先頭のツリーマーク(▲or▼)
+".num{font-size: large;}" //通常レス番号
+".overlap{font-size: large;color:red;}" //重複レス番号の最初のレス番号
+".name{color:blue; font-weight:bold;}" //名有り
+".anname{color:green; font-weight:bold;}" //名無し(登録した名無しも含む)
+".age{color:red;}" //メール欄がage
+".sage{color:green;}" //メール欄がsage
+".mail{}" //メール欄がageとsage以外
+".time{color:#d35871;}" //日時
+".id{color:blue;}" //通常ID
+".popid{color:red; font-weight:bold;}" //複数レスID
+".msg{padding:0 0 0 15px;background-color:#f7f7f7}" //レス本文
+"--></style>";
/* 各種設定ここまで */

var vcx = v2c.context, vtx = vcx.thread, vrx = vcx.res, args = vcx.args.concat(),rb;
if(vtx && vrx){
  var ThreadUrl = vtx.url;
  if(ThreadUrl){
    var PopupHtml = new Array(2);//ポップアップHTML配列(0:初期HTML、1:リダイレクト後のHTML)
    initTreeData();
    createPopupString(0);
  }
}

//ツリーデータ初期化
function initTreeData(){
  Blk = 0, SearchKey = 0, SubKey = 0;
  PopupText = "", Message = "", KeyWord = "", Pattern1 = "", Pattern2 = "";
  AllLines = [], OneLines = [], InnerNums = [], Overlapping1stNums = [];
  RootIdxes = [], RootRefCounts = [], Chains = [], NameResIdxes = [], IDResIdxes = [];
  ActionResult = [true,false,false];//順にアウトライン表示, レス表示欄で表示, 抽出
}

//FORM受信処理
function formSubmitted(u,sm,sd) {
  if(sd.indexOf("return")==0) {
    args[0] = ""
    vcx.setPopupHTML(PopupHtml[0]);
    vcx.closeOriginalPopup()
    vcx.setRedirectURL(true);
  }
}

//HTTPリダイレクト
function redirectURL(u) {
  if (ReTreePopup && ActionResult[0]) {
    var n = (u+"").match(/\d+$/);
    vrx = vtx.getRes(n-1);
    args = ReResTreePane && ActionResult[1] ? ["non-outline","respane"] : ["non-outline"];
    initTreeData();
    createPopupString(1);
    ActionResult[0] = true;
    return null;
  } else {
    return v2c.openURL(u,false,true,false); // V2Cで開く（更新なし、更新する場合はopenURL(u,true)）
  }
}

//抽出レスを判定する。
function isSearchString(resobj){
  var ans = 0;
  switch(KeyWord){
  case "name":
    ans = SearchKey.equals(resobj.name);
    break;
  case "trip":
    ans = resobj.name.indexOf(SearchKey) > -1;
    break;
  case "id":
    ans = SearchKey.equals(resobj.id);
    break;
  case "be":
    ans = SearchKey != 0 && SearchKey == resobj.beID;
    break;
  case "aux":
    ans = SearchKey.equals(resobj.aux);
    break;
  case "mail":
    ans = SearchKey.equals(resobj.mail);
    break;
  case "link":
    ans = 0;
    bl = resobj.links;
    if(SubKey == 1) { //すべてのリンク
      ans = bl.length > 0;
    } else {
      if(bl.length > 0) {
        for(var i = 0, il = bl.length; i<il; i++){
          if(SubKey == 2){ //ImageViewURLReplace.datも考慮した画像リンク
            if(bl[i].type_IMAGE){
              ans = 1;
              break;
            }
          } else if(SubKey == 3){ //除外リンク
            if((bl[i]+"").match(Pattern1)) break;
          } else {
            if(SubKey == 4){ //対象リンク
              if((bl[i]+"").match(Pattern2)){
                ans = 1;
                break;
              }
            } else {　//対象リンクおよび除外リンク
              if((bl[i]+"").match(Pattern2)){
                ans = 1;
                if((bl[i]+"").match(Pattern1)){
                  ans = 0;
                  break;
                }
              }
            }
          }
        }
        if(SubKey == 3){ //すべてが除外リンクのみ
          ans = i == il;
        }
      }
    }
    break;
  case "line":
    bm = resobj.message.match(Pattern1); //改行のマッチング
    if(SubKey == 1){
      ans = bm.length <= SearchKey;
    } else {
      ans = bm.length >= SearchKey;
    }
    break;
  case "ref":
    ans = (SearchKey <= resobj.refCount);
    break;
  case "daily":
    ans = resobj.date.indexOf(SearchKey) > -1;
    break;
  case "day":
    bt = resobj.time;
    if(SubKey<SearchKey){
      ans = SearchKey > bt && SubKey <= bt; //SubKey ≦ bt ＜ SearchKey
    } else {
      ans = SubKey > bt && SearchKey <= bt; //SearchKey ≦ bt ＜ SubKey
    }
    break;
  case "min":
    bt = resobj.time;
    if(SubKey<SearchKey){
      ans = SearchKey >= bt && SubKey < bt; //SubKey ≦ bt ＜ SearchKey
    } else {
      ans = SubKey > bt && SearchKey <= bt; //SearchKey ≦ bt ＜ SubKey
    }
    break;
  case 'all':
    ans = 1;
    break;
  case "new":
    ans = 1;
    break;
  case "old":
    ans = 1;
    break;
  case "ng":
    ans = resobj.ng;
    break;
  case "filter":
    for(var i = 0, il = RootIdxes.length; i<il; i++){
      if(RootIdxes[i] == resobj.index) break;
    }
    i == il ? eq = 0 : eq = 1;
    break;
  default:
    break;
  }
  return ans;
}

//本文をポップアップ表示用に編集する。
function editMessage(mg, b) {
  mg = mg+"";
  var num = 0, a = "";
  var regx = new RegExp("[\u0020-\u007E\uFF61-\uFF9F]")
  if(ActionResult[0]){
    var ml = mg.length;
    var n = NumCharOutline-b;
    if(ml > n) {
      for(var i = 0; i < ml; i++){
        a = String(mg.charAt(i));
        if(a.search(regx) != -1)num++;
        if(i-num/2 > n) break;
      }
      mg = mg.substring(0, i);
      mg += "...";
    }
    mg = mg.replace(/[\n]+/g, "　");//改行を全角スペースに置換する。
  }
  mg = mg.replace(/</g, "&lt;");//特殊文字『<』を置換する。
  mg = mg.replace(/>/g, "&gt;");//特殊文字『>』を置換する。
  if(!ActionResult[0]) {
    mg = mg.replace(/(\n){3,}/g,"$1").replace(/\n/g,"<br>");
  }
  return mg;
}

//比較して同じ数字があれば1を返す。
function isSearchNum(ar, num) {
  for(var al = ar.length-1, i = al; i >= 0; i--) {
    if(ar[i] == num){
      return true;
    }
  }
  return false;
}

//ツリーデータ(アウトライン)を作成する。
function createTreeOutline(OneLines, idx) {
  var gr, nr = "", req = false, vgr = vtx.getRes(idx);
  KeyWord == "ng" && vgr.ng ? gr = Chains[idx] : gr = vgr.refResIndex;
  Blk++;
  if(gr){
    var rn, vgx, prn, prr, on;
    SameLengthOutline ? on = Blk : on = 0;
    for(var i = 0, grl = gr.length; i<grl; i++) {
      rn = gr[i]+1;
      vgx = vtx.getRes(rn-1);
      (Blk >= 2 && (OneLines[Blk-2] == "<span class = 'branch'>└") || (OneLines[Blk-2] == "<span class = 'branch'>　") || (OneLines[Blk-2] == "└") || (OneLines[Blk-2] == "　")) ? OneLines[Blk-2] = "　" : OneLines[Blk-2] = "│";
      (i == gr.length-1) ? OneLines[Blk-1] = "└" : OneLines[Blk-1] = "├";
      if(Blk-1 == 0 || Blk-2 == 0) OneLines[0] = "<span class = 'branch'>"+OneLines[0];
      StressRes ? req = isSearchString(vgx) : req = false; //レス番号が抽出対象かどうか判定する。
      OneLines[Blk] = createNumSpan(rn,req);
      prn = 0;
      prn = isSearchNum(InnerNums, rn);//レス番号が、ツリー内で既出のレス番号かどうか判定する。
      KeyWord == "ng" && SubKey && vgx.ng ? Message = vgx.ngReason+"" : Message = editMessage(vgx.message, on);
      if(!prn) {
        OneLines[Blk+1] = "　" + createMessageSpan(Message,req);
        InnerNums.push(rn);//被参照が有るレス番号をストックする。
      } else {
        if(vgx.refCount) nr = "…";//被参照が有りかつ既出のレス番号であれば語尾に「…」をつける。
        OneLines[Blk+1] = nr + createMessageSpan(Message,req);
        prr = 0;
        prr = isSearchNum(Overlapping1stNums, rn);
        if(!prr) {
          Overlapping1stNums.push(rn);//被参照が有りかつ既出となるレス番号をストックする。
        }
        nr = "";
      }
      AllLines.push(OneLines.join(""));//ポップアップ１行分をストック
      if(!prn){
        createTreeOutline(OneLines, gr[i]);
      }
    }
  }
  OneLines[Blk,Blk+1] = null;
  Blk--;
  return AllLines;
}
//レス番号のインライン要素を作成
function createNumSpan(num,req) {
  if(req){
    return "</span><b><a class = 'num' href = '"+ThreadUrl+num+"'>"+num+"</a></b>";
  } else {
    return "</span><a class = 'num' href = '"+ThreadUrl+num+"'>"+num+"</a>";
  }
}

//名前のインライン要素を作成
function createNameSpan(name) {
  var nari = NameResIdxes[name];
  if(nari && nari.length > 0) {
    return " 名前：<a class = 'name' href = '"+ThreadUrl+nari.join(",")+"'>"+name+"</a>";
  } else {
    return " 名前：<span class = 'anname'>"+name+"</span>";
  }
}
//メールのインライン要素を作成
function createMailSpan(mail) {
  if(mail.match(/^sage$/)){
    return " [<span class = 'sage'>"+mail+"</span>] ";
  } else if(mail.match(/^(?:age|)$/)) {
    return " [<span class = 'age'>"+mail+"</span>] ";
  } else {
    return " [<span class = 'mail'>"+mail+"</span>] ";
  }
}
//IDのインライン要素を作成
function createIDSpan(id){
  var iri = IDResIdxes[id];
  if(iri && iri.length > 1) {
    return " ID:<a class = 'popid' href = '"+ThreadUrl+iri.join(",")+"'>"+id+"</a>";
  } else if((iri && iri.length == 1) || id.match(/\?{3}/)) {
    return " ID:<span class = 'id'>"+id+"</span>";
  } else if(id.match(/^(?:O|P|Q|i|I|o|0)$/)){
    return " <span class = 'id'>"+id+"</span> ";
  }
  return "";
}

//レス本文のインライン要素を作成
function createMessageSpan(msg,req) {
  if(req){
    return "　　　<span class = 'keymsg'>"+msg+"</span>";
  } else {
    return "　　　<span class = 'msg'>"+msg+"</span>";
  }
}
//ツリーデータ(非アウトライン)を作成する。

function createTree(OneLines, idx) {
  var gr, nr = "▼", req = 0, vgr = vtx.getRes(idx);
  gr = vgr.refResIndex;
  Blk++;
  if(gr){
    var rn, vgx, prn, prr, on;
    SameLengthOutline ? on = Blk : on = 0;
    for(var i = 0, grl = gr.length; i<grl; i++) {
      rn = gr[i]+1;
      vgx = vtx.getRes(rn-1);
      prn = 0;
      prn = isSearchNum(InnerNums, rn);//レス番号が、ツリー内で既出のレス番号かどうか判定する。
      if(!prn) {
        InnerNums.push(rn);//被参照が有るレス番号をストックする。
      } else {
        if(vgx.refCount) nr = "▲";//被参照が有りかつ既出のレス番号であればツリーマークを「▲」に変更する。
        prr = 0;
        prr = isSearchNum(Overlapping1stNums, rn);
        if(!prr) {
          Overlapping1stNums.push(rn);//既出となるレス番号をストックする。
        }
      }
      OneLines[0] = "<div class = 'inf' style='margin:0 0 0 "+LeftMargin*Blk+"px;'><span class = treemark>"+nr+"</span>";
      OneLines[1] = createNumSpan(rn);
      nr = "▼";
      OneLines[2] = createNameSpan(vgx.name);
      OneLines[3] = createMailSpan(vgx.mail);
      OneLines[4] = "投稿日：<span class = 'time'>"+vgx.date+"</span>";
      OneLines[5] = createIDSpan(vgx.id+"");
      OneLines[6] = "</div><div class = 'msg' style='margin:0 0 0 "+LeftMargin*Blk+"px;'>"+editMessage(vgx.message, on)+"</div>";
      AllLines.push(OneLines.join(""));//ポップアップ１行分をストック
      if(!prn){
        createTree(OneLines, gr[i]);
      }
    }
  }
  Blk--;
  return AllLines;
}
//同ID、同名前のレスインデックスのリストを作成する。
function createSameResIdxList(il){
  var ida = namea = "", nn, resx;
  for(var i = 0; i < il; i++){
    resx = vtx.getRes(i);
    if(!resx) continue;
    ida = resx.id;
    namea = resx.name+"";
    if(!NameResIdxes[namea]){
      nn = namea.match(/\d+/);
      nn && nn >= 0 && nn < il ? NameResIdxes[namea] = [nn] : NameResIdxes[namea] = [];
    }
    NameResIdxes[namea].push(i+1);
    if(!ida || ida.search(/^([\?]{3}(O|P|Q|i|I|o|0|)|(O|P|Q|i|I|o|0))$/) > -1) continue;
    ida = ida+"";
    if(!IDResIdxes[ida]) IDResIdxes[ida] = [];
    IDResIdxes[ida].push(i+1);
  }
  var ban = vtx.board.allAnonymousName;
  for(var j = 0, bal = ban.length; j < bal; j++) {
    if(NameResIdxes[ban[j]] && NameResIdxes[ban[j]].length > 0) {
      delete NameResIdxes[ban[j]];
    }
  }
}
//引数から実行結果のオプションを検索する。
function searchOption(opts){
  var aopts = new Array();
  for(var i = 0, ol = opts.length; i < ol; i++){
    switch(opts[i]+""){
      case "non-outline": ActionResult[0] = false;break;
      case "respane": ActionResult[1] = true;break;
      case "filter": ActionResult[2] = true;break;
      default : aopts.push(opts[i]);
    }
  }
  return aopts;
}
//ポップアップデータを作成する。
function createPopupString(ha) {
  var ss = "", css = "", srs = 0, srr = 0, f = 0, rs = 0, lrs = vtx.localResCount, sidx = 0, len = lrs, NumText = "";
  var Popup1Res = false; //抽出レスが１レスでもツリー表示する。
  var OverlappingRes = false; //抽出レスが、各ツリーで既出のレスの場合重複レスと判定する。
  args = searchOption(args);
  KeyWord = args[0]+"";
//  if(args[0] == "filter"){
//    f = 1;
//    args[1] == undefined ? KeyWord = "filter" : KeyWord = args[1]+"";
//  } else if(args[0]){
//    KeyWord = args[0]+"";
//  } else{
//    KeyWord = args[0];
//  }
  if((args.length > 0) && ((KeyWord == "name") || (KeyWord == "trip") || (KeyWord == "id") || (KeyWord == "be") || (KeyWord == "aux") ||  (KeyWord == "mail") || (KeyWord == "link") || (((KeyWord == "line") || (KeyWord == "ref") || (KeyWord == "day") || (KeyWord == "min")) && (args[1] > 0) || (args[1] == undefined) || (args[1] == "input")) || (KeyWord == "daily") ||  (KeyWord == "all") || (KeyWord == "new")  || (KeyWord == "old") || (KeyWord == "ng")) || ((args.length == 0) && ActionResult[2])){
    //引数に従って表示方法の初期設定をする。
    if(KeyWord == "name") {
      SearchKey = vrx.name;
      ss = "名前："+SearchKey;
      if(SearchKey > 0 && SearchKey<lrs) {
        var snn = vtx.getRes(SearchKey-1);
        RootIdxes.push(snn.index);
        srr = snn.refCount;
        RootRefCounts.push(srr);
        srs += srr;
      } else {
        var ban = vtx.board.allAnonymousName;
        for(var i = 0, bal = ban.length; i<bal; i++) {
          if(ban[i].equals(vrx.name)) {
            SearchKey = 0;
            break;
          }
        }
      }
      if(StressRes) StressRes = true;
    } else if(KeyWord == "trip") {
      SearchKey = vrx.name;
      SearchKey = SearchKey.match(/◆[\.\/\w]{9}(?:[\.26AEIMQUYcgkosw]|[\.\/\w]{3})/)
      ss = "トリップ："+SearchKey;
      if(StressRes) StressRes = true;
    } else if(KeyWord == "id") {
      SearchKey = vrx.id;
      if(SearchKey.search(/^([\?]{3}(O|P|Q|i|I|o|0|)|(O|P|Q|i|I|o|0))$/) > -1){
        SearchKey = 0;
      } else {
        if(SearchKey.search(/^[\+\/\w]{8}(O|P|Q|i|I|o|0|)$/) > -1){
          ss = "ID："+SearchKey;
        } else {
          ss = "HOST："+SearchKey;
        }
      }
      if(StressRes) StressRes = true;
    } else if(KeyWord == "be") {
      SearchKey = vrx.beID;
      ss = "beID："+SearchKey;
      if(StressRes) StressRes = true;
    } else if(KeyWord == "aux") {
      SearchKey = vrx.aux;
      ss = "AUX："+SearchKey;
      if(StressRes) StressRes = true;
    } else if(KeyWord == "mail") {
      SearchKey = vrx.mail;
      for(var i = 1, ml = [], agl = args.length; i<agl; i++){
        if(args[i].substring(0, 1) == "-" && (/^(age|sage|)$/).exec(args[i].substring(1))){
          ml.push(RegExp.$1);
        }
      }
      if(SearchKey.match(new RegExp('^('+ml.join("|")+')$')) != null){
        SearchKey = 0;
      } else {
        ss = "Mail：["+SearchKey+"]";
      }
      if(StressRes) StressRes = true;
    } else if(KeyWord == "link") {
      SearchKey = 1;
      if(args[1] == undefined){
        ss = "LINK";
        SubKey = 1;
      } else if(args[1] == "image" && args[2] == undefined){
        ss = "画像リンク"
        SubKey = 2;
      } else {
        for(var i = 1, llm = [], llp = [], agl = args.length; i<agl; i++){
          if(args[i].substring(0, 1) == "-"){
            llm.push(args[i].substring(1));
          } else {
            llp.push(args[i]);
          }
        }
        if(llm.length > 0) {
          Pattern1 = new RegExp("\\.("+llm.join("|")+")(\\.|\\?|\\/|$)", "i");
          SubKey = 3;
          //ss = "LINK："+llm+" 除外";
        }
        if(llp.length > 0) {
          Pattern2 = new RegExp("\\.("+llp.join("|")+")(\\.|\\?|\\/|$)", "i");
          SubKey == 3 ? SubKey = 5 : SubKey = 4;
          //ss = "LINK："+llp+" のみ";
        }
        ss = v2c.context.commandLabel;
      }
      StressRes = false;
    } else if(KeyWord == "line") {
      Pattern1 = new RegExp('\\n+', 'g');
      args[1] == undefined ? SearchKey = 3 : SearchKey = args[1];
      if(args[2] == "less"){
        if(SearchKey == "input")
          SearchKey = v2c.prompt("入力行数以下のレス", "3");
        if(SearchKey > 1){
          ss = "本文が"+SearchKey+"行以下";
          SubKey = 1;
        } else {
          SearchKey = 0;
        }
      } else if(args[2] == "more" || args[2] == undefined){
        if(SearchKey == "input")
          SearchKey = v2c.prompt("入力行数以上のレス", "3");
        if(SearchKey > 1){
          ss = "本文が"+SearchKey+"行以上";
          SubKey = 2;
        } else {
          SearchKey = 0;
        }
      } else {
        SearchKey = 0;
      }
      StressRes = false;
    } else if(KeyWord == "ref") {
      SearchKey = args[1];
      if(SearchKey == "input")
        SearchKey = v2c.prompt("入力値以上の被参照レス", "3");
      if(SearchKey === undefined) SearchKey = 3;
      if(SearchKey<1) SearchKey = 0;
      ss = "被参照数が"+SearchKey+"以上";
      Popup1Res = true;
      StressRes = false;
    } else if(KeyWord == "daily") {
      SearchKey = vrx.date.match(new RegExp("^.+?\\(.\\)"));
      ss = "日付："+SearchKey;
      Popup1Res = true;
      OverlappingRes = true;
      StressRes = false;
    } else if(KeyWord == "day") {
      var dm = vrx.date.match(/((\d{4})\/(\d{2})\/(\d{2}))/);
      if(dm){
        SearchKey = new Date(dm[2], parseInt(dm[3]-1), dm[4]).getTime();
        var da;
        args[1] == undefined ? da = 7 : da = args[1];
        if(da == "input")
          da = v2c.prompt("入力した期間分のレス", "7");
        if(SearchKey > 1){
          var od = 24*60*60*1000;
          if(args[2] == "end"){
            ss = dm[1]+"までの"+da+"日間";
            SubKey = SearchKey+(1-da)*od;
            SearchKey = SearchKey+od;
          } else if(args[2] == "start" || args[2] == undefined){
            ss = dm[1]+"からの"+da+"日間";
            SubKey = SearchKey+da*od;
          } else {
            SearchKey = 0;
          }
        } else {
          SearchKey = 0;
        }
        Popup1Res = true;
        OverlappingRes = true;
      } else {
        SearchKey = 0;
      }
      StressRes = false;
    } else if(KeyWord == "min") {
      SearchKey = vrx.time;
      if(SearchKey){
        var nb = vrx.number;
        var mi;
        args[1] == undefined ? mi = 60 : mi = args[1];
        if(mi == "input")
          mi = v2c.prompt("入力した時間分のレス", "60");
        if(SearchKey > 1){
          var om = 60*1000;
          if(args[2] == "end"){
            ss = nb+"までの"+mi+"分間";
            SubKey = SearchKey-mi*om;
            len = nb;
          } else if(args[2] == "start" || args[1] == undefined || args[2] == undefined){
            ss = nb+"からの"+mi+"分間";
            SubKey = SearchKey+mi*om;
            sidx = nb-1;
          } else {
            SearchKey = 0;
          }
        } else {
          SearchKey = 0;
        }
        Popup1Res = true;
        OverlappingRes = true;
      } else {
        SearchKey = 0;
      }
      StressRes = false;
    } else if(KeyWord == "all") {
      SearchKey = 1;
      ss = "全レス表示";
      Popup1Res = true;
      OverlappingRes = true;
      StressRes = false;
    } else if(KeyWord == "new") {
      var nrs = vtx.newResCount;
      if(nrs) {
        SearchKey = 1;
        sidx = lrs-nrs;
      } else {
        SearchKey = 0;
      }
      ss = "新着レス";
      Popup1Res = true;
      OverlappingRes = true;
    } else if(KeyWord == "old") {
      SearchKey = 1;
      len = lrs-vtx.newResCount;
      ss = "既読レス";
      Popup1Res = true;
      OverlappingRes = true;
      StressRes = false;
    } else if(KeyWord == "ng") {
      SearchKey = 1;
      ss = "NG判定";
      SubKey = args[1] == "reason";
      var sc;
      for(var i = 0; i<lrs; i++) {
        sc = vtx.getRes(i);
        if(sc.ng){
          so = sc.ngOrigin;
          sr = sc.refCount;
          Chains[i] = [];
          if(so && (sc.ngReason+"").indexOf("連鎖[参照]") >-1) {
            Chains[Number(so.index)].push(i);
            continue;
          }
          if(sr){
            Chains[i] = sc.refResIndex;
          }
        }
      }
      if(StressRes) StressRes = true;
      Popup1Res = true;
      OverlappingRes = true;
    } else {
      KeyWord = "filter";
      SearchKey = 1;
      RootIdxes = vcx.checkedResIndex;
      if(RootIdxes.length == 0){
        RootIdxes = vcx.filteredResIndex;
        if(RootIdxes.length != lrs){
          ss = "抽出表示";
          sp = 0;
        } else {
          SearchKey = 0;
        }
      } else {
        ss = "チェック表示";
      }
      len = RootIdxes.length;
      Popup1Res = true;
      StressRes = false;
    }
    if(SearchKey){
      //isSearchString関数に従って抽出データを取得する。（全レス、新着レス、既読レス、抽出、チェック表示は従わない。）
      var sr, req = 1;
      for(var m = sidx; m<len; m++) {
        if(KeyWord != "filter"){
          sr = vtx.getRes(m);
          if(!sr) continue;
          if(KeyWord != "all" || KeyWord != "new" || KeyWord != "old"){
            req = isSearchString(sr);
          }
        } else {
          sr = vtx.getRes(RootIdxes[m]);
          if(!sr) continue;
        }
        if(req) {
          if(KeyWord != "filter"){
            RootIdxes.push(sr.index);
          }
          if(KeyWord != "ng"){
            srr = sr.refCount;
          } else {
            if(Chains[m]){
              srr = Chains[m].length;
            } else   {
              srr = 0;
            }
          }
          RootRefCounts.push(srr);
          srs += srr;
        }
      }
      //抽出データとコマンドに従いツリーを作成する。
      var adl = RootIdxes.length;
      if(adl > 1 || srs > 0 ||(adl == 1 && Popup1Res == true)) {
        AllLines.push("<div class = 'title'>"+ss+"　書き込み数："+adl+"　被参照レス(合計)："+srs+"</div>");//１行目のタイトルをストック
        var arl = 0;
        if(ActionResult[0]){
          css = css1;
        } else {
          css = css2;
          createSameResIdxList(lrs);
          var src = vrx.refCount, srn = vrx.number;
        }
        for(var p = 0; p<adl; p++){
          OverlappingRes == true ? arl = isSearchNum(InnerNums, RootIdxes[p]+1) : arl = 0;
          if(!arl) {
            srg = vtx.getRes(RootIdxes[p])
            KeyWord == "ng" && SubKey ? Message = srg.ngReason : Message = editMessage(srg.message, 0);
            if(ActionResult[0]){
              AllLines.push("<b><a href = '"+ThreadUrl+(RootIdxes[p]+1)+"'>"+(RootIdxes[p]+1)+"</a></b>"+" + "
                +RootRefCounts[p]+createMessageSpan(Message,StressRes));
            } else {
              AllLines.push("<div class = 'inf'>"+createNumSpan(RootIdxes[p]+1,true)
                +createNameSpan(srg.name)+createMailSpan(srg.mail)
                +"投稿日：<span class = 'time'>"+srg.date+"</span>"+createIDSpan(srg.id+"")
                +"</div><div class = 'msg'>"+Message+"</div>");
            }
            if(RootRefCounts[p] > 0) {
              ActionResult[0] ? AllLines.concat(createTreeOutline(OneLines, RootIdxes[p])) : AllLines.concat(createTree(OneLines, RootIdxes[p]));
              AllLines.push("");
            }
          }
        }
      }
    }
  } else {
    //引数無しの場合、選択レス番号のツリーを作成する。
    var src = vrx.refCount, srn = vrx.number;
    if(src && ActionResult[0]) { //アウトライン表示
      ss = "アウトラインツリー";
      if(RootResMsg){
        AllLines.push(createNumSpan(srn,true)+createMessageSpan(editMessage(vrx.message, 0)));
      } else {
        AllLines.push(createNumSpan(srn,true));
      }
      AllLines.concat(createTreeOutline(OneLines, srn-1));
      css = css1;
    } else if(src && !ActionResult[0]) { //非アウトライン表示
      ss = "レスツリー";
      createSameResIdxList(lrs);
      var msg = editMessage(vrx.message, 0);
      AllLines.push("<div class = 'inf'>"+createNumSpan(srn,true)
      +createNameSpan(vrx.name)+createMailSpan(vrx.mail)
      +"投稿日：<span class = 'time'>"+vrx.date+"</span>"+createIDSpan(vrx.id+"")
      +"</div><div class = 'msg'>"+msg+"</div>");
      AllLines.concat(createTree(OneLines, srn-1));
      css = css2;
    }
    if(src || srn) NumText = "【"+srn+"】";
  }
  PopupText = AllLines.join("<br>");
  if(PopupText) {
    //重複レス番号の最初の番号を赤色に置換する。
    for(var s = 0, rrl = Overlapping1stNums.length; s<rrl; s++) {
      PopupText = PopupText.replace(new RegExp("(<a class = ')num('[^>]+"+Overlapping1stNums[s]+"'>)"), "$1"+"overlap"+"$2");
    }
    //データをポップアップ表示
    if(ha){
      var ReturnButton = rb ? "<br><form action=''><input type='submit' value='　　　戻　る　　　' name='return'></form>" : "";
      PopupHtml[ha] = "<html><head>"+css+"</head><body>"+PopupText+ReturnButton+"</body></html>";
      ReResTreePane && ActionResult[1] ? vcx.setResPaneHTML(PopupHtml[ha], ss+NumText, NewResPane) : vcx.setPopupHTML(PopupHtml[ha]);
      vcx.setTrapFormSubmission(true);
      vcx.setRedirectURL(true);
    } else {
      rb = !ActionResult[1];
      PopupHtml[ha] = "<html><head>"+css+"</head><body>"+PopupText+"</body></html>";
      ActionResult[1] ? vcx.setResPaneHTML(PopupHtml[ha], ss+NumText, NewResPane) : vcx.setPopupHTML(PopupHtml[ha]);
      vcx.setRedirectURL(true);
    }
    //filter引数があればレス表示欄を抽出表示する。（全レス、抽出表示は除く）
    if(RootIdxes.length && ActionResult[2] && KeyWord != "all" && SearchKey){
      vcx.setFilteredResIndex(RootIdxes);
    }
  } else if(PopupHtml[0]){
    //リダイレクト、被参照なし
    if(rb) {
      vcx.setPopupHTML(PopupHtml[0]);
      vcx.setRedirectURL(true);
    }
  }
}
