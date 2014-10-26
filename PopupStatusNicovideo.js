//【登録場所】 リンク（レス表示,選択テキストだと最初のリンク）、URLExec.dat（T20100813以降）
//【ラベル】 ニコニコ動画のステータスを表示
//【コマンド】　${SCRIPT:SFrx} PopupStatusNicovideo.js
//    URLExec.datの場合は　${V2CSCRIPT:SFrx} PopupStatusNicovideo.js
//【内容】 ニコニコ動画のステータスをポップアップする
//【スクリプト】 "PopupStatusNicovideo.js"と"PopupStatusNicovideo"フォルダをV2C保存用フォルダのscriptフォルダに入れる
//
//設定
var closeOnLinkClicked = true;//外部リンクをクリックした場合、ポップアップを閉じる
var closeOnMouseExit = true;//ポップアップ上から離れた場合、ポップアップを閉じる
var browseExt = false;//外部ブラウザで開く（falseだとJDICがあれば内部ブラウザで開く）
var maxPopupWidth = 429;//ポップアップの最大横サイズ[px]、本来のhtmlサイズ調整用(0で調整なし、この場合、右に余分なスペース有)
var addLinkNicoDic = false;//タグの後に、ニコニコ大百科のリンクを付加 ※ポップアップまでに時間がかかる場合があります（この場合、ステータスバーに「取得中...」が表示）
var urlExec = true;// リンククリック時、URLExec.datの設定に従うかどうか
var browserPath = false;//URLEcex.datの設定に従うときに使用する規定のブラウザのパス(「\」は「/」に置換してください)

//実行
var vcx = v2c.context;
var nvstream = '';
GetStatus();

