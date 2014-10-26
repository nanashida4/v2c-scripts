//【登録場所】全体、レス表示 ※キーバインドは「全体」のみ可
//【ラベル】（次の|前の|この）被参照と参照レスを抽出
//【内容】アクション対象、または最初の被参照と参照レスを抽出、その抽出状態から（前|次）の被参照と参照レスを抽出
//【コマンド1】$SCRIPT viewRefRes.js //(次の|この）被参照と参照レスを抽出
//【コマンド2】$SCRIPT viewRefRes.js prev //(前の|この）被参照と参照レスを抽出
//【補足】 デフォルトは、アクション対象レスに参照レスがあれば、対象レスから開始、なければ最初の被参照レスから開始
var From_First = false; //常に最初の被参照レスから開始
var Threshold = 1; //参照レスが閾値以上で対象

var vcx = v2c.context, res = vcx.res, th = vcx.thread;
function haveNum(a, n) {
	for(var i = 0; i < a.length; i++) {
		if(a[i] == n) return true;
	}
	return false;
}
function viewRefRes(prev) {
	var f = vcx.filteredResIndex, fl = f.length, c = th.localResCount;
	var set = function(a, b){ //a:参照レス番号Array, b:被参照レス番号
		if(b == c) {
			vcx.setStatusBarText("次の被参照レスはありません。"); return;
		} else if(b == -1) {
			vcx.setStatusBarText("前の被参照レスはありません。"); return;
		}
	vcx.setFilteredResIndex([b].concat(a)); vcx.setResIndexToJump(b);}
	var len = function(d) { return d ? d.length : 0; }
	if(fl == c) {
		var ri = res.index, r = res.refResIndex;
		if(len(r) < Threshold || From_First) {
			for(ri = 0; ri < c; ri++) {
				r = th.getRes(ri).refResIndex; if(len(r) >= Threshold) break;
			}
		if(len(r) < Threshold) {vcx.setStatusBarText("被参照レスがありません。"); return;}
		};
		set(r, ri);
	} else {
		for(var i = 0; i < f.length; i++){
			var gres = th.getRes(f[i]), gri = gres.index, gr = gres.refResIndex, grl = len(gr);
			if(fl == grl+1) {
				for(var j = 0; j < grl; j++) {
					if(!haveNum(f, gr[j])) break;
				}
				if(j == grl) {
					if(prev){
						for(var m = gri-1; m > -1; m--) {
							gr = th.getRes(m).refResIndex; if(len(gr) >= Threshold) break;
						}
						set(gr, m); break;
					} else {
						for(var n = gri+1; n < c; n++) {
							gr = th.getRes(n).refResIndex; if(len(gr) >= Threshold) break;
						}
						set(gr, n); break;
					}
				}
			}
		}
	}
}
if(res && th) { viewRefRes(vcx.args[0]+"" == "prev"); }
