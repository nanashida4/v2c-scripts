//【登録場所】レス表示
//【ラベル】アンカーレスにアンカー
//【内容】このレスにアンカーしているレスのすべてにアンカーレスをする
//【コマンド】$SCRIPT anchorRes.js
//【スクリプト】
// ----- 次の行から -----
function anchorRes(){
var vcx = v2c.context,res = vcx.res;
if(!res.refResIndex)return "";
var a=new Array();
var prevIndex=res.refResIndex[0];
var startIndex=prevIndex;
var seriesFlag=false;
for (var i=1;i<res.refResIndex.length;i++) {
 if (prevIndex+1==res.refResIndex[i]) {
  seriesFlag=true;
 }else{
  if(seriesFlag){
   a.push((startIndex+1)+"-"+(prevIndex+1));
  }else{
   a.push((prevIndex+1));
  }
  seriesFlag=false;
  startIndex=res.refResIndex[i];
 }
 prevIndex=res.refResIndex[i];
}
if(seriesFlag){
 a.push((startIndex+1)+"-"+(prevIndex+1));
}else{
 a.push((prevIndex+1));
}
return ">>"+a.join(",")+"\n";
}
v2c.context.insertToPostMessage(anchorRes());