function redirectURL(u) {
	if (u) {
		if(!(urlExec && openURLExec(u)))
			browseExt ? v2c.browseURLExt(u) : v2c.browseURL(u);
		if(!closeOnLinkClicked){
			vcx.setPopupHTML(nvstream);
			if(closeOnMouseExit) vcx.setCloseOnMouseExit(true);
			if(maxPopupWidth) vcx.setMaxPopupWidth(maxPopupWidth);
			vcx.setRedirectURL(true);
		}
	}
	return;
}
function replaceStr(str,nl){
/*
 * Available HTML tags. -> <font ( color,size ) > , <br> , <b> , <i> , <s> , <u>
 * These letters must be in HTML Form. -> & = &amp; , " = &quot; , < = &lt; , > = &gt; , ' = &#039;
 */
	str = str
		// タグとしての'<'は"&lt;"、文字としては"&amp;lt;"となっている。
		// <br>が連続している場合は1つにする。
		.replace(/(?:&lt;br(?:\s*\/)&gt;)+/ig, "<br/>")
		// <(font|b|i|s|u)>は無視してテキストだけ取り出す。
		// それ以外のタグはニコニコ側ではサポートされていないため、タグのつもりではない(生文字列)と判断。
		.replace(/&lt;((?:font|b|i|s|u))(\s+.*?)&gt;(.*?)&lt;\/\1&gt;/ig,
			function(str, tag, attributes, value) {
				return value;
			})
		.replace(/&amp;/ig, "&")
		.replace(/&apos;/ig, "&#039;"); // &apos;はpopup時に解釈してくれないので置換
		
	if(nl) {
		str = str.replace(/((?:mylist|user)\/\d+)/ig, '<a href="http://www.nicovideo.jp/$1">$1</a>');
		str = str.replace(/([sn]{1}m\d+)/ig, '<a href="http://www.nicovideo.jp/watch/$1">$1</a>');
	}
	return str;
}
function replaceNum(num){
	return num = num.replace(/(\d)(?=(\d{3})+(?!\d))/g,"$1,");
}
// 正規表現を用いない replaceAll()
function replaceAll(s, oldValue, newValue) {
	return (s + '').split(oldValue).join(newValue);
}
function GetStatus(){
	//選択文字列のチェック
	var ss = (v2c.getSelectedText() || vcx.link || vcx.res.message)+"";
	if(ss){
		ss = ss.replace(/^\s+|\s+$/g, "");
	}
	if(!ss||(ss.length==0)){
		v2c.alert('テキスト取得失敗');
		return;
	}

	//選択文字列からIDを抽出
	//”sm”などを含む以降の数値をIDとする
	var rgex = new RegExp('(?:\\?|/|#|)((?:[a-z]{2})\\d+)');
	//var rgex = new RegExp('(?:(?:www|tw|es|de|m)\\.nicovideo.jp/watch|nico.ms)/(\\w{2}\\d+)');
	var video_id = (ss.match(rgex) || [])[1];
	if(!video_id){
		v2c.alert('ID取得失敗');
		return;
	}
	
	var prefixIdPattern = {
		supported: /^(?:ax|c[adw]|c[dw]|f[xz]|ig|n[alm]|om|s[dkm]|y[ko]|z[a-e]|so)\d+/,
		unsupported: /^(?:lv|im|co|ar|mg|bk|nw)\d+/
	};
	if(0 <= video_id.search(prefixIdPattern.unsupported)) {
		v2c.println('動画ではないか、既知のサポートされていないIDです。 ' + video_id);
		return;
	}
	else if(video_id.search(prefixIdPattern.supported) < 0) {
		v2c.println('未知のIDです。取得を試みます。 ' + video_id);
	}

	if (vcx.getPopupOfID(video_id)) {
		vcx.closeOriginalPanel();
		return;
	}
	var url = 'http://ext.nicovideo.jp/api/getthumbinfo/' + video_id;
	v2c.setStatus('動画情報、取得中...');
	var source = readURL(url);
	v2c.setStatus('');
	if (!source) {
		v2c.alert('ページを取得できませんでした。');
		return;
	} else if (source.indexOf('nicovideo_thumb_response status="fail"') > -1){
		if(source.indexOf('<code>DELETED</code>') > -1) {
			v2c.alert('この動画は削除されました。');
		} else {
			v2c.alert('動画を取得できませんでした。');
		}
		return;
	}
	//ステータスの変数宣言
	var title = " - ";
	var description = " - ";
	var all_description = " - ";
	var thumbnail_url = " - ";
	var first_retrieve = " - ";
	var length = " - ";
	var movie_type = " - ";
	var size_high = " - ";
	var kB_size_high = " - ";
	var MB_size_high = " - ";
	var size_low = " - ";
	var kB_size_low= " - ";
	var MB_size_low= " - ";
	var view_counter = " - ";
	var comment_num = " - ";
	var mulist_counter = " - ";
	var last_res_body = " - ";
	var watch_url = " - ";
	var thumb_type = " - ";
	var embeddable = "ー";
	var live_play = "ー";
	var jp_category_tag = "";
	var jp_lock_tag = "";
	var jp_free_tag = "";
	var jp_tag = "";
	var tw_tag = "";
	var de_tag = "";
	var es_tag = "";
	var user_id = "";

	//タイトル取得
	if(source.match(/title>(.+?)<\/title>/i)){
		title = replaceStr(RegExp.$1);
	}
	//説明取得
	if(source.match(/description>(.+?)<\/description>/i)){
		var rawDescription = RegExp.$1;
		description = replaceStr(rawDescription);
		all_description = replaceStr(rawDescription,true);
		if (description.length > 100) description = description.substring(0, 100)+'..';
	}
	//サムネイルのURL取得
	if(source.match(/thumbnail_url>(.+?)<\/thumbnail_url>/i)){
		thumbnail_url = RegExp.$1;
	}
	//投稿時間取得
	if(source.match(/first_retrieve>(.+?)<\/first_retrieve>/i)){
		var d= (RegExp.$1).match(/\d{2}/g);
		first_retrieve = d[1]+'/'+d[2]+'/'+d[3]+' '+d[4]+':'+d[5];
	}
	//再生時間取得
	if(source.match(/length>(.+?)<\/length>/i)){
		length = RegExp.$1;
	}
	//形式取得
	if(source.match(/movie_type>(.+?)<\/movie_type>/i)){
		movie_type = RegExp.$1;
	}
	//サイズ（高画質）取得
	if(source.match(/size_high>(.+?)<\/size_high>/i)){
		size_high = RegExp.$1;
		kB_size_high = (parseInt(size_high)/1024).toFixed(1);
		MB_size_high = (parseInt(kB_size_high)/1024).toFixed(2);
	}
	//サイズ（低画質）取得
	if(source.match(/size_low>(.+?)<\/size_low>/i)){
		size_low = RegExp.$1;
		kB_size_low = (parseInt(size_low)/1024).toFixed(1);
		MB_size_low = (parseInt(kB_size_low)/1024).toFixed(2);
	}
	//再生数取得
	if(source.match(/view_counter>(.+?)<\/view_counter>/i)){
		view_counter = replaceNum(RegExp.$1);
	}
	//コメント数取得
	if(source.match(/comment_num>(.+?)<\/comment_num>/i)){
		comment_num = replaceNum(RegExp.$1);
	}
	//マイリスト数取得
	if(source.match(/mylist_counter>(.+?)<\/mylist_counter>/i)){
		mylist_counter = replaceNum(RegExp.$1);
	}
	//最近のコメント取得
	if(source.match(/last_res_body>(.+?)<\/last_res_body>/i)){
		last_res_body = replaceStr(RegExp.$1);
	}
	//動画のURL取得
	if(source.match(/watch_url>(.+?)<\/watch_url>/i)){
		watch_url = RegExp.$1;
	}
	//通常かマイメモリか取得
	if(source.match(/thumb_type>(.+?)<\/thumb_type>/i)){
		thumb_type = RegExp.$1;
	}
	//外部からの埋め込み再生可否取得
	if(source.match(/embeddable>(.+?)<\/embeddable>/i)){
		embeddable = RegExp.$1 == "1" ? "○" : "×";
	}
	//生放送の引用可否取得
	if(source.match(/live_play>(.+?)<\/no_live_play>/i)){
		live_play = RegExp.$1 == "1" ? "×" : "○";
	}
	//日本タグ取得
	rgex = new RegExp('<tag.*?>([^><]+)','ig');
	rgex.lastIndex = source.indexOf('<tags domain="jp">')+1;
	var readDicApi = function( kw ) {
			v2c.setStatus('タグの大百科有無、取得中...');
			var dic = kw ? readURL('http://api.nicodic.jp/e/n/' + kw) + '' : '';
			v2c.setStatus('');
			if(dic && dic.indexOf('1') > 0) {
				return '&nbsp;' + '<a href="http://dic.nicovideo.jp/a/' + kw
				+ '" class="dic_on">百</a>' + '　';
//				+ '"><img src="http://res.nimg.jp/img/common/icon/dic_on.png" alt="大百科" border="0"></a>' + '　'; //↑行と置換でアイコン表示、ただポップサイズが崩れる
			} else {
				return '&nbsp;' + '<a href="http://dic.nicovideo.jp/a/' + kw
				+ '" class="dic_off">？</a>' + '　';
//				+ '"><img src="http://res.nimg.jp/img/common/icon/dic_off.png" alt="大百科" border="0"></a>' + '　'; //↑行と置換でアイコン表示、ただポップサイズが崩れる
			}
		}
	var keyword = '';
	while(rgex.exec(source) != null){
		if(RegExp.lastMatch.indexOf('category') > -1) {
			keyword = encodeURIComponent(RegExp.lastParen);
			jp_category_tag += '<a href = "http://www.nicovideo.jp/tag/' 
			+ keyword + '" class="category_tag">' + RegExp.lastParen + '</a>';
			jp_category_tag += addLinkNicoDic ? readDicApi( keyword ) : '　';
		} else if(RegExp.lastMatch.indexOf('lock') > -1) {
			keyword = encodeURIComponent(RegExp.lastParen);
			jp_lock_tag += '<a href = "http://www.nicovideo.jp/tag/' 
			+ keyword + '" class="lock_tag">' + RegExp.lastParen + '</a>';
			jp_lock_tag += addLinkNicoDic ? readDicApi( keyword ) : '　';
		} else {
			keyword = encodeURIComponent(RegExp.lastParen);
			jp_free_tag += '<a href = "http://www.nicovideo.jp/tag/' 
			+ keyword + '" class="free_tag">' + RegExp.lastParen + '</a>';
			jp_free_tag += addLinkNicoDic ? readDicApi( keyword ) : '　';
		}
		if(RegExp.rightContext.search(/^<\/tag>\n<\/tags>/i) == 0) break;
	}
	if(jp_category_tag == "") jp_category_tag = replaceStr(jp_category_tag);
	if(jp_lock_tag == "") jp_lock_tag = replaceStr(jp_lock_tag);
	if(jp_free_tag == "") jp_free_tag = replaceStr(jp_free_tag);
	jp_tag = jp_category_tag + jp_lock_tag + jp_free_tag;
	//台湾タグ取得
	rgex = new RegExp('<tag.*?>([^><]+)','ig');
	rgex.lastIndex = source.indexOf('<tags domain="tw">')+1;
	while(rgex.exec(source) != null){
		tw_tag += '<a href = "http://tw.nicovideo.jp/tag/' 
				+ encodeURIComponent(RegExp.lastParen) + '">' + RegExp.lastParen + '</a>';
		if(RegExp.rightContext.search(/^<\/tag>\n<\/tags>/i) == 0) break;
		tw_tag += "&nbsp;";
	}
	//ドイツタグ取得
	rgex = new RegExp('<tag.*?>([^><]+)','ig');
	rgex.lastIndex = source.indexOf('<tags domain="de">')+1;
	while(rgex.exec(source) != null){
		de_tag += '<a href = "http://de.nicovideo.jp/tag/' 
					+ encodeURIComponent(RegExp.lastParen) + '">' + RegExp.lastParen + '</a>';
		if(RegExp.rightContext.search(/^<\/tag>\n<\/tags>/i) == 0) break;
		de_tag += "&nbsp;";
	}
	de_tag = replaceStr(de_tag);
	//スペインタグ取得
	rgex = new RegExp('<tag.*?>([^><]+)','ig');
	rgex.lastIndex = source.indexOf('<tags domain="es">')+1;
	while(rgex.exec(source) != null){
		es_tag += '<a href = "http://es.nicovideo.jp/tag/' 
					+ encodeURIComponent(RegExp.lastParen) + '">' + RegExp.lastParen + '</a>';
		if(RegExp.rightContext.search(/^<\/tag>\n<\/tags>/i) == 0) break;
		es_tag += "&nbsp;";
	}
	es_tag = replaceStr(es_tag);
	//ユーザーID取得
	if(source.match(/user_id>(.+?)<\/user_id>/i)){
		user_id = RegExp.$1;
	}

	//htmlテンプレートの読み込み
	var fs = java.io.File.separator;
	nvstream = v2c.readFile(v2c.saveDir
								+fs+fs+'script'+fs+fs+'PopupStatusNicovideo'+fs+fs+'template.txt');

	//パラメータの置換
	nvstream = replaceAll(nvstream,"%video_id%",video_id);
	nvstream = replaceAll(nvstream,"%title%",title);
	nvstream = replaceAll(nvstream,"%description%",description);
	nvstream = replaceAll(nvstream,"%all_description%",all_description);
	nvstream = replaceAll(nvstream,"%thumbnail_url%",thumbnail_url);
	nvstream = replaceAll(nvstream,"%first_retrieve%",first_retrieve);
	nvstream = replaceAll(nvstream,"%length%",length);
	nvstream = replaceAll(nvstream,"%movie_type%",movie_type);
	nvstream = replaceAll(nvstream,"%size_high%",size_high);
	nvstream = replaceAll(nvstream,"%kB_size_high%",kB_size_high);
	nvstream = replaceAll(nvstream,"%MB_size_high%",MB_size_high);
	nvstream = replaceAll(nvstream,"%size_low%",size_low);
	nvstream = replaceAll(nvstream,"%kB_size_low%",kB_size_low);
	nvstream = replaceAll(nvstream,"%MB_size_low%",MB_size_low);
	nvstream = replaceAll(nvstream,"%view_counter%",view_counter);
	nvstream = replaceAll(nvstream,"%comment_num%",comment_num);
	nvstream = replaceAll(nvstream,"%mylist_counter%",mylist_counter);
	nvstream = replaceAll(nvstream,"%movie_type%",movie_type);
	nvstream = replaceAll(nvstream,"%last_res_body%",last_res_body);
	nvstream = replaceAll(nvstream,"%watch_url%",watch_url);
	nvstream = replaceAll(nvstream,"%thumb_type%",thumb_type);
	nvstream = replaceAll(nvstream,"%embeddable%",embeddable);
	nvstream = replaceAll(nvstream,"%live_play%",live_play);
	nvstream = replaceAll(nvstream,"%jp_category_tag%",jp_category_tag);
	nvstream = replaceAll(nvstream,"%jp_lock_tag%",jp_lock_tag);
	nvstream = replaceAll(nvstream,"%jp_free_tag%",jp_free_tag);
	nvstream = replaceAll(nvstream,"%jp_tag%",jp_tag);
	nvstream = replaceAll(nvstream,"%tw_tag%",tw_tag);
	nvstream = replaceAll(nvstream,"%de_tag%",de_tag);
	nvstream = replaceAll(nvstream,"%es_tag%",es_tag);
	nvstream = replaceAll(nvstream,"%user_id%",user_id);

	//ポップアップ表示
	vcx.setPopupHTML(nvstream);
	if(closeOnMouseExit) vcx.setCloseOnMouseExit(true);
	if(maxPopupWidth) vcx.setMaxPopupWidth(maxPopupWidth);
	vcx.setRedirectURL(true);
	vcx.setPopupID(video_id);
	return;
}

