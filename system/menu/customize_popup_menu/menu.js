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
    GalleryThumbnail: 'サムネイル一覧画像',
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
  if (sn =='AddressBar') {
    pm.removeAll();
    pm.add(ma['カット']);
    pm.add(ma['コピー']);
    pm.add(ma['ペースト']);
    pm.add(ma['ペーストして開く']);
    pm.addSeparator();
    pm.add(ma['現在のタブで開く']);
    pm.add(ma['外部ブラウザで開く']);
    pm.add(ma['内部ブラウザで開く']);
    pm.add(ma['モリタポでスレを取得']);
    pm.add(ma['板として開く']);
    pm.addSeparator();
    pm.add(ma['サイズの設定…']);
  }

  if (sn =='GalleryThumbnail') {
    pm.removeAll();
    pm.add(ma['外部ブラウザで開く(B)']);
    pm.add(ma['リンクのコピー(C)']);
    pm.add(ma['このリンクを無効化(I)']);
    pm.add(ma['NGファイルに追加…']);
    pm.add(ma['リンク履歴の削除(D)']);
    pm.addSeparator();
    pm.add(ma['モザイク(M)']);
    pm.add(ma['キャッシュ保護(P)']);
    pm.addSeparator();
    pm.add(ma['画像を直接保存(S)']);
    pm.add(ma['フォルダに直接保存']);
    pm.add(ma['画像を保存…']);
    pm.addSeparator();
    pm.add(ma['アニメGIF制御パネル…']);
    pm.addSeparator();
    pm.add(ma['画像キャッシュ一覧(L)']);
    pm.addSeparator();
    pm.add(ma['全サムネイル画像を表示']);
  }

  if (sn =='ID') {
    pm.removeAll();
    pm.add(ma['このIDをコピー']);
    pm.addSeparator();
    pm.add(ma['非表示のIDに追加(H)']);
    pm.add(ma['非表示のIDに追加（透明）']);
    pm.add(ma['非表示のIDを解除']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('このIDのレスを');
      ma00.add(ma['常に表示']);
      ma00.add(ma['非表示']);
      ma00.add(ma['透明非表示']);
      ma00.add(ma['非表示設定をクリア']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['このIDを抽出']);
    pm.add(ma['「ログから検索」に追加']);
    pm.addSeparator();
    pm.add(ma['名前・ID・BEの出現回数…']);
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('設定');
      ma10.add(ma['ID出現回数を表示']);
      ma10.add(ma['投稿端末を表示']);
      ma10.addSeparator();
      ma10.add(ma['背景色・別名の設定(B)…']);
      ma10.add(ma['背景色・別名のデフォルト設定…']);
      ma10.addSeparator();
      ma10.add(ma['ID出現回数によるハイライトの設定…']);
      ma10.add(ma['ID末尾による非表示設定…']);
      pm.add(ma10);
    }
  }

  if (sn =='ImagePopup') {
    pm.removeAll();
    pm.add(ma['スケール表示(F)']);
    pm.add(ma['元のサイズで表示(O)']);
    pm.add(ma['最大表示(X)']);
    pm.add(ma['枠に合わせて表示(A)']);
    {
      var ma00 = new javax.swing.JMenu('相対サイズ変更');
      ma00.add(ma['倍に拡大']);
      ma00.add(ma['1.5倍に拡大']);
      ma00.add(ma['1/1.5倍に縮小']);
      ma00.add(ma['半分に縮小']);
      pm.add(ma00);
    }
    pm.add(ma['90°左に回転(L)']);
    pm.add(ma['90°右に回転(R)']);
    pm.add(ma['左右反転']);
    pm.addSeparator();
    pm.add(ma['モザイク']);
    pm.add(ma['キャッシュ保護']);
    pm.addSeparator();
    pm.add(ma['画面の中心に移動']);
    pm.add(ma['ウィンドウを残す']);
    pm.add(ma['ウィンドウを閉じる']);
    pm.addSeparator();
    pm.add(ma['画像を直接保存(S)']);
    pm.add(ma['フォルダに直接保存']);
    pm.add(ma['画像を保存…']);
    pm.addSeparator();
    pm.add(ma['アニメGIF制御パネル…']);
    pm.addSeparator();
    pm.add(ma['画像のプロパティ(P)…']);
  }

  if (sn =='ImageTabCheck') {
    pm.removeAll();
    pm.add(ma['ここからチェック']);
    pm.add(ma['ここからクリア']);
    pm.add(ma['全て反転']);
    pm.add(ma['全てクリア']);
    pm.addSeparator();
    pm.add(ma['チェック無しタブを閉じる']);
    pm.addSeparator();
    pm.add(ma['コピー(C)']);
    pm.add(ma['無効化(I)']);
    pm.add(ma['NGファイルに追加…']);
    pm.add(ma['履歴を削除(D)']);
    pm.addSeparator();
    pm.add(ma['キャッシュを保護']);
    pm.add(ma['キャッシュ保護を解除']);
    pm.addSeparator();
    pm.add(ma['画像を直接保存(S)']);
    pm.add(ma['フォルダに直接保存…']);
    pm.add(ma['画像を保存…']);
  }

  if (sn =='ImageViewer') {
    pm.removeAll();
    pm.add(ma['スケール表示(F)']);
    pm.add(ma['元のサイズで表示(O)']);
    pm.add(ma['最大表示(X)']);
    pm.add(ma['枠に合わせて表示(A)']);
    {
      var ma00 = new javax.swing.JMenu('相対サイズ変更');
      ma00.add(ma['倍に拡大']);
      ma00.add(ma['1.5倍に拡大']);
      ma00.add(ma['1/1.5倍に縮小']);
      ma00.add(ma['半分に縮小']);
      pm.add(ma00);
    }
    pm.add(ma['90°左に回転(L)']);
    pm.add(ma['90°右に回転(R)']);
    pm.add(ma['左右反転']);
    pm.addSeparator();
    pm.add(ma['元レスを表示']);
    pm.addSeparator();
    pm.add(ma['外部ブラウザで開く(B)']);
    pm.add(ma['リンクのコピー(C)']);
    pm.add(ma['このリンクを無効化(I)']);
    pm.add(ma['NGファイルに追加…']);
    pm.add(ma['リンク履歴の削除(D)']);
    pm.addSeparator();
    pm.add(ma['モザイク(M)']);
    pm.add(ma['キャッシュ保護(P)']);
    pm.addSeparator();
    pm.add(ma['画像を直接保存(S)']);
    pm.add(ma['フォルダに直接保存']);
    pm.add(ma['画像を保存…']);
    pm.addSeparator();
    pm.add(ma['アニメGIF制御パネル…']);
    pm.addSeparator();
    pm.add(ma['画像のプロパティ…']);
  }

  if (sn =='ImageViewerTab') {
    pm.removeAll();
    pm.add(ma['タブを閉じる(C)']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('チェック');
      ma00.add(ma['このタブをチェック(C)']);
      ma00.addSeparator();
      ma00.add(ma['ここまでチェック']);
      ma00.add(ma['ここからチェック']);
      ma00.add(ma['ここからクリア']);
      ma00.add(ma['全て反転']);
      ma00.add(ma['全てクリア']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['エラーのタブを閉じる(E)']);
    pm.add(ma['既出画像のタブを閉じる']);
    pm.add(ma['全てのタブを閉じる(A)']);
    pm.add(ma['他のタブを閉じる(O)']);
    pm.add(ma['これより前を閉じる(L)']);
    pm.add(ma['これより後を閉じる(R)']);
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('画像保存（全タブ）');
      ma10.add(ma['画像を直接保存(S)']);
      ma10.add(ma['フォルダに直接保存…']);
      ma10.add(ma['画像を保存…']);
      pm.add(ma10);
    }
    pm.addSeparator();
    {
      var ma20 = new javax.swing.JMenu('リンク履歴削除');
      ma20.add(ma['全タブの履歴を削除']);
      pm.add(ma20);
    }
    pm.addSeparator();
    pm.add(ma['最大化']);
  }

  if (sn =='Link') {
    pm.removeAll();
    pm.add(ma['外部ブラウザで開く(B)']);
    pm.add(ma['リンク先をファイルに保存…']);
    pm.add(ma['リンクのコピー(C)']);
    pm.add(ma['ダウンロードを中止(S)']);
    pm.add(ma['このリンクを無効化(I)']);
    pm.add(ma['NGファイルに追加…']);
    pm.add(ma['リンク履歴の削除(D)']);
    pm.addSeparator();
    pm.add(ma['プロパティのインポート(T)']);
    pm.add(ma['お気に入りタブを表示']);
    pm.add(ma['このリンクの板を開く']);
    pm.add(ma['モリタポでスレを取得']);
    pm.addSeparator();
    for (var i = 0; i < ma['外部コマンド'].length; i++) {
      pm.add(ma['外部コマンド'][i]);
    }
    pm.addSeparator();
    pm.add(ma['画像キャッシュ一覧(L)']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('設定');
      ma00.add(ma['NGファイル登録の設定・削除…']);
      ma00.add(ma['NGファイルの一覧…']);
      ma00.add(ma['NGURLの設定…']);
      ma00.add(ma['画像保存フォルダの設定…']);
      ma00.add(ma['フォルダに直接保存の設定…']);
      ma00.addSeparator();
      ma00.add(ma['画像キャッシュファイル指定…']);
      pm.add(ma00);
    }
  }

  if (sn =='Mail') {
    pm.removeAll();
    pm.add(ma['このメール欄をコピー']);
    {
      var ma00 = new javax.swing.JMenu('非表示のメールに追加');
      ma00.add(ma['スレッド(T)']);
      ma00.add(ma['板(I)']);
      ma00.add(ma['BBS']);
      ma00.add(ma['全体(A)']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['メール欄非表示(P)']);
  }

  if (sn =='Name') {
    pm.removeAll();
    pm.add(ma['この名前欄をコピー']);
    {
      var ma00 = new javax.swing.JMenu('非表示の名前に追加');
      ma00.add(ma['スレッド(T)']);
      ma00.add(ma['板(I)']);
      ma00.add(ma['BBS']);
      ma00.add(ma['全体(A)']);
      ma00.addSeparator();
      ma00.add(ma['スレッド（トリップのみ）']);
      ma00.add(ma['板（トリップのみ）']);
      ma00.add(ma['BBS（トリップのみ）']);
      ma00.add(ma['全体（トリップのみ）']);
      pm.add(ma00);
    }
    {
      var ma10 = new javax.swing.JMenu('非表示の名前に追加（透明）');
      ma10.add(ma['スレッド(T)2']);
      ma10.add(ma['板(I)2']);
      ma10.add(ma['BBS2']);
      ma10.add(ma['全体(A)2']);
      ma10.addSeparator();
      ma10.add(ma['スレッド（トリップのみ）2']);
      ma10.add(ma['板（トリップのみ）2']);
      ma10.add(ma['BBS（トリップのみ）2']);
      ma10.add(ma['全体（トリップのみ）2']);
      pm.add(ma10);
    }
    pm.add(ma['名無に追加']);
    pm.add(ma['名無の削除…']);
    pm.addSeparator();
    pm.add(ma['名前・ID・BEの出現回数…']);
  }

  if (sn =='ResCheck') {
    pm.removeAll();
    pm.add(ma['ここからチェック']);
    pm.add(ma['ここからクリア']);
    pm.add(ma['全て反転']);
    pm.add(ma['全てクリア']);
    pm.addSeparator();
    pm.add(ma['抽出（現在の表示レスから）']);
    pm.addSeparator();
    pm.add(ma['レスをコピー']);
    pm.add(ma['レスアンカーをコピー']);
    pm.add(ma['レスのURLをコピー']);
    pm.add(ma['2ch荒らし報告形式でコピー']);
    pm.addSeparator();
    pm.add(ma['画像を直接保存']);
    pm.add(ma['フォルダに直接保存…']);
    pm.add(ma['画像を保存…']);
    pm.addSeparator();
    pm.add(ma['常に表示する']);
    pm.add(ma['非表示にする']);
    pm.add(ma['透明非表示にする']);
    pm.add(ma['非表示を解除']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('ローカルスレッド');
      ma00.add(ma['レスを追加（元レスURL付）…']);
      ma00.add(ma['レスを追加…']);
      ma00.addSeparator();
      ma00.add(ma['レスを削除…']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['チェックしたレスにレス']);
  }

  if (sn =='ResNum') {
    pm.removeAll();
    pm.add(ma['このレスにレス(R)']);
    pm.add(ma['このレスにレス [本文引用]']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('コピー');
      ma00.add(ma['このレスをコピー(C)']);
      ma00.add(ma['本文をコピー(M)']);
      ma00.add(ma['本文を引用してコピー(I)']);
      ma00.add(ma['このレスのURLをコピー']);
      ma00.add(ma['カスタムコピー…']);
      ma00.addSeparator();
      ma00.add(ma['datファイルの行をコピー']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['ラベル']);
    pm.add(ma['ラベルの付いたレスを抽出']);
    pm.addSeparator();
    pm.add(ma['付箋を貼る…']);
    pm.add(ma['付箋を貼ったレスを抽出']);
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('レスのチェック');
      ma10.add(ma['このレスをチェック(C)']);
      ma10.addSeparator();
      ma10.add(ma['ここからチェック']);
      ma10.add(ma['ここからクリア']);
      ma10.add(ma['全て反転']);
      ma10.add(ma['全てクリア']);
      pm.add(ma10);
    }
    pm.addSeparator();
    {
      var ma20 = new javax.swing.JMenu('ここから');
      ma20.add(ma['ここからテキスト選択(S)']);
      ma20.addSeparator();
      ma20.add(ma['画像をダウンロード(O)']);
      pm.add(ma20);
    }
    pm.addSeparator();
    pm.add(ma['被参照数ランキング…']);
    pm.addSeparator();
    {
      var ma30 = new javax.swing.JMenu('2ch荒らし報告');
      ma30.add(ma['2ch荒らし報告形式でコピー']);
      ma30.add(ma['Boo2008に報告する…']);
      pm.add(ma30);
    }
    pm.addSeparator();
    {
      var ma40 = new javax.swing.JMenu('ローカルスレッド');
      ma40.add(ma['このレスを追加（元レスURL付）…']);
      ma40.add(ma['このレスを追加…']);
      ma40.addSeparator();
      ma40.add(ma['本文を書き込み欄で置き換える…']);
      ma40.add(ma['最後のレスをこのレスの前に移動…']);
      ma40.addSeparator();
      ma40.add(ma['レスを削除']);
      pm.add(ma40);
    }
    pm.addSeparator();
    {
      var ma50 = new javax.swing.JMenu('設定');
      ma50.add(ma['このレスを常に表示(S)']);
      ma50.add(ma['このレスを非表示(H)']);
      ma50.add(ma['このレスを透明非表示(T)']);
      ma50.addSeparator();
      ma50.add(ma['しおりを挟む(B)']);
      ma50.addSeparator();
      ma50.add(ma['AAレス']);
      ma50.add(ma['非AAレス(P)']);
      ma50.addSeparator();
      ma50.add(ma['新着境界を設定(N)']);
      ma50.addSeparator();
      ma50.add(ma['被参照回数を表示']);
      ma50.add(ma['被参照回数によるハイライトの設定…']);
      pm.add(ma50);
    }
    pm.addSeparator();
    pm.add(ma['このレスの内容で新スレ(N)']);
  }

  if (sn =='ResPaneTab') {
    pm.removeAll();
    pm.add(ma['タブのスレ一覧']);
    pm.addSeparator();
    pm.add(ma['タブを閉じる(C)']);
    pm.add(ma['新着無しのタブを閉じる(N)']);
    pm.add(ma['dat落ちタブを閉じる']);
    pm.add(ma['終了したタブを閉じる']);
    pm.addSeparator();
    pm.add(ma['全てのタブを閉じる(A)']);
    pm.add(ma['他のタブを閉じる(O)']);
    pm.add(ma['これより前を閉じる(L)']);
    pm.add(ma['これより後を閉じる(R)']);
    pm.addSeparator();
    pm.add(ma['タブをロックする']);
    pm.add(ma['全てのタブをロックする']);
    pm.add(ma['全てのタブのロックを解除']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('設定');
      ma00.add(ma['未取得レス有タブの選択で更新']);
      ma00.add(ma['次回起動時タブ状態を復元']);
      ma00.addSeparator();
      ma00.add(ma['タイトルの設定…']);
      ma00.addSeparator();
      ma00.add(ma['タブの設定…']);
      ma00.add(ma['スレッド状態色の設定…']);
      pm.add(ma00);
    }
    {
      var ma10 = new javax.swing.JMenu('カラム設定');
      ma10.add(ma['デフォルトカラム追加']);
      ma10.add(ma['カラム追加…']);
      ma10.add(ma['カラム設定…']);
      ma10.addSeparator();
      ma10.add(ma['←']);
      ma10.add(ma['→']);
      ma10.addSeparator();
      ma10.add(ma['デフォルト設定…']);
      ma10.addSeparator();
      ma10.add(ma['左のカラムと統合']);
      ma10.add(ma['カラム削除…']);
      pm.add(ma10);
    }
  }

  if (sn =='SelText') {
    pm.removeAll();
    for (var i = 0; i < ma['外部コマンド'].length; i++) {
      pm.add(ma['外部コマンド'][i]);
    }
    pm.addSeparator();
    pm.add(ma['Webスレッド検索…']);
    pm.add(ma['Twitter検索']);
    {
      var ma00 = new javax.swing.JMenu('リンクとして開く');
      ma00.add(ma['UTF-8']);
      ma00.add(ma['Shift_JIS']);
      ma00.add(ma['EUC-JP']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['コピー(C)']);
    pm.add(ma['スレタイ・URLとコピー']);
    pm.addSeparator();
    pm.add(ma['レスの抽出(F)']);
    pm.add(ma['抽出ポップアップ']);
    {
      var ma10 = new javax.swing.JMenu('NG Word（本文）に追加');
      ma10.add(ma['スレッド(T)']);
      ma10.add(ma['板(I)']);
      ma10.add(ma['BBS']);
      ma10.add(ma['全体(A)']);
      ma10.addSeparator();
      ma10.add(ma['スレッド（ラベルも設定）']);
      ma10.add(ma['板（ラベルも設定）']);
      ma10.add(ma['BBS（ラベルも設定）']);
      ma10.add(ma['全体（ラベルも設定）']);
      pm.add(ma10);
    }
    {
      var ma20 = new javax.swing.JMenu('NG Word（本文）に追加（透明）');
      ma20.add(ma['スレッド(T)2']);
      ma20.add(ma['板(I)2']);
      ma20.add(ma['BBS2']);
      ma20.add(ma['全体(A)2']);
      ma20.addSeparator();
      ma20.add(ma['スレッド（ラベルも設定）2']);
      ma20.add(ma['板（ラベルも設定）2']);
      ma20.add(ma['BBS（ラベルも設定）2']);
      ma20.add(ma['全体（ラベルも設定）2']);
      pm.add(ma20);
    }
    pm.add(ma['キーワードに追加…']);
    {
      var ma30 = new javax.swing.JMenu('NGIDに追加');
      ma30.add(ma['非表示のIDに追加(H)']);
      ma30.add(ma['非表示のIDに追加（透明）']);
      pm.add(ma30);
    }
    pm.add(ma['短文に追加…']);
    pm.add(ma['選択部分にレス(R)']);
    pm.addSeparator();
    pm.add(ma['マーカーを引く(M)…']);
    pm.add(ma['マーカーを削除(D)']);
    pm.addSeparator();
    {
      var ma40 = new javax.swing.JMenu('NGFiles.txt');
      ma40.add(ma['NGFiles.txtに追加…']);
      ma40.add(ma['NGFiles.txtから削除…']);
      pm.add(ma40);
    }
    {
      var ma50 = new javax.swing.JMenu('選択範囲のリンク');
      ma50.add(ma['画像をダウンロード(O)']);
      ma50.add(ma['コピー(C)2']);
      ma50.add(ma['無効化(I)']);
      ma50.add(ma['NGファイルに追加…']);
      ma50.add(ma['履歴を削除(D)']);
      ma50.addSeparator();
        {
          var ma61 = new javax.swing.JMenu('状態変更');
          ma61.add(ma['モザイクをかける']);
          ma61.add(ma['モザイクを解除']);
          ma61.addSeparator();
          ma61.add(ma['キャッシュを保護']);
          ma61.add(ma['キャッシュ保護を解除']);
          ma50.add(ma61);
        }
      ma50.addSeparator();
      ma50.add(ma['画像を直接保存(S)']);
      ma50.add(ma['フォルダに直接保存…']);
      ma50.add(ma['画像を保存…']);
      ma50.addSeparator();
      ma50.add(ma['画像ビューアで開く(V)']);
      ma50.add(ma['サムネイル画像を表示(T)']);
      ma50.add(ma['サムネイル画像を消去(E)']);
      ma50.add(ma['サムネイル画像のキャッシュを削除']);
      ma50.addSeparator();
      ma50.add(ma['板・スレッドを開く']);
      ma50.addSeparator();
      for (var i = 0; i < ma['外部コマンド2'].length; i++) {
        ma50.add(ma['外部コマンド2'][i]);
      }
      pm.add(ma50);
    }
  }

  if (sn =='SelTextLink') {
    pm.removeAll();
    pm.add(ma['画像をダウンロード(O)']);
    pm.add(ma['コピー(C)']);
    pm.add(ma['無効化(I)']);
    pm.add(ma['NGファイルに追加…']);
    pm.add(ma['履歴を削除(D)']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('状態変更');
      ma00.add(ma['モザイクをかける']);
      ma00.add(ma['モザイクを解除']);
      ma00.addSeparator();
      ma00.add(ma['キャッシュを保護']);
      ma00.add(ma['キャッシュ保護を解除']);
      pm.add(ma00);
    }
    pm.addSeparator();
    pm.add(ma['画像を直接保存(S)']);
    pm.add(ma['フォルダに直接保存…']);
    pm.add(ma['画像を保存…']);
    pm.addSeparator();
    pm.add(ma['画像ビューアで開く(V)']);
    pm.add(ma['サムネイル画像を表示(T)']);
    pm.add(ma['サムネイル画像を消去(E)']);
    pm.add(ma['サムネイル画像のキャッシュを削除']);
    pm.addSeparator();
    pm.add(ma['板・スレッドを開く']);
    pm.addSeparator();
    for (var i = 0; i < ma['外部コマンド'].length; i++) {
      pm.add(ma['外部コマンド'][i]);
    }
  }

  if (sn =='TabbedPane') {
    pm.removeAll();
    pm.add(ma['タブを閉じる(C)']);
    pm.addSeparator();
    pm.add(ma['全てのタブを閉じる(A)']);
    pm.add(ma['他のタブを閉じる(O)']);
    pm.add(ma['これより前を閉じる(L)']);
    pm.add(ma['これより後を閉じる(R)']);
    pm.addSeparator();
    pm.add(ma['タブをロックする']);
    pm.add(ma['全てのタブをロックする']);
    pm.add(ma['全てのタブのロックを解除']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('設定');
      ma00.add(ma['次回起動時タブ状態を復元']);
      ma00.addSeparator();
      ma00.add(ma['タブの設定…']);
      pm.add(ma00);
    }
  }

  if (sn =='ThreadList') {
    pm.removeAll();
    pm.add(ma['開く(O)']);
    pm.add(ma['新しいタブで開く(T)']);
    pm.add(ma['外部ブラウザで開く(B)']);
    pm.addSeparator();
    pm.add(ma['お気に入りに登録(F)']);
    pm.add(ma['送る(S)…']);
    pm.add(ma['お気に入り登録の解除']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('コピー');
      ma00.add(ma['タイトルをコピー(T)']);
      ma00.add(ma['URLをコピー']);
      ma00.add(ma['タイトルとURLをコピー(B)']);
      ma00.add(ma['ログファイルのパスをコピー(P)']);
      ma00.add(ma['ログファイルをコピー(F)']);
      pm.add(ma00);
    }
    pm.add(ma['全てを選択(A)']);
    pm.addSeparator();
    pm.add(ma['ラベル（スレッド）']);
    pm.addSeparator();
    pm.add(ma['キーワードを含むスレッドを抽出']);
    pm.add(ma['選択スレッドを抽出']);
    pm.add(ma['ログのあるスレッドを抽出(L)']);
    pm.add(ma['dat落ちスレッドを表示']);
    pm.add(ma['dat落ちスレッドを隠す']);
    {
      var ma10 = new javax.swing.JMenu('強制過去ログ化');
      ma10.add(ma['過去ログ化']);
      ma10.add(ma['過去ログ化解除']);
      pm.add(ma10);
    }
    pm.add(ma['ログから検索（選択スレ）…']);
    pm.addSeparator();
    {
      var ma20 = new javax.swing.JMenu('同期再生');
      ma20.add(ma['リストに追加']);
      ma20.add(ma['リストを表示']);
      ma20.add(ma['リストをクリア']);
      pm.add(ma20);
    }
    pm.addSeparator();
    pm.add(ma['履歴から削除(R)']);
    {
      var ma30 = new javax.swing.JMenu('削除');
      ma30.add(ma['ログを削除(D)']);
      pm.add(ma30);
    }
    pm.addSeparator();
    {
      var ma40 = new javax.swing.JMenu('非表示');
      ma40.add(ma['非表示にする(H)']);
      ma40.add(ma['非表示を解除(S)']);
      ma40.addSeparator();
      ma40.add(ma['透明非表示(T)']);
      pm.add(ma40);
    }
    pm.addSeparator();
    {
      var ma50 = new javax.swing.JMenu('板メニュー');
      ma50.add(ma['新規スレッド(N)']);
      ma50.add(ma['板のプロパティ(P)…']);
      pm.add(ma50);
    }
    pm.add(ma['スレ一覧の設定…']);
    pm.add(ma['スレッドのプロパティ(P)…']);
  }

  if (sn =='ThreadListMiniSearch') {
    pm.removeAll();
    pm.add(ma['カット']);
    pm.add(ma['コピー']);
    pm.add(ma['ペースト']);
    pm.addSeparator();
    pm.add(ma['Webスレッド検索']);
    pm.addSeparator();
    pm.add(ma['Migemo']);
    pm.add(ma['正規表現']);
    pm.add(ma['大文字・小文字を区別']);
    pm.add(ma['AND絞り込み']);
    pm.add(ma['OR絞り込み']);
    pm.add(ma['リアルタイムで絞り込み']);
    pm.addSeparator();
    for (var i = 0; i < ma['検索履歴'].length; i++) {
      pm.add(ma['検索履歴'][i]);
    }
    pm.addSeparator();
    pm.add(ma['履歴に優先追加']);
    pm.add(ma['履歴から削除']);
    pm.add(ma['優先履歴以外を削除']);
    pm.addSeparator();
    pm.add(ma['サイズの設定…']);
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
      ma10.add(ma['外部ブラウザで開く(B)']);
      ma10.add(ma['このスレの板を開く']);
      ma10.add(ma['このスレの板を新しいタブで開く']);
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
      ma20.add(ma['タイトルをコピー(T)']);
      ma20.add(ma['URLをコピー']);
      ma20.add(ma['タイトルとURLをコピー(B)']);
      ma20.add(ma['全表示レスをコピー']);
      ma20.add(ma['ログファイルのパスをコピー(P)']);
      ma20.add(ma['ログファイルをコピー(F)']);
      ma20.addSeparator();
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
    pm.add(ma['リンクを含むレスを抽出(L)']);
    pm.add(ma['参照＆被参照レスを抽出']);
    pm.add(ma['マーカーを引いたレスを抽出(M)']);
    pm.add(ma['キーワードを含むレスを抽出(H)']);
    pm.add(ma['抽出ダイアログ…']);
    {
      var ma30 = new javax.swing.JMenu('全表示レス');
      ma30.add(ma['HTML形式で保存…']);
      ma30.addSeparator();
      ma30.add(ma['画像を直接保存(S)']);
      ma30.add(ma['フォルダに直接保存']);
      pm.add(ma30);
    }
    pm.addSeparator();
    for (var i = 0; i < ma['外部コマンド'].length; i++) {
      pm.add(ma['外部コマンド'][i]);
    }
    pm.addSeparator();
    {
      var ma40 = new javax.swing.JMenu('設定');
      ma40.add(ma['連鎖非表示［参照］(R)']);
      ma40.add(ma['連鎖非表示［ID］']);
      ma40.add(ma['透明非表示(T)']);
      ma40.add(ma['個別の透明設定を無視']);
      ma40.add(ma['ポップアップで透明レスを表示']);
      ma40.add(ma['前回非表示のレスを非表示(C)']);
      ma40.addSeparator();
      ma40.add(ma['レス表示の設定(P)…']);
      ma40.add(ma['背景画像(B)…']);
      ma40.add(ma['スレタイ変更（ローカルスレッド）…']);
      pm.add(ma40);
    }
    pm.addSeparator();
    pm.add(ma['スレッドのプロパティ(P)…']);
  }

  if (sn =='ThreadViewMiniSearch') {
    pm.removeAll();
    pm.add(ma['カット']);
    pm.add(ma['コピー']);
    pm.add(ma['ペースト']);
    pm.addSeparator();
    pm.add(ma['Twitter検索']);
    pm.addSeparator();
    pm.add(ma['Migemo']);
    pm.add(ma['正規表現']);
    pm.add(ma['大文字・小文字を区別']);
    pm.add(ma['AND絞り込み']);
    pm.add(ma['OR絞り込み']);
    pm.add(ma['リアルタイムで絞り込み']);
    pm.add(ma['本文のみ対象']);
    pm.addSeparator();
    for (var i = 0; i < ma['検索履歴'].length; i++) {
      pm.add(ma['検索履歴'][i]);
    }
    pm.addSeparator();
    pm.add(ma['履歴に優先追加']);
    pm.add(ma['履歴から削除']);
    pm.add(ma['優先履歴以外を削除']);
    pm.addSeparator();
    pm.add(ma['サイズの設定…']);
  }

  if (sn =='Thumbnail') {
    pm.removeAll();
    pm.add(ma['外部ブラウザで開く(B)']);
    {
      var ma00 = new javax.swing.JMenu('コピー');
      ma00.add(ma['リンクのコピー(C)']);
      ma00.add(ma['画像キャッシュのパスをコピー(P)']);
      pm.add(ma00);
    }
    pm.add(ma['このリンクを無効化(I)']);
    pm.add(ma['NGファイルに追加…']);
    pm.add(ma['リンク履歴の削除(D)']);
    pm.addSeparator();
    pm.add(ma['モザイク(M)']);
    pm.add(ma['キャッシュ保護(P)']);
    pm.addSeparator();
    pm.add(ma['画像を直接保存(S)']);
    pm.add(ma['フォルダに直接保存']);
    pm.add(ma['画像を保存…']);
    pm.addSeparator();
    pm.add(ma['アニメGIF制御パネル…']);
    pm.addSeparator();
    pm.add(ma['画像キャッシュ一覧(L)']);
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('設定');
      ma10.add(ma['画像保存フォルダの設定…']);
      ma10.add(ma['フォルダに直接保存の設定…']);
      pm.add(ma10);
    }
  }

  if (sn =='Time') {
    pm.removeAll();
    pm.add(ma['最終書き込み時刻に設定']);
    pm.add(ma['最終書き込み時刻をクリア']);
    pm.addSeparator();
    pm.add(ma['暦を西暦に固定']);
  }

  if (sn =='TwitterIcon') {
    pm.removeAll();
    pm.add(ma['原寸アイコンのダウンロード']);
    pm.addSeparator();
    pm.add(ma['アイコンのダウンロード']);
    pm.add(ma['ここからアイコンのダウンロード']);
    pm.addSeparator();
    pm.add(ma['アイコンの削除']);
  }

  if (sn =='TwitterPanel') {
    pm.removeAll();
    pm.add(ma['お気に入りに登録(F)']);
    pm.add(ma['フォルダに直接登録…']);
    pm.add(ma['お気に入り登録の解除']);
    pm.addSeparator();
    pm.add(ma['過去Tweet取得…']);
    {
      var ma00 = new javax.swing.JMenu('再取得・削除');
      ma00.add(ma['Tweetの再取得(G)']);
      ma00.add(ma['この次から再取得…']);
      ma00.add(ma['ログを削除(D)']);
      ma00.add(ma['ログを削除して閉じる(X)']);
      ma00.addSeparator();
      ma00.add(ma['仮想スレッドを削除する…']);
      pm.add(ma00);
    }
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('開く');
      ma10.add(ma['外部ブラウザで開く(B)']);
      ma10.add(ma['Twitter板を開く']);
      ma10.add(ma['Twitter板を新しいタブで開く']);
      ma10.addSeparator();
      ma10.add(ma['新しいタブを開く…']);
      ma10.add(ma['自分のUserTimeLineを開く']);
      ma10.add(ma['新規リスト作成…']);
      ma10.addSeparator();
      ma10.add(ma['ローカルトレンドを開く…']);
      ma10.addSeparator();
      ma10.add(ma['お気に入りタブを表示(F)']);
      ma10.addSeparator();
      ma10.add(ma['Twitterアイコン一覧']);
      ma10.addSeparator();
      ma10.add(ma['画像キャッシュ一覧(L)']);
      ma10.add(ma['画像表示ウィンドウ(W)']);
      pm.add(ma10);
    }
    {
      var ma20 = new javax.swing.JMenu('ユーザ名を指定して');
      ma20.add(ma['UserTimeLineを開く…']);
      ma20.addSeparator();
      ma20.add(ma['フォロー…']);
      ma20.addSeparator();
      ma20.add(ma['ユーザ情報…']);
      pm.add(ma20);
    }
    pm.addSeparator();
    pm.add(ma['振り分けボタンを表示']);
    pm.add(ma['振り分けボタンを隠す']);
    pm.addSeparator();
    pm.add(ma['送る']);
    pm.add(ma['全てを選択(A)']);
    pm.addSeparator();
    pm.add(ma['ラベル（スレッド）']);
    pm.addSeparator();
    pm.add(ma['オートスクロール［マウス］(S)']);
    pm.addSeparator();
    pm.add(ma['リンクを含むTweetを抽出(L)']);
    pm.add(ma['キーワードを含むTweetを抽出(H)']);
    pm.add(ma['表示されているユーザの一覧を開く…']);
    pm.addSeparator();
    {
      var ma30 = new javax.swing.JMenu('設定');
      ma30.add(ma['透明非表示(T)']);
      ma30.add(ma['個別の透明設定を無視']);
      ma30.add(ma['ポップアップで透明レスを表示']);
      ma30.addSeparator();
      ma30.add(ma['スレッドタイトル設定…']);
      ma30.add(ma['更新設定…']);
      ma30.add(ma['リスト変更…']);
      ma30.add(ma['Twitter検索設定…']);
      ma30.add(ma['UserTimeLine設定…']);
      ma30.addSeparator();
      ma30.add(ma['背景画像(B)…']);
      ma30.addSeparator();
      ma30.add(ma['Twitter設定…']);
      pm.add(ma30);
    }
    pm.add(ma['フォロー関係の情報を更新…']);
    pm.addSeparator();
    pm.add(ma['スレッドのプロパティ(P)…']);
  }

  if (sn =='TwitterUserName') {
    pm.removeAll();
    pm.add(ma['このユーザに返信']);
    pm.add(ma['このTweetに返信(R)']);
    pm.add(ma['このTweetを引用して投稿']);
    pm.add(ma['このTweetを引用して返信']);
    pm.add(ma['このユーザにDirectMessage']);
    pm.addSeparator();
    pm.add(ma['このTweetをリツイート…']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('コピー');
      ma00.add(ma['このユーザ名をコピー']);
      ma00.add(ma['この名前をコピー']);
      ma00.add(ma['このユーザのURLをコピー']);
      ma00.addSeparator();
      ma00.add(ma['このTweetをコピー']);
      ma00.add(ma['このTweetのURLをコピー']);
      ma00.add(ma['このTweetとURLをコピー']);
      ma00.addSeparator();
      ma00.add(ma['datファイルの行をコピー']);
      pm.add(ma00);
    }
    pm.addSeparator();
    {
      var ma10 = new javax.swing.JMenu('開く');
      ma10.add(ma['外部ブラウザでこのTweetを開く']);
      ma10.add(ma['このユーザを検索']);
      ma10.add(ma['UserTimeLineを開く']);
      ma10.add(ma['外部ブラウザでUserTimeLineを開く']);
      ma10.add(ma['外部ブラウザでふぁぼられを開く']);
      pm.add(ma10);
    }
    pm.addSeparator();
    pm.add(ma['お気に入りに追加']);
    pm.add(ma['お気に入りを解除']);
    pm.addSeparator();
    pm.add(ma['このユーザをフォロー…']);
    pm.add(ma['このユーザをアンフォロー…']);
    pm.addSeparator();
    pm.add(ma['このTweetを削除…']);
    pm.addSeparator();
    pm.add(ma['振り分けボタンで選択…']);
    pm.add(ma['振り分けボタンで選択解除…']);
    {
      var ma20 = new javax.swing.JMenu('NGユーザに追加');
      ma20.add(ma['TimeLine']);
      ma20.add(ma['Twitter']);
      ma20.addSeparator();
      ma20.add(ma['TimeLine（30分）']);
      ma20.add(ma['TimeLine（1時間）']);
      ma20.add(ma['TimeLine（2時間）']);
      ma20.addSeparator();
      ma20.add(ma['TimeLine（30分透明）']);
      ma20.add(ma['TimeLine（1時間透明）']);
      ma20.add(ma['TimeLine（2時間透明）']);
      ma20.addSeparator();
      ma20.add(ma['Twitter（30分）']);
      ma20.add(ma['Twitter（1時間）']);
      ma20.add(ma['Twitter（2時間）']);
      ma20.addSeparator();
      ma20.add(ma['Twitter（30分透明）']);
      ma20.add(ma['Twitter（1時間透明）']);
      ma20.add(ma['Twitter（2時間透明）']);
      pm.add(ma20);
    }
    pm.addSeparator();
    pm.add(ma['ユーザ情報…']);
    pm.add(ma['ユーザ設定…']);
    {
      var ma30 = new javax.swing.JMenu('リツイート表示・ブロック・スパム報告');
      ma30.add(ma['このユーザのリツイートを非表示']);
      ma30.add(ma['このユーザのリツイート非表示を解除']);
      ma30.addSeparator();
      ma30.add(ma['このユーザをブロック']);
      ma30.add(ma['このユーザのブロックを解除']);
      ma30.addSeparator();
      ma30.add(ma['このユーザをスパム報告']);
      pm.add(ma30);
    }
    pm.addSeparator();
    pm.add(ma['名前・ID・BEの出現回数…']);
  }

  if (sn =='WriteMessage') {
    pm.removeAll();
    pm.add(ma['Undo']);
    pm.add(ma['Redo']);
    pm.addSeparator();
    pm.add(ma['カット(T)']);
    pm.add(ma['コピー(C)']);
    pm.add(ma['ペースト(P)']);
    pm.add(ma['削除(D)']);
    pm.addSeparator();
    pm.add(ma['全てを選択(A)']);
    pm.addSeparator();
    pm.add(ma['短文の挿入…']);
    pm.add(ma['バグ報告用テンプレ(B)']);
    pm.addSeparator();
    pm.add(ma['余分な空白と改行を削除(E)']);
    pm.add(ma['変換不能文字→参照(G)']);
    pm.add(ma['行頭のタブと空白を"&nbsp;"に変換']);
    pm.add(ma['URLを短縮']);
    pm.addSeparator();
    pm.add(ma['ローカルルールの表示(R)…']);
    pm.add(ma['SETTING.TXTの表示…']);
    pm.add(ma['投稿規約の表示(S)…']);
    pm.addSeparator();
    {
      var ma00 = new javax.swing.JMenu('設定');
      ma00.add(ma['現在の高さをデフォルトに設定']);
      ma00.addSeparator();
      ma00.add(ma['自動ラベル付けの設定…']);
      ma00.add(ma['Samba24時間の設定…']);
      pm.add(ma00);
    }
  }

  //メニュー編集コード(ここまで)
}