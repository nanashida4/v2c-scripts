//【登録場所】 レス表示、全体(引数にinput有りで可)
//【ラベル】 　必死チェッカーもどき
//【コマンド1】 ${SCRIPT:SFrw} hissi.js　か　${SCRIPT:SFrw} hissi.js id　でID検索
//【コマンド2】 ${SCRIPT:SFrw} hissi.js trip　でトリップ検索
//【コマンド3】 ${SCRIPT:SFrw} hissi.js id input　でIDをデフォルトで入力画面表示
//【コマンド4】 ${SCRIPT:SFrw} hissi.js trip input　でトリップをデフォルトで入力画面表示
// * 初回使用に限り対応するscript\scdataフォルダ内にhissi_menu.txtを作成して板一覧を取得してます。ボタンの説明は以下。

// * 『書き込み時間帯』：『書き込みレス一覧』のレス数を棒グラフで表示、r/min→レス数/分、『抽出』以下のボタンで増加します。
// * 『書き込みレス一覧』：書き込んだレスを時間順に一覧表示、『抽出』以下のボタンで増加します。
// * 『コピー』：『書き込みレス一覧』の表示レスを2ch荒し報告形式でコピー。
// * 『クリア』：『書き込み時間帯』『書き込みレス一覧』の表示をクリアします。『抽出』以下のボタンで表示。
// * 『抽出』：現在選択表示しているスレから検索IDのレスを抽出して『書き込み時間帯』『書き込みレス一覧』を反映します。
// * 『レス(*/*)』：『書き込みレス一覧』の始めの取得数は50レスまでです。1クリックで50レスまで追加・再取得ができます。

// * 以下は引数にtripがある場合の機能です。
// * 『ID(*/*)』：トリップ検索でIDが複数あると表示されます。『レス(*/*)』と同じ。

// * 以下は引数にinputがある場合の機能です。またinput無しでは初期表示の書き込み時間帯はWeb元が基準になりますが
//   input有りでは書き込みレス一覧が常に基準になります。
// * 『再検索』：現在のポップアップを閉じて入力画面を再表示します。

// ポップアップの表示色設定、(25～29行のどれか１つの行だけ)先頭の文字「//」を削除してください。デフォルトは黒です。
// ～Popup_bg:ﾒｲﾝ色, Title_bg:ﾀｲﾄﾙ色, SubPopup_bg:ｻﾎﾟｰﾄ色, ResNum_Cr:(ｸﾞﾗﾌの)ﾚｽ数の色, Bar_Cr:(ｸﾞﾗﾌの)ﾊﾞｰ色
var Popup_bg = '#F5F5F5', Title_bg = '#808080', SubPopup_bg = '#DCDCDC', ResNum_Cr = '#404040', Bar_Cr = '#696969';//黒
//var Popup_bg = '#FFFAFA', Title_bg = '#A52A2A', SubPopup_bg = '#FFE4E1', ResNum_Cr = '#A52A2A', Bar_Cr = '#A52A2A';//赤
//var Popup_bg = '#FFFFF0', Title_bg = '#B8860B', SubPopup_bg = '#FFFACD', ResNum_Cr = '#A0522D', Bar_Cr = '#B8860B';//黄
//var Popup_bg = '#F0F8FF', Title_bg = '#4169E1', SubPopup_bg = '#E6E6FA', ResNum_Cr = '#2F4F4F', Bar_Cr = '#4169E1';//青
//var Popup_bg = '#F5FFFA', Title_bg = '#2E8B57', SubPopup_bg = '#90EE90', ResNum_Cr = '#006400', Bar_Cr = '#2E8B57';//緑

//入力ポップアップCSS
var InputCSS = '<head><style type="text/css"><!--'
		+'body{background-color:'+Popup_bg+'; margin:5px 15px;}'
		+'--></style></head>';
//メインポップアップCSS
var MainCSS = '<head><style type="text/css"><!--'
		+'body{background-color:'+Popup_bg+'; margin:0 15px 5px;}'
		+'.term1{background-color:'+Title_bg+'; color:white; font-weight:bold;}'
		+'.term2{background-color:'+SubPopup_bg+';}'
		+'--></style></head>';
