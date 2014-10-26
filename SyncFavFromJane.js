// 【登録場所】 全体
// 【ラベル】 Janeからお気に入り同期のサンプル
// 【コマンド】 ${SCRIPT:FrwVf} SyncFavFromJane.js 同期元のJaneのパス
// 【備考】 H20111217以降が必要。お気に入り同期に関連する関数の使用例です。

var fn='Jane同期'; // 同期用お気に入りタブの名前
var fj=v2c.context.argLine; // 同期元のJaneのパス

function importFavorite() {
  // お気に入り設定ファイルの読み込み
  var sf=v2c.readFile(new java.io.File(fj,'favorites.dat'),'MS932');
  if (!sf) {
    v2c.alert('favorites.dat の読み込みに失敗しました。');
    return;
  }
  sf = escapeLTGT(String(sf));

  // 同期先お気に入りタブの準備
  var fav;
  var fvs=v2c.favorites;
  for (var i=fvs.count-1; i>=0; i--) {
    var fvi=fvs.getFavorite(i);
    if (fvi.name==fn) {
      fav = fvi;
      break;
    }
  }
  if (fav) {
    fav.removeAll();
  } else {
    fav = fvs.createFavorite(fn);
  }

  // お気に入り設定の解析
  var is=new java.io.ByteArrayInputStream(new java.lang.String(sf).getBytes('UTF-8'));
  var doc=javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(is);
  if (!doc) {
    v2c.alert('favorites.dat の解析に失敗しました。');
    return;
  }

  // 同期処理
  createFolder(doc.getDocumentElement(),fav.root,fav);

  // 終了
  v2c.alert('Janeからのお気に入り同期が終了しました。');
}
function createFolder(ef,fd,fav) {
  var nl=ef.getChildNodes();
  for (var i=0; i<nl.getLength(); i++) {
    var nd=nl.item(i);
    if (!(nd instanceof org.w3c.dom.Element)) {
      continue;
    }
    var sen=nd.getTagName();
    if (sen=='folder') {
      var sfn=nd.getAttribute('name');
      if ((sfn==null)||(sfn.length()==0)) {
        sfn = 'folder';
      }
      createFolder(nd,fav.appendFolder(fd,sfn),fav);
    } else if (sen=='item') {
      var su='http:/'+'/'+nd.getAttribute('host')+'/'+nd.getAttribute('bbs')+'/';
      var sd=nd.getAttribute('board');
      var bd=v2c.getBoard(su,sd);
      if (bd) {
        var sk=nd.getAttribute('datname');
        if (sk&&(sk.length()>0)) {
          var th=bd.getThread(sk,su);
          if (th) {
            if (th.localResCount==0) {
              var fl=[fj,'Logs','2ch',nd.getAttribute('category'),sd,sk+'.dat'].join(java.io.File.separator);
              th.importDatFile(fl,nd.getAttribute('name'),false);
            }
            if (th.localResCount>0) {
              fav.appendItem(fd,th);
            }
          }
        } else {
          fav.appendItem(fd,bd);
        }
      }
    }
  }
}
function escapeLTGT(sf) {
  var bq=false;
  for (var i=sf.length-1; i>=0; i--) {
    var c=sf.charAt(i);
    if (bq) {
      if (c=='"') {
        bq = false;
      } else if (c=='<') {
        sf = sf.substring(0,i)+'&lt;'+sf.substring(i+1);
      } else if (c=='>') {
        sf = sf.substring(0,i)+'&gt;'+sf.substring(i+1);
      }
    } else {
      if (c=='"') {
        bq = true;
      }
    }
  }
  return sf;
}

importFavorite();