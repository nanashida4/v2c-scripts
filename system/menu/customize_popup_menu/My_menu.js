//【登録場所】 "V2C\script\system\menu.js"
//【内容】 ポップアップメニューを変更する。
//【備考】 
// ・V2CMenuEditor（http://yy61.60.kg/test/read.cgi/v2cj/1304861674/191，リンク先含む）で作成
// ・237行目以降の「メニュー編集コード」は2.10.2 [R20130101]時点のデフォルトデータ。そのままだと変化なし
// ・全項目を入れ替えて作成し直す形、パターンが決まってるので削除なり位置替えたりならMenuEditor使わないでもある程度は簡単にできるかも
// ・添付のMy_menu.jsはカスタマイズ例です編集の参考にしてください。
//
// ※ 注意！ 全項目入れ替え形式なので新機能・名前変更があったときメニューに表示されないので
// その都度編集が必要です。スクリプトスレで報告すると誰かが修正するかも…
//
//【スクリプト】
// ----- 次の行から -----
var settings = {
  snList: {
    ThreadPanel: 'レス表示欄',
    ResPaneTab:'レス表示欄タブ',
    TwitterPanel: 'Tweet表示欄',
    ResNum: 'レス番号',
    ResCheck: 'レスのチェック',
    Name: '名前欄',
    TwitterUserName: 'Twitterユーザ名',
    Mail: 'メール欄',
    Time: '投稿時間',
    ID: 'ID',
    Aux: '補助情報',
    Link: 'リンク',
    Thumbnail: 'サムネイル画像',
    SelText: '選択テキスト',
    SelTextLink: '選択範囲のリンク',
    AddressBar: 'アドレスバー',
    ThreadListMiniSearch: 'スレ一覧絞り込み',
    ThreadViewMiniSearch: 'レス表示絞り込み',
    WriteMessage: '書き込み欄',
    ImagePopup: 'ポップアップ画像',
    GalleryThumbnail: 'サムネイル表示画像',
    TwitterIcon: 'Twitterアイコン',
    ThreadList: 'スレ一覧',
    ResPaneTab: 'レス表示タブ',
    TabbedPane: 'その他タブ',
    ImageViewerTab: '画像ビューワタブ',
    ImageViewer: '画像ビューワ',
    ImageTabCheck: '画像タブチェック'
  },
  separatorTagName: 'Separator',
  separatorLabel: '────────',
  labelAttribute: 'label',
  extTagName: 'V2CMenu',
  extLabel: '外部コマンド',
  searchHistoryLabel: '検索履歴'
};

var menu = {
  items: {},
  setItem: function(item, label) {
    var uLabel = this.getUniqueLabel(label);
    this.items[uLabel] = item;
    return uLabel;
  },
  document: null,
  createSeparator: function() {
    return this.createElement(settings.separatorTagName, settings.separatorLabel);
  },
  createElement: function(elementName, label) {
    var el = this.document.createElement(elementName);
    el.setAttribute(settings.labelAttribute, label);
    return el;
  },
  getUniqueLabel: function(label) {
    var i = 1;
    var l = label;
    do {
      if (!this.items[l]) {
        break;
      }
      i++;
      l = label + i;
    }
    while (i < 100)
    return l;
  }
};

function preparePopup(pm, sn) {

  var dbfactory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
  var docbuilder = dbfactory.newDocumentBuilder(); 
  menu.document = docbuilder.newDocument(); // 
  var root = menu.document.createElement(sn);
  if (settings.snList[sn]) {
    root.setAttribute(settings.labelAttribute, settings.snList[sn]);
  }
  menu.document.appendChild(root); //
  //まずルートを全て取得
  var pma = [];
  for (var i = 0; i < pm.getComponentCount(); i++) {
    pma.push(pm.getComponent(i));
  }
  menu.items = {};
  var r = getElements(pma);
  for (var i = 0; i < r.elements.length; i++) {
    root.appendChild(r.elements[i]);
  }
  var stringWriter = new java.io.StringWriter();
  var streamResult = new javax.xml.transform.stream.StreamResult(stringWriter);
  var domSource = new javax.xml.transform.dom.DOMSource(menu.document);
  var transformerFactory = javax.xml.transform.TransformerFactory.newInstance();
  var transformer = transformerFactory.newTransformer();
  transformer.setOutputProperty(javax.xml.transform.OutputKeys.INDENT, "yes");
  transformer.setOutputProperty(javax.xml.transform.OutputKeys.METHOD, "xml");
  transformer.setOutputProperty(javax.xml.transform.OutputKeys.OMIT_XML_DECLARATION, "yes");
  // インデントの文字数
  transformer.setOutputProperty(com.sun.org.apache.xml.internal.serializer.OutputPropertiesFactory.S_KEY_INDENT_AMOUNT, "2");
  transformer.transform(domSource, streamResult);
  // とりあえず出力。
  v2c.println(stringWriter.toString());
}