//グラフポップアップCSS
var GraphCSS = '<head><style type="text/css"><!--'
		+'body{background-color:'+Popup_bg+'; margin:5px 0 5px 15px;}'
		+'.headding{background-color:'+Title_bg+'; color:white; font-weight:bold;}'
		+'.row{background-color:'+SubPopup_bg+';}'
		+'.data{color:'+ResNum_Cr+';font-weight:bold;}'
		+'.bar{background-color:'+Bar_Cr+';}'
		+'.sum{background-color:'+Title_bg+'; color:white; font-weight:bold;}'
		+'--></style></head>';
//書き込みレス一覧ポップアップCSS
var ListCSS = '<head><style type="text/css"><!--'
		+'body{background-color:'+Popup_bg+'; margin:5px 0 5px 15px;}'
		+'.headding{background-color:'+Title_bg+'; color:white; font-weight:bold;}'
		+'.row{background-color:'+SubPopup_bg+';}'
		+'--></style></head>';

var vcx = v2c.context,res = vcx.res, th = vcx.thread, DefaultBoard = 'software';
var TotalIdNum=1, IdPageIdx=0, NextIdPage=1, ResPageIdx=0, NextResPage=1, TotalResNum=0;
var ListString='', GraphString='', INPUT, KEYNAME, DATE, KEYWORD, BOARD, ID;
var MainHtml = new Array(), MainArray = new Array(24), DataList = new Array(), IdList = new Array();
var IdUrlList = new Array(), NameList = new Array(), ThreadList = new Array(), sw = new Array(5),UrlList = new Array();
var XXIVHourList = new Array(), XXIVHourArray = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
var SumIdResNum = new Array(), TotalPageNum = new Array(), PageData = new Array();
MainArray[0] = '<html>'+MainCSS+'<body><dl><dt class="term1">必死チェッカーもどき ';
MainArray[2] = '<br></dt><dt class="term2">取得URL【';
MainArray[4] = '】</dt>';
MainArray[6] = '</a></dd></dl><dl><dt class="term1">';
MainArray[8] = '</dt><dt class="term2">使用した名前一覧【';
MainArray[10] = '】<br></dt><dd>';
MainArray[12] = '</dd><dt class="term2">書き込んだスレッド一覧【';
MainArray[14] = '】<br></dt><dd>';
MainArray[16] = '</dd></dl><form action=""><input type = "hidden" name = "';
MainArray[18] = '" value = "';
MainArray[20] = '"><input type="submit" value="書き込み時間帯" name="graph">'
	+'<input type="submit" value="書き込みレス一覧" name="list">'
	+'<input type="submit" value="コピー" name="copy">'
	+'<input type="submit" value="クリア" name="clear">'
	+'<input type="submit" value="抽出">';
MainArray[22] = '<input type="submit" value="再検索" name="input">'
MainArray[23] = '</form></body></html>';

