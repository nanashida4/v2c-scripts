//【登録場所】 全体、レス表示、選択テキスト
//【ラベル】 指定フォント(サイズ)でポップアップ
//※フォント比較用とかで。
//※デフォルトフォント設定(11行目)が必要な場合があるかもしれません。
//【コマンド】 $SCRIPT select_font.js
//【更新日】 2009/03/13
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1252074124/131,135
//【スクリプト】
// ----- 次の行から -----
// デフォルトフォント
var FontName = 'ＭＳ Ｐゴシック'; //フォント名 ＊フォントファミリー名ではありません。
var FontSize = 16; //フォントサイズ
//
var FontFamily = '', FontWeight = '', FontStyle = '', Text = '';
var vcx = v2c.context,vrx = vcx.res;
var ge = java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment();
var Fonts = [];
Fonts = ge.getAllFonts();
NumFonts=Fonts.length;
var Lists = [ NumFonts ], SeloptArr=[], PopArr = [];
function formSubmitted( u, sm, sd ) {
	var idx = sd.match( /fn=(\d+)/i )[1], size = sd.match( /fs=(\d+)/i )[1];
	PopArr[0] = PopArr[0].replace( 'selected', '' ).replace( new RegExp( '(option value="' + idx + '")', 'i' ), '$1' + ' selected' );
	PopArr[1] = size;
	PopArr[3] = Lists[ idx ].family;
	PopArr[5] = size;
	PopArr[7] = Lists[ idx ].style;
	PopArr[9] = Lists[ idx ].weight;
	vcx.setPopupHTML( PopArr.join( '' ) );
	vcx.setPopupFocusable( true );
	vcx.setTrapFormSubmission( true );
	v2c.context.closeOriginalPopup();
//	vcx.setClipboardText('フォント名：'+Lists[idx].name+'、フォントサイズ：'+size);
}
function createPopupString(){
	for(i = 0;i < NumFonts;i++){
		Lists[i] = new Object();
		Lists[i].name = Fonts[i].getName() + '';
		Lists[i].family = Fonts[i].getFamily() + '';
		Default = Lists[i].name == FontName;
		if( Default ) {
			FontFamily = Lists[i].family;
		}
		SeloptArr.push( '<option value="' + i + '"' );
		if( Default ) {
			SeloptArr.push( ' selected' );
		}
		SeloptArr.push( '>' + Lists[i].name );
		if( Lists[i].name.search( /(bold|ボールド)/i ) > 0 ) {
			Lists[i].weight = 'bold';
			if( Default ) {
				FontWeight = Lists[i].weight;
			}
		} else {
			Lists[i].weight = '';
		}
		if( Lists[i].name.search( /(italic|イタリック)/i ) > 0 ) {
			Lists[i].style = 'italic';
		} else if ( Lists[i].name.search( /oblique/i ) > 0 ) {
			Lists[i].style = 'oblique';
		} else {
			Lists[i].style = '';
		}
		if( Default ) {
			FontStyle = Lists[i].style;
		}
//		vcx.setClipboardText('フォント名：'+FontName+'、フォントサイズ：'+FontSize);
	}
	var Selopt = SeloptArr.join('');
	PopArr[0] = '<html>'
		+ '<body style="margin:0 5px;background-color: #F5F5F5">'
		+ '<form action="">'
		+ '<table border="0" cellspacing="1" cellpadding="1" style="font-size:10px;">'
		+ '<tr>'
			+ '<td><div>フォント名　　：</div></td>'
			+ '<td colspan="3"><div>' + '<select name="fn">' + Selopt + '</select>' + '</div></td>'
		+ '</tr>'
		+ '<tr>'
			+ '<td><div>フォントサイズ：</div></td>'
			+ '<td><input type="text" size="6" maxlength="3" istyle=4 name="fs" value="'; PopArr[1] = FontSize; PopArr[2] = '"></td>'
			+ '<input type="submit" value="変更">'
			+ '<input type="reset" value="リセット">'
		+ '</tr>'
		+ '</table>'
		+ '</form>'
		+ '<div style = "font-family:'; PopArr[3] = FontFamily;
			PopArr[4] = ';font-size:'; PopArr[5] = FontSize;
			PopArr[6] = ';font-style:'; PopArr[7] = FontStyle;
			PopArr[8] = ';font-weight:'; PopArr[9] = FontWeight;
			PopArr[10] = ';">' + Text + '</div>'
		+ '</body>'
		+ '</html>';
	vcx.setPopupHTML( PopArr.join( '' ) );
	vcx.setPopupFocusable( true );
	vcx.setTrapFormSubmission( true );
}
Text = vcx.selText;
if ( !Text ) Text = vrx.message;
if ( Text && ( Text.length() > 0 ) ) {
	Text += '';
	Text = Text.replace( /</g, "&lt;" );
	Text = Text.replace( />/g, "&gt;" );
	Text = Text.replace( /\n/g, "<br>" );
	createPopupString();
}
// ----- 前の行まで -----