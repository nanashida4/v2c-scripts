//【登録場所】"V2C\script\system\menu.js"
//【内容】menu.jsのまとめ
//【備考】以下の行頭のコメント「//」を、利用する行ごとに削除することで、有効になります。
//        V2Cメニュー 「設定」→「外部コマンド」→「スクリプト」→「menu.js」のパーミッション欄を「Frw」に変更して下さい
//【更新日】2013/02/03
function popupMenuCreated(pm,sn)
{
    var submenujsDir = v2c.saveDir + '/script/';

    /*【このレスにレスが一番上の項目にある右クリメニュー】*/
    if (sn == 'ResNum') {
        /*説明行 [n|aサンプル 同封済み]  レス番号ポップアップメニューの「設定」の最初のセパレータまでの項目を展開する */
//      eval(String(v2c.readStringFromFile(new java.io.File(submenujsDir + 'Default_menu.js')))).registerExpandSettingMenu(pm, sn);
    }
    /*【レス画面での右クリメニュー】*/
    if (sn == 'ThreadPanel') {
        /*説明行 [n|aサンプル 同封済み] レス表示ポップアップメニューの抽出系の項目を下位メニューにまとめる */
//      eval(String(v2c.readStringFromFile(new java.io.File(submenujsDir + 'Default_menu.js')))).registerCollapseFilterItems(pm, sn);
        /*説明行 [n|aサンプル 同封済み] レス表示ポップアップメニューから「マーカーを引いたレスを抽出」を削除する */
//      eval(String(v2c.readStringFromFile(new java.io.File(submenujsDir + 'Default_menu.js')))).registerRemoveMarkedResFilterItem(pm, sn);
        /* [LockedAutoReloadController.js 同封済み] オートリロードに設定したスレッドのタブをタブロックにする */
//      eval(String(v2c.readStringFromFile(new java.io.File(submenujsDir + 'LockedAutoReloadController_menu.js')))).register(pm, sn);
    }
    /*【書込み欄本文及び本文テキスト範囲選択上での右クリメニュー】*/
    if (sn == 'WriteMessage' || sn == 'WPSelText') {
        /*説明行 [tablemaker.jsが別途必要] 範囲指定の文字列を表形式に変換する */
//      eval(String(v2c.readStringFromFile(new java.io.File(submenujsDir + 'tablemaker_menu.js')))).register(pm, sn);
    }
}