//【登録場所】 全体、レス表示、選択テキスト
//【ラベル】 新しいスタイルを作成
//【内容】 レス表示スタイルの「出発点」の形式で、指定したフォルダ名で登録
//【コマンド】 ${SCRIPT:Fwr} newStyle.js
//【スクリプト】
// ----- 次の行から -----
//設定
var defaultName = 'NEW_STYLE'; //フォルダ名ダイアログのデフォルト名。
var setResCheckBox = false; //レス番の左にチェックボックスを置く。
var setStyleName = false; //スタイル名の登録ダイアログ表示
var openFolder = false; //実行後、フォルダを開く
var openFile = false; //実行後、style.txtを開く
var filer_dir = '"C:\\Windows\\explorer.exe"'; //ファイル管理ソフトディレクトリ
var editor_dir = '"C:\\Windows\\notepad.exe"' //テキスト編集ソフトディレクトリ
//設定ここまで
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
}
function getStyle() {
    var fn = v2c.prompt('フォルダ名を入力\n※拡張子なし、半角英数字かアンダースコア', defaultName);
    if ( !fn.match( /^[a-zA-Z0-9_]+$/ ) ) {
        v2c.alert( '無効な名前です。' );
        return;
    }
    var ss = v2c.context.selText;
    if ( !ss||(ss.length==0) ) {
        var sh = v2c.readURL( 'h'+'ttp://v2c.s50.xrea.com/manual/resstyle.html' );
        if ( !sh ) {
            v2c.alert( 'ページを取得できませんでした。' );
            return;
        }
        if ( !sh.match( new RegExp( '<h3><u>出発点</u></h3>[^]+?<pre>([^]*?)</pre>', 'i' ) ) ) {
            v2c.alert( '抽出できませんでした。' );
            return;
        }
        ss = RegExp.$1.trim();
    }
    ss = ss + '';
    var fs = java.io.File.separator;
    var fd = v2c.saveDir + fs + 'style' + fs + fn + fs;
    var txt = fd+'style.txt';
    var cecd = 'utf-8';
    if ( v2c.readFile(txt) ) {
        if ( !v2c.confirm('既に同じスタイルが存在します。上書きしますか？') ) return;
    }
    if ( setStyleName ) {
        var sn = v2c.prompt('スタイル名を入力\n', fn);
        ss = '<PROPERTY>\nName=' + sn + '\n</PROPERTY>\n\n' + ss;
    }
    ss = ss.replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
    if ( setResCheckBox ) {
        ss = ss.replace(/(<NUMBER>)/gi,'<RESCHECKBOX>$1');
    }
    var as = ss.split('\n');
    v2c.writeLinesToFile(txt,as,cecd);
    if ( openFolder ) v2c.exec( filer_dir + ' "' + fd + '"' );
    if ( openFile ) v2c.exec( editor_dir + ' "' + txt + '"' );
}
getStyle();
// ----- 前の行まで -----

