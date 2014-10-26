//【登録場所】レス表示、全体
//【ラベル】人数カウント
//【内容】人数のカウント
//【コマンド】$SCRIPT countID.js
function countID() {
	var t = v2c.context.thread;
	var c = new Array;
	var i, j = 0, k = 0, l = 0, s = '';
	for ( i=0; i<t.resCount; i++ ) {
	if ( c[t.getRes(i).id] ) {
		if ( c[t.getRes(i).id] == 1 ) {
			j++;
			if ( k>0 ) k--;
		}
			c[t.getRes(i).id]++;
		}
		else {
			c[t.getRes(i).id]=1;
			k++;
		}
		l++;
	}
	//タイトル表示がいらないときは↓の行をコメントアウト
	s += t.title + '　(' + l + ')&#13;&#10;<br>';
	s += '人数：' + (j+k)  + '&#13;&#10;<br>単発：' + k + '&#13;&#10;<br>単発以外：' + j;
	v2c.context.setPopupHTML('<html><body>'+s+'</body></html>');
}
countID();