function deleteRow(ln0,ln1) {
	for(var i = 0, ilen = DataList.length; i < ilen; i++) {
		if(DataList[i][0] == ln0 && DataList[i][1] == ln1) return 1;
	}
	return;
}
function createArrayList(num,rur) {
	var j=0, n=0;
	var list = new Array();
	if(rur) {
		var line = new Array(13);
		var rgex = new RegExp('');
		rgex.compile('([^=><]+?\/)(\\d+) target="_blank">(.+)<\/a>.+<\/b>\\[.*?\\]：'
			+'((\\d+)\/(\\d+)\/(\\d+)\\(.\\) (\\d+):(\\d+):([\\d.]+)) (ID:.+?)(?=( |<dd>))','i');
		for(var i = 0, k=PageData[ID][num], ilen = k.length; i < ilen; i++) {
			line = k[i].match(rgex);
			if(!line) {v2c.alert('レス一覧の取得に失敗しました。'); return;}
			line = line.slice(1,12);
			if(deleteRow(line[0],line[1])){
				j++;
			} else {
				line[3] = line[3].replace(/\(.\)/,'');
				line[4] = new Date(line[4],line[5]-1,line[6],line[7],line[8],line[9]).getTime();
				line[5] = line[10];
				line = line.slice(0,6);
				list[i-j] = line;
			}
		}
	} else {
		var vst = v2c.resPane.selectedThread;
		var vu = vst.url, vt = vst.title, da, fi;
		for(var m = 0, mlen = num.length; m < mlen; m++){
			line = new Array(6);
			fi = num[m]+1;
			var vgr = vst.getRes(num[m]);
			line[0] = vu+'';
			line[1] = fi;
			if(deleteRow(line[0],line[1])){
				n++;
			} else {
				line[2] = vt;
				da = vgr.date+'';
				da = da.replace(/\(.\)/,'');
				line[3] = da+'';
				line[4] = vgr.time;
				line[5] = 'ID:'+vgr.id;
				list[m-n] = line;
			}
		}
	}
	DataList = DataList.concat(list);
	DataList = DataList.sort(function(a,b){return((a[4]-b[4]));});
	return ;
}
function createHtmlGraph(cmp){
	if(cmp){
		var xa,whh = new Array(24);
		var dlen = DataList.length, j=0;
		for(var i = 0; i < 24; i++){
			(i+'').length == 1 ? xa = ' 0' + i + ':' : xa = ' ' + i + ':';
			var ya = 0;
			while(j < dlen){
				if(DataList[j][3].indexOf(xa) >= 0){
					j++;
					ya++;
				} else 	{
					break;
				}
			}
			whh[i] = ya;
			if(XXIVHourArray[i] < whh[i]) {
				TotalResNum = TotalResNum+whh[i]-XXIVHourArray[i];
				XXIVHourArray[i] = whh[i];
			}
		}
	} else {
		if(XXIVHourArray) {
			for(var m = 0; m < 24; m++){
				XXIVHourArray[m] = parseInt(XXIVHourArray[m])+parseInt(XXIVHourList[ID][m]);
			}
			TotalResNum = parseInt(TotalResNum)+parseInt(SumIdResNum[ID]);
		} else {
			XXIVHourArray = parseInt(XXIVHourList[ID]);
			TotalResNum = parseInt(SumIdResNum[ID]);
		}
	}
	var gs0 = new Array(25), gsa = new Array(9);
	GraphString = '';
	gs0[0] = '<tr class="headding"><th align="center">'
		+'Hour</th><th colspan="2" align="center">Count</th><th align="right">&nbsp;r/min&nbsp; </th></tr>';
	gsa[0] = '<tr><td align="right">';
	gsa[2] = '時:&nbsp;</td><td class="data" align="right">';
	gsa[4] = '&nbsp;</td><td><div class="bar" style=" width: ';
	gsa[6] = ';"></div></td><td>&nbsp;&nbsp;';
	gsa[8] = '&nbsp;</td></tr>';
	for(var n = 0, rn, x; n < 24; n++) {
		if(n%2 ==1) {
			gsa[0] = '<tr class="row"><td align="right">';
		} else {
			gsa[0] = '<tr><td align="right">';
		}
		if(XXIVHourArray[n] == 0) {
			rn = '';
			x='';
		} else {
			rn = XXIVHourArray[n];
			x = Math.round(XXIVHourArray[n]/60*100)/100;
		}
		gsa[1] = n; gsa[3] = rn; gsa[5] = XXIVHourArray[n]; gsa[7] = x;
		gs0.push(gsa.join(''));
	}
	GraphString = gs0.join('');
}
function createHtmlList(){
	var ls0 = new Array(), lsa = new Array(12);
	ListString = '';
	ls0.push('<tr  class="headding" align="center"><th>Thread Title</th><th>Date</th><th>ID</th></tr>');
	lsa[0] = '<tr><td><a href="'; lsa[3] = '">';
	lsa[5] = ' ('; lsa[7] = ')</a></td><td align="right" width="170">&nbsp; ';
	lsa[9] = '</td><td width="110">&nbsp; '; lsa[11] = '</td></tr>';
	for(var i = 0, ilen = DataList.length; i < ilen; i++){
		i%2 ==1 ? lsa[0] = '<tr class="row"><td><a href="': lsa[0] = '<tr><td><a href="';
		lsa[1] = DataList[i][0];
		lsa[2] = DataList[i][1];
		lsa[4] = DataList[i][2];
		lsa[6] = DataList[i][1];
		lsa[8] = DataList[i][3];
		lsa[10] = DataList[i][5];
		ls0.push(lsa.join(''));
	}
	ListString = ls0.join('');
	return;
}
function createPageButton() {
	var pgb = '';
	ResPageIdx+1 == TotalPageNum[ID] ? NextResPage = 1 : NextResPage++;
	if(TotalIdNum > 1) {
		IdPageIdx+1 == TotalIdNum ? NextIdPage = 1 : NextIdPage++;
		pgb = '<input type="submit" value = "ID('+(IdPageIdx+1)+'/'+TotalIdNum+')" name = "idpage'+NextIdPage+'">';
	}
		var mrp = new RegExp('(value = "レス\\()\\d+(/'+TotalPageNum[ID]+'\\)" name = "respage)\\d+','i')
		MainHtml[ID] = (MainHtml[ID]+'').replace(mrp,'$1'+(ResPageIdx+1)+'$2'+NextResPage);
		pgb += '<input type="submit" value = "レス('+(ResPageIdx+1)
			+'/'+TotalPageNum[ID]+')" name = "respage'+NextResPage+'">';
	return pgb;
}
function formSubmitted(u,sm,sd) {
	if(sd.indexOf('&input=') > -1) {
		var key = v2c.getSelectedText();
		if (key&&(key.length()>0)) {
			KEYWORD = key;
		} else {
			KEYWORD = '';
		}
		vcx.closeOriginalPopup();
		createInputKeyWord(true);
		return;
	}
	if(sd.indexOf('keytype=') > -1){
		TotalIdNum=1, IdPageIdx=0, NextIdPage=1, ResPageIdx=0, NextResPage=1;
		IdList = new Array(), IdUrlList = new Array();
		var sdt = sd;
		var rgex = new RegExp('^keytype=(.+?)&(date=)((\\d+?)%2F(\\d+?)%2F(\\d+?))&'
			+'keyword=(.+?)(&Bord=)(.+?$)','i');
		if(rgex.exec(sd)) {
			DATE = decodeURIComponent(RegExp.$3);
			KEYWORD = decodeURIComponent(RegExp.$7);
			BOARD = RegExp.$9;
			if(DATE.search(/20\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])/) == -1) {
				v2c.alert('日付が無効です。2009/01/01のように入力してください。'); return;
			}
			if(sd.indexOf('keytype=Trip') > -1) {
				if(KEYWORD.search(/^[\.\/\w]{9}([\.26AEIMQUYcgkosw]|[\.\/\w]{3})$/) == -1) {
					v2c.alert('トリップが正しくありません。'); return;
				}
				sd = sd.replace(rgex,'$2$4$5$6&$1=$7$8$9');
				KEYNAME = 'trip';
			} else {
				if(KEYWORD.search(/^[\+\/\w]{8}(O|P|Q|i|I|o|0|)$/) == -1) {
					v2c.alert('IDが正しくありません。'); return;
				}
				sd = sd.replace(rgex,'$2$4$5$6&$1=$7');
				KEYNAME = 'id';
			}
		} else {
			if(sd.search(/&Bord=$/) > 1){
				v2c.alert('板が無効です。先頭が『　』で空いてるデータを選択してください。'); return;
			} else if(sd.indexOf('keyword=&') > -1) {
				if(sd.indexOf('keytype=Trip') > -1) {
					v2c.alert('トリップを入力してください。'); return;
				} else {
					v2c.alert('IDを入力してください。'); return;
				}
			} else{
				v2c.alert('必要な入力データを取得できませんでした。'); return;
			}
		}
		vcx.closeOriginalPopup();
		createURLString(sd);return;
	}
	var ls = false, gs =false, ipg = new Array(2), rpg = new Array(2),kd = new Array(3);
	ls = sd.indexOf('&list=') > -1;
	if(!ls) gs = sd.indexOf('&graph=') > -1;
	if(!gs) ipg = sd.match(/\&idpage(\d{1,})=/);
	if(!ipg) rpg = sd.match(/\&respage(\d{1,})=/);
	if(!rpg) kd = sd.match(/(id|trip)=(.+)$/);
	if(sd.indexOf('&clear=') > -1) {
		DataList = new Array();
		ListString= '抽出無し';
		GraphString = '抽出無し';
		XXIVHourArray=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		TotalResNum=0;
		return;
	} else if(sd.indexOf('&copy=') > -1){
		var cph = ListString.replace(/<\/tr>/g,'\n');
		cph = cph.replace(new RegExp('<a href="([^>]+?)">[^>]+?</a>','ig'),'$1');
		cph = cph.replace(/(<[^]+?>|\&nbsp;)/g,'');
		cph = cph.replace(/Thread TitleDateID\n/,'')
		vcx.setClipboardText(cph);
		return;
	} else if(ls || gs){
		var pd =new Array(6);
		pd[0] = '<html>';
		pd[2] = '<body><table border="0" cellspacing="1" cellpadding="1" style = "font-size:10px;">';
		pd[5] = '</table></body></html>';
		if(gs) {
			pd[1] = GraphCSS;
			pd[3] = GraphString;
			if(TotalResNum){
				pd[4]='<tr class="sum" align="right"><td>Total:&nbsp;</td><td>'+TotalResNum+'&nbsp;</tr>';
			}		
			vcx.setPopupHTML(pd.join(''));
			vcx.setRedirectURL(true);
			vcx.setTrapFormSubmission(true);
			return;
		}
		if(ls) {
			pd[1] = ListCSS;
			pd[3] = ListString;
			pd[4] = '';
			vcx.setPopupHTML(pd.join(''));
			vcx.setRedirectURL(true);
			vcx.setTrapFormSubmission(true);
			return;
		}
	} else if(ipg) {
		ResPageIdx=0;
		NextResPage=1;
		IdPageIdx = ipg[1]-1;
		vcx.closeOriginalPopup();
		if(IdList[IdPageIdx]) {
			ID = IdList[IdPageIdx];
			createArrayList(0,true);
			createHtmlGraph(true);
			createHtmlList();
			vcx.setPopupHTML(MainHtml[ID]);
			vcx.setRedirectURL(true);
			vcx.setTrapFormSubmission(true);
			return;
		}
		v2c.setStatus('HTML受信待ち。： ID '+IdUrlList[IdPageIdx]+'?thread=all');
		var sh = v2c.readURL(IdUrlList[IdPageIdx]+'?thread=all');
		v2c.setStatus('HTML読み込み完了。： ID');
		createMainPopupString(IdUrlList,sh);
		return;
	} else if(rpg) {
			ResPageIdx = parseInt(rpg[1])-1;
			var pa;
			ResPageIdx == 0 ? pa = '' : pa = '?p='+ResPageIdx;
			vcx.closeOriginalPopup();
			if(PageData[ID][ResPageIdx] == undefined) {
				v2c.setStatus('HTML受信待ち。： レス '+IdUrlList[IdPageIdx]+pa);
				var sh = v2c.readURL(IdUrlList[IdPageIdx]+pa);
				v2c.setStatus('HTML読み込み完了。： レス');
				PageData[ID][ResPageIdx] = sh.match(/<dl>([^]+?)<\/dl>/g);
			}
			createArrayList(ResPageIdx,true);
			createHtmlGraph(true);
			createHtmlList();
			createPageButton();
			vcx.setPopupHTML(MainHtml[ID]);
			vcx.setRedirectURL(true);
			vcx.setTrapFormSubmission(true);
			return;
	} else {
		var vst = v2c.resPane.selectedThread;
		if(!vst) return;
		kd[2] = decodeURIComponent(kd[2]);
		var vu = vst.url, idx = new Array(), nm = new Array(), nml, ftp,mi;
		var rgex = new RegExp();
		rgex.compile('◆([\.\/\\w]{10,12}) ');
		for(var i = 0, ilen = vst.localResCount; i < ilen; i++){
			var vgr = vst.getRes(i);
			if(vgr.id){
				mi=vgr.id.replace('●','');
				if(kd[1] == 'trip') {
					if(mi == IdList[IdPageIdx]) {
						idx.push(vgr.index); nm.push(vgr.number);
					} else {
						ftp = vgr.name.match(rgex);
						if(ftp){
							if(ftp[1] == kd[2] && vgr.date.indexOf(DATE) >= 0) {
								idx.push(vgr.index);
								nm.push(vgr.number);
							}
						}
					}
				} else {
					if(mi == kd[2]) {
						idx.push(vgr.index);
						nm.push(vgr.number);
					}
				}
			}
		}
		var nml = nm.join(',');
		MainHtml[ID] = MainHtml[ID].replace(new RegExp('('+vu+')([^\\d]{1})','i'),'$1'+nml+'$2');
//		vcx.setFilteredResIndex(idx);
		createArrayList(idx,false);
		createHtmlGraph(true);
		createHtmlList();
		return;
	}
}
function redirectURL(u){
	vcx.setPopupHTML(MainHtml[ID]);
	vcx.setRedirectURL(true);
	vcx.setTrapFormSubmission(true);
	vcx.closeOriginalPopup();
	return u;
}
function createMainPopupString(su,sh){
	if(!sh) {v2c.alert('ページの取得に失敗しました。'); returnInputKeyWord(); return;}
	sh = sh+'';
	var ttl = sh.match(/<title>必死チェッカーもどき ([^><]+?)<\/title>/)
	if(!ttl) {v2c.alert('この(ID|トリップ)に対応するファイルが存在しません。'); returnInputKeyWord(); return;}
	ID = ttl[1].match(/&gt; ([^; ]+$)/).pop();
	IdList[IdPageIdx] = ID;
	var dsp = new String(DATE).split("/");
	var cld = new Date(dsp[0]-0,dsp[1]-1,dsp[2]-0).getTime()-0;
	var cll = new Date(2008,7-1,9).getTime()-0;
	var cl,cr;
	if(cld >= cll){
		cl = sh.match(/>(\d{1,} 位)<\/font>(\/\d{1,} ID中)<\/td>[^]+?(\d{1,})<\/td><\/tr><\/table>/);
		if(!cl) {v2c.alert('順位と総レス数の取得に失敗しました。'); returnInputKeyWord(); return;}
		cr = '<br>【'+cl[1]+cl[2]+'】【Total '+cl[3]+' res】<br>';
		TotalPageNum[ID] = Math.ceil(parseInt(cl[3])/50);
	} else {
		cl = sh.match(/書き込み数<\/td>[^]+?(\d{1,})<\/td><\/tr><\/table>/);
		if(!cl) {v2c.alert('総レス数の取得に失敗しました。'); returnInputKeyWord(); return;}
		cr = '<br>【Total '+cl[1]+' res】<br>';
		TotalPageNum[ID] = Math.ceil(parseInt(cl[1])/50);
	}
	var wl = sh.match(/書き込み数<\/td>([^]+?)<td[^><]+?>(\d+)<\/td><\/tr><\/table>/);
	if(!wl) {v2c.alert('書き込み数の取得に失敗しました。'); returnInputKeyWord(); return;}
	XXIVHourList[ID] = new Array(24);
	XXIVHourList[ID] = wl[1].match(/(\d+)(?=<\/td>)/g);
	SumIdResNum[ID] = wl[2];
	var thl = sh.match(/>書き込んだスレッド一覧<[^]+?<td>([^]+?)(?:<br>|)<\/td><td>([^]+?)<br><\/td><\/tr><\/table>/);
	if(!thl) {v2c.alert('スレッド一覧の取得に失敗しました。'); returnInputKeyWord(); return;}
	thl[2] = thl[2].replace(/l50 target="_blank"/g,'');
	NameList = thl[1].split('<br>');
	ThreadList = thl[2].split('<br>');
	var tnn = NameList.length;
	var ttn = ThreadList.length;
	PageData[ID] = new Array(TotalPageNum[ID]);
	PageData[ID][0] = sh.match(/<dl>([^]+?)<\/dl>/g);
	createArrayList(0,true);
	createHtmlGraph(INPUT);
	createHtmlList();
	KEYNAME == 'trip' ? MainArray[1] = 'トリップ検索' : MainArray[1] = 'ID検索';
	var ur0 = new Array(), ura = new Array(5); 
	ura[0] = '<dd><a href = "';
	ura[2] = '">';
	ura[4] = '</a></dd>';
	TotalIdNum = su.length;
	for(var i = 0; i < TotalIdNum; i++){
		ura[1] = su[i];
		ura[3] = su[i];
		ur0.push(ura.join(''));
	}
	MainArray[3] = TotalIdNum;
	MainArray[5] = ur0.join('');
	MainArray[7] = ttl[1]+cr;
	MainArray[9] = tnn;
	MainArray[11] = thl[1];
	MainArray[13] = ttn;
	MainArray[15] = thl[2];
	MainArray[17] = KEYNAME;
	MainArray[19] = KEYWORD;
	MainArray[21] = createPageButton();
	if(!INPUT){
		MainArray[22] = '';
	}
	MainHtml[ID] = MainArray.join('');
	vcx.setPopupHTML(MainHtml[ID]);
	vcx.setRedirectURL(true);
	vcx.setTrapFormSubmission(true);
}
function createURLString(sd) {
	var ss = new Array(3), ss0;
	ss[0] = 'http://hissi.org';
	if(KEYNAME == 'trip') {
		var pe = new Date();
		var ada = new Date(pe.getFullYear(),pe.getMonth(),pe.getDate()).getTime()-1296000000;
		var time;
		if(INPUT) {
			var ida = sd.match(/date=(\d{4})(\d{2})(\d{2})&/);
			time = new Date(ida[1],eval(ida[2]-1),ida[3]).getTime();
		} else {
			time = parseInt(res.time);
		}
		(ada < time)? ss[1] = 'trip_search.php' : ss[1] = 'old_trip_search.php';
		ss0 = ss.join('/');
	} else {
		ss[1] = 'read.php/'+BOARD;
		ss[2] = 'search';
		ss0 = ss.join('/');
	}
	v2c.setStatus('HTTPレスポンス待ち。 '+ss0+'?'+sd);
	var hr = v2c.createHttpRequest(ss0,sd);
	var sr = hr.getContentsAsString();
	if(!sr) {v2c.alert('ページの取得に失敗しました。: '+hr.responseCode+' '+hr.responseMessage); returnInputKeyWord(); return;}
	sr = sr+'';
	v2c.setStatus('HTTPリクエスト完了。');
	if(sr == ''){v2c.alert('ページの取得に失敗しました。: 空白のページ'); returnInputKeyWord(); return;}
	if(KEYNAME == 'trip') {
		ss[1] = 'read.php';
		var sn = sr.match(/url=\.\/read\.php\/(.+)">$/);
		if(!sn){
			var idp = sr.match(/(\/read.php\/[^><]+?)(?=>[^><]+?<\/a><br>)/g);
			if(idp) {
				for(var j = 0, jlen = idp.length; j < jlen; j++){
					IdUrlList[j] = ss[0]+idp[j];
				}
				v2c.setStatus('HTML受信待ち。：トリップ検索(複数ID) '+IdUrlList[0]+'?thread=all');
				var sh = v2c.readURL(IdUrlList[0]+'?thread=all');
				v2c.setStatus('HTML読み込み完了。：トリップ検索(複数ID)');
				createMainPopupString(IdUrlList,sh); return;
			} else if(sr.indexOf('対応してない') >= 0) {
				v2c.alert('この日付の解析データはトリップ検索に対応してないようです'); returnInputKeyWord(); return;
			} else if(sr.indexOf('存在しない') >= 0) {
				v2c.alert('この日付の解析データには存在しないトリップのようです。'); returnInputKeyWord(); return;
			} else {
				v2c.alert('トリップ検索に失敗しました。'); returnInputKeyWord(); return;
			}
		}
	} else {
		var sn = sr.match(/url=\.\.\/(.+)">$/);
		if(!sn) {
			if(sr.indexOf('存在しません') >= 0) {
				v2c.alert('対応してない日付、もしくは存在しないIDのようです。'); returnInputKeyWord(); return;
			} else {
				v2c.alert('ID検索に失敗しました。'); returnInputKeyWord(); return;
			}
		}
	}
	ss[2] = sn[1];
	IdUrlList[0] = ss.join('/');
	var wr; KEYNAME == 'trip' ? wr = 'トリップ検索' : wr = 'ID検索';
	v2c.setStatus('HTML受信待ち。：'+wr+' '+IdUrlList[0]+'?thread=all');
	var sh = v2c.readURL(IdUrlList[0]+'?thread=all');
	v2c.setStatus('HTML読み込み完了。：'+wr);
	createMainPopupString(IdUrlList,sh);
}
function returnInputKeyWord() {
	if(INPUT) createInputKeyWord(true);
}
function createInputKeyWord(ri) {
	var txt = v2c.getScriptDataFile('hissi_menu.txt');
	var cecd = 'utf-8';
	if(v2c.readFile(txt) == null){
		var mu = 'http://hissi.org/menu.php';
		v2c.setStatus('HTML受信待ち。：対応板 '+mu);
		var rm = v2c.readURL(mu);
		v2c.setStatus('HTML読み込み完了。：対応板');
		var ptn = /(<b>(.+?)<\/b>|read\.php\/(.+?)\/>(.+?)<\/a>)/g;
		var MenuList = new Array();
		while(ptn.exec(rm) != null) {
			MenuList.push(RegExp.$2+','+RegExp.$3+','+RegExp.$4);
			v2c.writeLinesToFile(txt,MenuList,cecd);
		}
	}
	var bka = v2c.readLinesFromFile(txt,cecd);
	var alen = bka.length;
	if(!ri){
		var arg = vcx.args;
		if(arg.length == 0) {
			KEYNAME = 'id';
			INPUT = false;
		} else {
			if(arg[0] != 'id' && arg[0] != 'trip') {
				KEYNAME = 'id';
			} else {
				KEYNAME = arg[0]+'';
			}
			arg[1] == 'input' ? INPUT = true : INPUT = false;
		}
		if(res) {
			DATE = res.date.match(/\d{4}\/\d{2}\/\d{2}/);
			!DATE ? DATE = '' : DATE += ''
			if(KEYNAME == 'trip') {
				rnm = res.name.match(/◆([\.\/\w]{10,12}) /);
				rnm ? KEYWORD = rnm.pop()+'' : KEYWORD = '';
			} else {
				KEYWORD = res.id;
				if(!KEYWORD || KEYWORD.match(/^(\?\?\?(.|)|(O|P|Q|i|I|o|0|))$/)) {
					KEYWORD = '';
				} else {
					KEYWORD=KEYWORD.replace('●','');
					KEYWORD=KEYWORD.replace('!','');
				}
			}
		} else {
			if(INPUT) {
				var pe= new Date();
				var pm = pe.getMonth();
				var pd = pe.getDate();
				pm+1 < 10 ? pm = '0' + parseInt(pm+1) : pm = pm+1;
				pd < 10 ? pd = '0' + pd : pd;
				DATE = pe.getFullYear()+'/'+pm+'/'+pd;
			} else {
				DATE = '';
			}
			var key = v2c.getSelectedText();
			if (key&&(key.length()>0)) {
				KEYWORD = key;
			} else {
				KEYWORD = '';
			}
		}
		if(th) {
			BOARD = th.board.key+'';
		} else {
			BOARD = DefaultBoard;
		}
		var drp = new String(DATE).replace(/\//g,'');
		for(var i = 0; i < alen; i++){
			var b = bka[i].split(',')[1] + '';
			if(BOARD == b) break
		}
		var tea = i == alen;
		if(tea) BOARD = DefaultBoard;
	}
	if(!INPUT) {
		if(DATE == '') {v2c.alert('日付が取得できません。'); return;}
		if(tea) {v2c.alert('『必死チェッカーもどき』対応板ではありません。'); return;}
		if(KEYNAME == 'trip') {
			if(KEYWORD == '') {v2c.alert('トリップがありません。'); return;}
			var sd = 'date='+drp+'&Trip='+encodeURIComponent(KEYWORD)+'&Bord='+BOARD;
		} else if(KEYNAME == 'id') {
			if(KEYWORD == '') {v2c.alert('IDがありません。'); return;}
			var sd = 'date='+drp+'&ID='+encodeURIComponent(KEYWORD);
		}
		createURLString(sd);return;
	} else {
		var InputArray = new Array();
		vcx.setPopupFocusable(true);
		InputArray[0] = '<html>'+InputCSS+'<body><form action="" method="get"><table><tr valign="middle">'
			+'<td>検索:</td><td><select name="keytype">';
		if(KEYNAME == 'trip') {
			InputArray.push('<option value="ID">ＩＤ</option>'
				+'<option value="Trip" selected>トリップ</option></select></td></tr>');
		} else {
			InputArray.push('<option value="ID" selected>ＩＤ</option>'
				+'<option value="Trip">トリップ</option></select></td></tr>');
		} 
		InputArray.push('<tr valign="middle"><td>日付:</td><td><input type="text" name="date" value="');
		InputArray.push(DATE);
		InputArray.push('" size="11" maxlength=10></td></tr><tr valign="middle">'
			+'<td>KW:</td><td><input type="text" name="keyword" value="');
		InputArray.push(KEYWORD);
		InputArray.push('" size="19" maxlength=12></td></tr><tr valign="middle"><td>板:</td><td><select name="Bord">');
		var c = new Array(3),d;
		for(var j = 0; j < alen; j++){
			c = bka[j].split(',');
			if(c[0] != ''){
				InputArray.push('<option value="">'+c[0]+'</option>');
			} else {
				c[1] == BOARD ? d = '" selected>　' : d = '">　';
				InputArray.push('<option value="'+c[1]+d+c[2]+'</option>')
			}	
		}
		InputArray.push('</select></td></tr></table><input type="submit" value="送信">'
			+'<input type="reset" value="リセット"></form> </body></html>');
		var InputHtml = InputArray.join('');
		vcx.closeOriginalPopup();
		vcx.setPopupHTML(InputHtml);
		vcx.setTrapFormSubmission(true);
	}
}
createInputKeyWord(false);
