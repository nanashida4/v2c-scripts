//【登録場所】 全体、レス表示
//【ラベル】 スクリプトファイル一覧
//【内容】 スクリプト保存フォルダ内の一覧、詳細内容を表示して、ファイル（ラベル）名をクリックするとエディタで開きます。
//※フォルダ管理ソフトと、テキスト編集ソフトのディレクトリ（15-16行目）は各自で設定しないと動かない場合があります。
//【コマンド1】 ${SCRIPT:F} opjsf.js   //簡易ポップアップ
//【コマンド2】 ${SCRIPT:F} opjsf.js 1 //詳細新規タブ
//※右端のリンクをクリックするとスクリプトファイル内１行目から行頭の「//」が途切れるか「//【スクリプト】」までをポップアップ表示します。
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var option = vcx.args[0];
var detail_text; //詳細テキストArray
var script_folder = new java.io.File( v2c.saveDir, 'script' ); //スクリプト保存フォルダ
var filer_dir = '"C:\\Windows\\explorer"'; //ファイル管理ソフトディレクトリ
//var editor_dir = '"C:\\Windows\\notepad.exe"' //テキスト編集ソフトディレクトリ
var editor_dir = '"C:\\Program Files\\EmEditor\\EmEditor.exe" /cp 65001' //EmEditor用
//var editor_dir = '"C:\\Program Files\\sakura\\sakura.exe" "-CODE=4"' //サクラエディタ用
//var editor_dir = '"C:\\Windows\\notepad.exe"' //notepad用
vcx.setDefaultCloseOnMouseExit(true); //ポップアップ上から離れた場合、ポップアップを閉じる

function redirectURL( u ) {
	var sr = u.toString();
	if( sr == 'file:new' ) {
		var fn = v2c.prompt( '新規ファイル名を入力　※拡張子( .js )抜き', '' );
		if( fn == '' ) {
			v2c.alert( 'ファイル名を入力してください。' );
			redirectURL( u );
			return;
		} else if( fn == null ) {
			return;
		} else {
			var nf = new java.io.File( script_folder, fn + '.js' );
			sr = script_folder +'\\' + fn + '.js';
			nf.createNewFile();
		}
	} else if ( sr == 'file:folder' ) {
		v2c.exec( filer_dir + ' "' + script_folder + '"' );
		return;
	} else if ( sr == 'file:reload' ) {
		createPopupString( false );
		return;
	} else if ( sr.search( /file:detail(\d+)/ ) > -1) {
		var id = RegExp.lastParen;
		if( vcx.getPopupOfID( id ) ) {
			return;
		}
		vcx.setPopupText( detail_text[id] );
		vcx.setPopupFocusable( true );
		vcx.setRedirectURL( true );
		vcx.setPopupID( id );
		return;
	} else {
		sr = sr.substring(5);
	}
	if( sr ) v2c.exec( editor_dir + ' "' + sr + '"' );
	return;
}
function createPopupString( newtab ) {
	var al = [], tmp = '';
	var dl = script_folder.list();
	detail_text = [];
	al[0] = '<a href = "file:new">&#9654;新規作成</a>　'
			+ '<a href = "file:folder">&#9654;フォルダを開く</a>　　　　　　'
			+ '<a href = "file:reload">&#9654;再読み込み</a><br><br>'
			+ '<table><tr bgcolor = #dddddd>'
			+ '<th width = 3%>No.</th>'
			+ '<th width = 40%>ラベル</th>'
			+ '<th width = 14%>登録場所</th>'
			+ '<th width = 40%>コマンド</th>'
			+ '<th width = 3%>詳細</th></tr>';
	for ( var i = 0, k = 0; i < dl.length; i++ ) {
		if( option ) {
			if( dl[i].match( /.+\.js$/i ) ) {
				var tx = [], tmp = '';
				if ( k%2 > 0 ) {
					tmp = '<tr bgcolor = #eeeeee>';
				} else {
					tmp = '<tr>';
				}
				tmp += '<td>' + k + '</td>'
					+ '<td class = "file"><a href="file:' + script_folder + '/' + dl[i] + '">' + dl[i] + '</a></td>'
					+ '<td class = "locate"></td>'
					+ '<td class = "command"></td>'
					+ '<td class = "detail"></td>';
				var ft = v2c.readLinesFromFile( script_folder + '/' + dl[i], 'utf-8' );
				if ( !ft ) continue;
				rgex1 = new RegExp('^(.|)//', 'i');
				rgex2 = new RegExp('】[　 ]{0,}', 'i');
				rgex3 = new RegExp('(>)[^><]+?(</a>)', 'i');
				rgex4 = new RegExp('【コマンド(.?)】', 'i');
				rgex5 = new RegExp('(\\${?(?:V2C)?SCRIPT.+?\\.js)', 'i');
				for ( var j = 0, jl = ft.length; j < jl; j++ ) {
					var str = ft[j] + '';
					if ( !str.match( rgex1 ) ) break;
					str = RegExp.rightContext;
					if ( str.search( /^【スクリプト】/i ) > -1) break;
					tx.push( str );
					if ( str.indexOf( '【ラベル】' ) > -1 ) {
						str.search( rgex2 );
						var rc = RegExp.rightContext;
						if( rc.length > 0 ) {
							tmp = tmp.replace( rgex3, '$1' + RegExp.rightContext + '$2' );
						}
					}
					if ( str.indexOf( '【登録場所】' ) > -1 ) {
						str = str.replace( /[\(（].+?[\)）]/ig, '').replace( /※.+?(、|$)/ig, '' );
						var mp = str.match( /(全体|レス表示|リンク|選択テキスト|URLExec)/ig );
						if( mp && mp.length > 0 ) {
							tmp = tmp.replace( /(<td class = "locate">)(<\/td>)/i, '$1' + mp.join( '<br>' ) + '$2' );
						}
					}
					if ( str.search( rgex4 ) > -1 ) {
						if ( RegExp.lastParen == 1 || RegExp.lastParen == '') {
							if( str.search( rgex5 ) > -1 ) {
								var cs = RegExp.$1;
								if ( ( ft[j+1] + '' ).search( rgex4 ) > -1 ) cs += '　etc...</td>';
								tmp = tmp.replace( /(<td class = "command">)(<\/td>)/i, '$1' + cs + '$2' );
							}
						}
					}
				}
				detail_text.push( tx.join( '\n' ) )
				if( tx.length > 0 )
					tmp = tmp.replace( /(<td class = "detail">)(<\/td>)/i, '$1' + '<a href = "file:detail' + k + '">&#9654; </a>' + '$2');
				al[i+1] = tmp + '</tr>';
				k++;
			}
		} else {
			if( dl[i].match( /.+\.js$/i ) ) {
				al[i] = '<a href = "file:' + script_folder + '/' + dl[i] + '">' + dl[i] + '</a><br>';
			}
		}
	}
	if ( option ) {
		al[i+2] = '</table><br><a href = "file:new">&#9654;新規作成</a>　'
				+ '<a href = "file:folder">&#9654;フォルダを開く</a>　　　　　　'
				+ '<a href = "file:reload">&#9654;再読み込み</a><br>';
	} else {
		al[i+1] = '<a href = "file:new">≪新規作成≫</a><br>';
	}
	var h = '<html><body style = " margin:10px; ">' + al.join( '' ) + '</body></html>';
	if ( option ) {
		vcx.setResPaneHTML( h, 'スクリプト一覧', newtab );
	} else {
		vcx.setPopupHTML( h );
	}
	vcx.setRedirectURL( true );
}
createPopupString( true );
// ----- 前の行まで -----