function getElement(item) {
  var ret = {//戻り値
    extLabel: null,//itemが外部コマンドに属する場合はそのラベル
    element: null //このitemのElement ↑とどちらかがnullになる
  }
  
  if (!(item instanceof javax.swing.JMenuItem)) {//セパレータ)
    ret.element = menu.createSeparator();
    return ret;
  }
  else if (item.getClass().getSimpleName().indexOf('ExtCmdMenuItem') != -1 ||
  item.getText().equals('（なし）')) {
    ret.extLabel = settings.extLabel;
    return ret;
  }
  else if (item.getClass().getSimpleName().indexOf('SHMenuItem') !=-1) {      
    ret.extLabel = settings.searchHistoryLabel;
    return ret;
  }
  else {
    var eName = item.getClass().getSimpleName();
    var label = item.getText();
    if (item.getClass() == java.lang.Class.forName('javax.swing.JMenu')) {
    //if (item instanceof javax.swing.JMenu && item.getItemCount() > 0) {
      var jma = [];
      for (var i = 0; i < item.getItemCount(); i++) {
        jma.push(item.getMenuComponent(i));
      }
      var r = getElements(jma);
      ret.extLabel = r.extLabel;
      if (!r.extLabel) {
        var ulabel = menu.setItem(item, label);
        ret.element = menu.createElement(eName, ulabel);
        for (var i = 0; i < r.elements.length; i++) {
          ret.element.appendChild(r.elements[i]);
        }
      }
    }
    else {
      var ulabel = menu.setItem(item, label);
      ret.element = menu.createElement(eName, ulabel);
    }
    return ret;
  }
}

function getElements(ma) {
  var isExt = true; //全項目外部コマンドの場合にtrue
  var buffSeparatorItem = []; //外部コマンド内のセパレータItem保持用
  var ret = {
    extLabel: null,
    elements: []
  }
  
  var extMenuItems = [];
  for (var i = 0; i < ma.length; i++) {
    var m = ma[i];
    var r = getElement(m);
    if (!r.extLabel) {//外部コマンドじゃない
      if (r.element.getTagName().equals(settings.separatorTagName)) {//セパレータ
        if (ret.extLabel) {
          buffSeparatorItem.push(m);
        }
        else {
          ret.elements.push(r.element);
        }
      }
      else {//通常のJMenuItem
        if (ret.extLabel) {
          //外部コマンドの終わりには必ずセパレータが1つあると仮定し、保持分-1のセパレータを出力
          if (buffSeparatorItem.length > 1) {
            extMenuItems = extMenuItems.concat(buffSeparatorItem.splice(1));
          }
          var ulabel = menu.setItem(extMenuItems,ret.extLabel);
          ret.elements.push(menu.createElement(settings.extTagName, ulabel));
          ret.elements.push(menu.createSeparator());//外部コマンド境界セパレータ
          extMenuItems = [];
        }
        ret.elements.push(r.element);
        ret.extLabel = null;
        isExt = false;
      }
    }
    else {//外部コマンドの場合
      if (!ret.extLabel) {
        ret.extLabel = r.extLabel;
      }
      if (buffSeparatorItem.length > 0) {
        extMenuItems = extMenuItems.concat(buffSeparatorItem);
        buffSeparatorItem.length = 0;
      }
      extMenuItems.push(m);
    }
  }
  if (!isExt) {
    if (ret.extLabel) {//最後が外部コマンドの場合まだ登録されてないので
      var label = menu.getUniqueLabel(ret.extLabel);
      ret.elements.push(menu.createElement(settings.extTagName, label));
      if (buffSeparatorItem.length > 0) {
        extMenuItems = extMenuItems.concat(buffSeparatorItem);
      }
      menu.items[label] = extMenuItems;
    }
    ret.extLabel = null;
  }
  else {
    if (!ret.extLabel) {
      ret.extLabel = settings.extLabel; //中身が空orセパレータだけの場合は外部コマンドのはず
    }
    ret.elements = null;
  }
  return ret;
}