function openURLExec( url ) {
	var url = new java.lang.String( url );
	var fs = java.io.File.separator;
	var tmp = v2c.readFile( v2c.saveDir + fs + 'URLExec.dat', 'Shift-JIS' );
	if ( !tmp ) {
		v2c.println( 'URLExec.datが見つかりませんでした' );
		return false;
	}
	var lines = tmp.split( '\r\n' );
	var ptn = java.util.regex.Pattern.compile("^(?<!;|'|//)([^\t]+\t){2}[^\t]+$");
	for( var i=0,len=lines.length; i<len; i++ ) {
		var matcher = ptn.matcher(lines[i]);
		if ( matcher.matches() ) {
			//v2c.println( '有効行：' + matcher.group(0) );
		} else {
			//v2c.println( '！無効行：' + lines[i] );
			continue;
		}
		
		var matchFlg = false;
		var item = lines[i].split( '\t' );
		if ( item.length != 3 ) { // 念のため
			v2c.println( 'Tabの数が不正：' + (item.length-1) );
			continue;
		}
		item[1] = (new java.lang.String(item[1])).replaceAll( '\\$&', '\\$0' );
		
		try {
			var ptn2 = java.util.regex.Pattern.compile(item[0]);
		} catch( e ) { // 不正な正規表現を無視
			v2c.println( e );
			continue;
		}
		if ( ptn2.matcher(url).find() ) {
				matchFlg = true;
				url = url.replaceFirst( item[0], item[1] );
				break;
		}
	}
	if ( !matchFlg ) {
		v2c.println( 'URLExec.dat：マッチなし\n' + url );
		return false;
	}

	var cmds = item[2].split( ' ' );
	if ( cmds.length == 0 ) {
		v2c.println( 'URLExec.dat：コマンドがありません' );
		return false;
	}
	for ( i=0; i<cmds.length; i++ ) {
		var matcher = java.util.regex.Pattern.compile('\\$VIEW').matcher(cmds[i]);
		if ( matcher.find() ) {
			if ( i==0 ){
				v2c.println( 'URLExec.dat：無効なキーワード"$VEIW"' );
				return false;
			}
		}
		
		// $BROWSER
		if ( browserPath ) {
			cmds[i] = cmds[i].replaceAll( '\\$BROWSER', browserPath );
		} else {
			// ブラウザを指定していない場合で、更にURLExec.datのコマンドが、
			// ブラウザにURLを渡すだけの場合はデフォルト外部ブラウザで開く(応急処置)
			if( item[2].matches( '"?\\$BROWSER"? "?\\$(URL|LINK)"?' ) ) { //完全一致
				v2c.browseURLDefExt(url);
				v2c.println( 'cmd='+item[2] );
				return true;
			}
		}
		
		// $LINK 置換しない場合は、この下の行をコメントアウト
		cmds[i] = cmds[i].replaceAll( '\\$LINK', url );
		
		// $URL 置換しない場合は、この下行をコメントアウト
		cmds[i] = cmds[i].replaceAll( '\\$URL', url );
		
		// $BASEPATH
		if ( i==0 ) {  // コマンドの場合
			cmds[i] = cmds[i].replaceAll( '\\$BASEPATH', v2c.saveDir.toString()
				.replaceAll( '\\\\', '/' ) + '/' );
		} else { // 引数の場合
			cmds[i] = cmds[i].replaceAll( '\\$BASEPATH', v2c.saveDir.toString()
				.replaceAll( '\\\\', '\\\\\\\\' ) + '\\\\' );
		}
		
		// $POSX $POSY
		var p = v2c.context.mousePos;
		if ( p ) {
			cmds[i] = cmds[i].replaceAll( '\\$POSX', p.x );
			cmds[i] = cmds[i].replaceAll( '\\$POSY', p.y );
		}
		v2c.println( 'cmd['+i+']='+cmds[i] );
	}

	v2c.exec(cmds);
	return true;
}
function readURL(url) {
	var req = v2c.createHttpRequest(url);
	var res = req.getContentsAsString();
	if(req.responseCode != 200) {
		return null;
	}
	return res;
}