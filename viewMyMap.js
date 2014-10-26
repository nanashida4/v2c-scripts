//【登録場所】全体、レス表示
//【ラベル】「マウスジェスチャ一覧」、または「キーバインド一覧」
//【内容】設定してあるマウスジェスチャ一覧、またはキーバインド一覧を新タブで表示。
//【コマンド1】${SCRIPT:Fr} viewMyMap.js 0 //キーバインドの設定一覧
//【コマンド2】${SCRIPT:Fr} viewMyMap.js 1 //マウスジェスチャの設定一覧
//【補足1】通常のアクション名取得にはttp://www39.atwiki.jp/v2cwiki/pages/49.htmlを利用、そのため、新しいアクションは置換されない可能性有り
//【補足2】スクリプトのアクション名取得にはextcmd_win.txtを利用、そのため、他のOSはたぶん未対応
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var option = vcx.argLine;
function createMyMap(op){
	var f1 = new java.io.File( v2c.saveDir, '\\extcmd_win.txt' );
	var fa1 = v2c.readLinesFromFile(f1,'utf-8');
	var f2 = op ? new java.io.File(v2c.saveDir, '\\gesture.txt') : new java.io.File(v2c.saveDir, '\\inputmap.txt');
	var fa2 = v2c.readLinesFromFile(f2,'utf-8');
	for(var i = 0, il = fa1.length, m0 = m1 = m2 = ''; i < il; i++){
		s = fa1[i]+'';
		m0 = (s.match(/^\w/) || [])[0]
		m1 = (s.match(/\tI(\w+?)\t/) || [])[1];
		m2 = (s.match(/\tL(.+?)(\t|$)/) || [])[1];
		for(var j = 0, jl = fa2.length; j < jl; j++){
			fa2[j] = (fa2[j]+'').replace(new RegExp(m0+'\\$'+m1+'$'),m2+' [外部コマンド]');
		}
	}
	var se = v2c.readURL('h'+'ttp://www39.atwiki.jp/v2cwiki/pages/49.html');
	rgex = new RegExp('<h4.*?>(.+?)\\(([^ ]+).+?<\/h4>([^]*?<\/table>)','g');
	var pr = [], ar = [];
	while(rgex.exec(se) != null){
		pr[RegExp.$2+''] = {type:RegExp.$1+'', act:[]};
		ar.push(RegExp.$3+'');
	}
	rgex = new RegExp('0--><td style="">([^<]*?)<\/td>[^]*?1--><td style="">([^<]*?)<\/td>','ig');
	for(var m = 0, ml = ar.length; m < ml; m++){
		while(rgex.exec(ar[m]) != null){
			for(var n = 0, nl = fa2.length; n < nl; n++){
				fa2[n] = (fa2[n]+'').replace(new RegExp(RegExp.$2+'$'),RegExp.$1);
			}
		}
	}
	var key = '', ta = [];
	var rgex3 = new RegExp('^([\\w ]+?,)(.+)$')
	for(var n = 0, nl = fa2.length; n < nl; n++){
		var s = fa2[n]+'';
		var ma = s.match(rgex3) || [,];
		var ms = ma[1]+'';
		var mp = ms;
		var sortAct = function(k){
			pr[k].act.sort();
//			if(op) pr[k].act.reverse();
			return pr[k].act;
			}
		if(ms.indexOf('Map,') > -1){
			if(key.length > 0) {
				ta = ta.concat(sortAct(key));
				ta.push([]);
			}
			key = ma[2];
			ta.push(s.replace(ma[2],pr[ma[2]].type).replace('Map,', '▼').replace(/&quot;/g,'"'));
		} else {
			if(op) {
				ms = ms.replace('S', 'S').replace(/U/g, '↑').replace(/D/g, '↓').replace(/L/g, '←').replace(/R/g, '→')
					.replace('u', 'W↑').replace('d', 'W↓').replace('1', 'L').replace('2', 'M').replace(',', '\t');
			} else {
				ms = ms.replace(/ /g, '　+　').replace('ctrl', 'CTRL').replace('alt', 'ALT').replace('shift', 'SHIFT');
				ms.length > 10 ? ms = ms.replace(',', '\t') : ms = ms.replace(',', '\t\t');
			}
			if(s.length) pr[key].act.push(s.replace(mp,ms).replace(/&quot;/g,'"'));
		}
	}
	ta = ta.concat(sortAct(key));
	var tt = op ? 'マウスジェスチャ設定' : 'キーバインド設定';
	vcx.setResPaneText(ta.join('\n'), tt, true);
}
createMyMap(parseInt(option));
// ----- 前の行まで -----