function popupMenuCreated(pm, sn) {
  preparePopup(pm, sn);
  var ma = menu.items;
  // メニュー編集コード(ここから)
  if (sn =='ID') {
    pm.removeAll();
    ma['このIDをコピー'].text = 'コピー';
    pm.add(ma['このIDをコピー']);
    ma['このIDを抽出'].text = '抽出';
    pm.add(ma['このIDを抽出']);
    pm.addSeparator();
    ma['背景色・別名の設定(B)…'].text = 'ラベルの設定(B)…';//名前変更
    pm.add(ma['背景色・別名の設定(B)…']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('このIDを');//下位メニュー追加
      ma['非表示のIDに追加(H)'].text = '非表示リストに追加(H)';
      ma00.add(ma['非表示のIDに追加(H)']);
      ma['非表示のIDに追加（透明）'].text = '透明非表示リストに追加';
      ma00.add(ma['非表示のIDに追加（透明）']);
      ma['非表示のIDを解除'].text = '非表示リストから解除';
      ma00.add(ma['非表示のIDを解除']);
      ma00.addSeparator();
      ma00.add(ma['常に表示']);
      ma00.add(ma['非表示']);
      ma00.add(ma['透明非表示']);
      ma00.add(ma['非表示設定をクリア']);
      ma00.addSeparator();
      ma00.add(ma['「ログから検索」に追加']);
      pm.add(ma00);
    }
    //pm.addSeparator();//行頭に「//」追加で非表示
    pm.addSeparator();
    pm.add(ma['名前・ID・BEの出現回数…']);
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('設定');
      ma10.add(ma['ID出現回数を表示']);
      ma10.add(ma['投稿端末を表示']);
      ma10.addSeparator();
      ma10.add(ma['ID出現回数によるハイライトの設定…']);
      ma10.add(ma['ID末尾による非表示設定…']);
      ma10.add(ma['背景色・別名のデフォルト設定…']);
      pm.add(ma10);
    }
  }

  if (sn =='ResNum') {
    pm.removeAll();
    pm.add(ma['このレスにレス(R)']);
    {
      var ma00 = new javax.swing.JMenu('このレスを');
      ma['このレスを常に表示(S)'].text = '常に表示(S)';
      ma00.add(ma['このレスを常に表示(S)']);
      ma['このレスを非表示(H)'].text = '非表示(H)';
      ma00.add(ma['このレスを非表示(H)']);
      ma['このレスを透明非表示(T)'].text = '透明非表示(T)';
      ma00.add(ma['このレスを透明非表示(T)']);
      ma00.addSeparator();
      ma00.add(ma['しおりを挟む(B)']);
      ma00.addSeparator();
      ma00.add(ma['AAレス']);
      ma00.add(ma['非AAレス(P)']);
      ma00.addSeparator();
      ma00.add(ma['新着境界を設定(N)']);
      //ma00.addSeparator();
      //ma00.add(ma['このレスの内容で新スレ(N)']);
      pm.add(ma00);
    }
    pm.add(ma['このレスにレス [本文引用]']);
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('コピー');
      ma['このレスをコピー(C)'].text = 'レス(C)';
      ma10.add(ma['このレスをコピー(C)']);
      ma['本文をコピー(M)'].text = '本文(M)';
      ma10.add(ma['本文をコピー(M)']);
      ma['本文を引用してコピー(I)'].text = '本文を引用(M)';
      ma10.add(ma['本文を引用してコピー(I)']);
      ma['このレスのURLをコピー'].text = 'レスのURL';
      ma10.add(ma['このレスのURLをコピー']);
      ma10.addSeparator();
      ma['カスタムコピー…'].text = 'カスタム';
      ma10.add(ma['カスタムコピー…']);
      ma['datファイルの行をコピー'].text = 'datファイルの行';
      ma10.add(ma['datファイルの行をコピー']);
      pm.add(ma10);
    }
    pm.addSeparator();
    pm.add(ma['ラベル']);
    pm.add(ma['付箋を貼る…']);
    {
      var ma20 = new javax.swing.JMenu('抽出');
      ma['ラベルの付いたレスを抽出'].text = 'ラベルの付いたレスを';
      ma20.add(ma['ラベルの付いたレスを抽出']);
      ma['付箋を貼ったレスを抽出'].text = '付箋を貼ったレスを';
      ma20.add(ma['付箋を貼ったレスを抽出']);
      pm.add(ma20);
    }
    pm.addSeparator();
    {
      var ma30 = new javax.swing.JMenu('レスのチェック');
      ma30.add(ma['このレスをチェック(C)']);
      ma30.addSeparator();
      ma30.add(ma['ここからチェック']);
      ma30.add(ma['ここからクリア']);
      ma30.add(ma['全て反転']);
      ma30.add(ma['全てクリア']);
      pm.add(ma30);
    }
    pm.addSeparator();
    {
      var ma40 = new javax.swing.JMenu('ここから');
      ma40.add(ma['画像をダウンロード(O)']);
      ma40.addSeparator();
      ma['ここからテキスト選択(S)'].text = 'テキスト選択(S)';
      ma40.add(ma['ここからテキスト選択(S)']);
      pm.add(ma40);
    }
    pm.addSeparator();
    pm.add(ma['被参照数ランキング…']);
    pm.addSeparator();
    {
      var ma50 = new javax.swing.JMenu('荒らし報告');
      ma['2ch荒らし報告形式でコピー'].text = '2ch形式でコピー';
      ma50.add(ma['2ch荒らし報告形式でコピー']);
      ma['Boo2008に報告する…'].text = 'Boo2008へ…';
      ma50.add(ma['Boo2008に報告する…']);
      pm.add(ma50);
    }
    pm.addSeparator();
    {
      var ma60 = new javax.swing.JMenu('ローカルスレッド');
      ma60.add(ma['このレスを追加（元レスURL付）…']);
      ma60.add(ma['このレスを追加…']);
      ma60.addSeparator();
      ma60.add(ma['本文を書き込み欄で置き換える…']);
      ma60.add(ma['最後のレスをこのレスの前に移動…']);
      ma60.addSeparator();
      ma60.add(ma['レスを削除']);
      pm.add(ma60);
    }
    pm.addSeparator();
    {
      var ma70 = new javax.swing.JMenu('設定');
      ma70.add(ma['被参照回数を表示']);
      ma70.add(ma['被参照回数によるハイライトの設定…']);
      pm.add(ma70);
    }
  }

  if (sn =='ThreadPanel') {
    pm.removeAll();
    pm.add(ma['お気に入りに登録(F)']);
    pm.add(ma['フォルダに直接登録…']);
    pm.add(ma['お気に入り登録の解除']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('再取得・削除');
      ma00.add(ma['スレッドの再取得(G)']);
      ma00.add(ma['ログを削除(D)']);
      ma00.add(ma['ログを削除して閉じる(X)']);
      pm.add(ma00);
    }
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('開く');
      ma10.add(ma['次スレ検索(N)…']);
      ma10.add(ma['過去スレを表示する']);
      ma10.addSeparator();
      ma10.add(ma['キーワード（2ch）…']);
      ma10.addSeparator();
      ma['外部ブラウザで開く(B)'].text = 'スレを外部ブラウザで';
      ma10.add(ma['外部ブラウザで開く(B)']);
      //ma10.add(ma['このスレの板を開く']);
      ma['このスレの板を新しいタブで開く'].text = '板（新タブ）';
      ma10.add(ma['このスレの板を新しいタブで開く']);
      ma['このスレの板を外部ブラウザで開く'].text = '板を外部ブラウザで';
      ma10.add(ma['このスレの板を外部ブラウザで開く']);
      ma10.addSeparator();
      ma10.add(ma['看板の表示…']);
      ma10.add(ma['ローカルルールの表示…']);
      ma10.add(ma['SETTING.TXTの表示…']);
      ma10.add(ma['投稿規約の表示(S)…']);
      ma10.addSeparator();
      ma10.add(ma['お気に入りタブを表示(F)']);
      ma10.addSeparator();
      ma10.add(ma['画像キャッシュ一覧(L)']);
      ma10.add(ma['画像表示ウィンドウ(W)']);
      pm.add(ma10);
    }
    pm.addSeparator();
    pm.add(ma['送る']);
    {
      var ma20 = new javax.swing.JMenu('コピー');
      ma['タイトルをコピー(T)'].text = 'タイトル(T)';
      ma20.add(ma['タイトルをコピー(T)']);
      ma['URLをコピー'].text = 'URL';
      ma20.add(ma['URLをコピー']);
      ma['タイトルとURLをコピー(B)'].text = 'タイトルとURL(B)';
      ma20.add(ma['タイトルとURLをコピー(B)']);
      ma['全表示レスをコピー'].text = '全表示レス';
      ma20.add(ma['全表示レスをコピー']);
      ma['ログファイルのパスをコピー(P)'].text = 'ログファイルのパス(P)';
      ma20.add(ma['ログファイルのパスをコピー(P)']);
      ma['ログファイルをコピー(F)'].text = 'ログファイル(F)';
      ma20.add(ma['ログファイルをコピー(F)']);
      ma20.addSeparator();
      ma['スレッドを登録用にコピー(I)'].text = 'スレッド登録用(I)';
      ma20.add(ma['スレッドを登録用にコピー(I)']);
      pm.add(ma20);
    }
    pm.add(ma['全てを選択(A)']);
    pm.addSeparator();
    pm.add(ma['ラベル（スレッド）']);
    pm.addSeparator();
    pm.add(ma['オートリロード']);
    pm.add(ma['同期再生']);
    pm.add(ma['オートスクロール［マウス］(S)']);
    pm.addSeparator();
    {
      var ma30 = new javax.swing.JMenu('抽出');
      ma['リンクを含むレスを抽出(L)'].text = 'リンクを含むレス(L)';
      ma30.add(ma['リンクを含むレスを抽出(L)']);
      ma['マーカーを引いたレスを抽出(M)'].text = 'マーカーを引いたレス(M)';
      ma30.add(ma['マーカーを引いたレスを抽出(M)']);
      ma['参照＆被参照レスを抽出'].text = '参照＆被参照レス';
      ma30.add(ma['参照＆被参照レスを抽出']);
      ma['キーワードを含むレスを抽出(H)'].text = 'キーワードを含むレス(H)';
      ma30.add(ma['キーワードを含むレスを抽出(H)']);
      ma30.add(ma['抽出ダイアログ…']);
      pm.add(ma30);
    }
    {
      var ma40 = new javax.swing.JMenu('全表示レス');
      ma40.add(ma['HTML形式で保存…']);
      ma40.addSeparator();
      ma40.add(ma['画像を直接保存(S)']);
      ma40.add(ma['フォルダに直接保存']);
      pm.add(ma40);
    }
    pm.addSeparator();
    for (var i = 0; i < ma['外部コマンド'].length; i++) {
      pm.add(ma['外部コマンド'][i]);
    }
    pm.addSeparator();
    {
      var ma50 = new javax.swing.JMenu('設定');
      ma50.add(ma['連鎖非表示［参照］(R)']);
      ma50.add(ma['連鎖非表示［ID］']);
      ma50.add(ma['透明非表示(T)']);
      ma50.add(ma['個別の透明設定を無視']);
      ma50.add(ma['ポップアップで透明レスを表示']);
      ma50.add(ma['前回非表示のレスを非表示(C)']);
      ma50.addSeparator();
      ma50.add(ma['スレタイ変更（ローカルスレッド）…']);
      ma50.add(ma['レス表示の設定(P)…']);
      ma50.add(ma['背景画像(B)…']);
      pm.add(ma50);
    }
    pm.addSeparator();
    pm.add(ma['スレッドのプロパティ(P)…']);
  }
  
  //メニュー編集コード(ここまで)
}