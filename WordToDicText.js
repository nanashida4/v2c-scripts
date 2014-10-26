//【登録場所】 全体、レス表示
//【ラベル】 スレッド内の単語をscript\data\dat番号.txtに出力
//【内容】 『読み→語句→ユーザーコメント』の形式部分を抽出し、IME辞書に取り込めるテキストファイルに変換するスクリプト
// 　　　　『→ユーザーコメント』部分は省略可
//【コマンド】 ${SCRIPT:Frw} WordToDicText.js 0 //スレッド内の単語
//【コマンド】 ${SCRIPT:Frw} WordToDicText.js 1 //指定時間前から現在までの単語
//【スクリプト】
// ----- 次の行から -----
var vcx = v2c.context;
var option = vcx.argLine;
var today_time = 0
///////////////関数開始///////////////

function getWord(th) {
　var nr = th.localResCount;
　var bo = false;
　var ar = new Array();
　var i, j;
　re_word1 = new RegExp(/(^|\n)([@-~ー｜ぁ-ん]+→[^\n]+)/g);
　re_word2 = new RegExp(/(^|\n)([@-~ー｜ぁ-ん]+)→([^→]+)(→(.+))?/);
　for (i = 0; i < nr; i++) {
　　var rs = th.getRes(i);
　　if(rs.time > today_time){
　　　if (rs.ng == false) {
　　　　msg = String(rs.message);
　　　　a_All = msg.match(re_word1);
　　　　if(a_All != null){
　　　　　j = 0
　　　　　for(j in a_All){
　　　　　　if(a_All[j].match(re_word2)){
　　　　　　　word = RegExp.$2 + '\t' + RegExp.$3 + '\t固有名詞';
　　　　　　　if(RegExp.$5 != '') word = word + '\t' + RegExp.$5
　　　　　　　ar.push(word);
　　　　　　}
　　　　　}
　　　　}
　　　}
　　}
　}
　return ar;
}
function WordToDicText(op) {
　var th = vcx.thread;
　if(th){
　　if(op){
　　　date = new Date();
　　　var strRet = v2c.prompt('何時間前から取得するか',24);
　　　if(strRet){
　　　　var tmp_time = eval(strRet);
　　　　today_time = date.getTime() - (tmp_time*60*60*1000);
　　　}else{
　　　　return;
　　　}
　　}
　　
　　//スレッド内の単語を配列に
　　var a_word = getWord(th);
　　//出力
　　if(a_word != null){
　　　var ret_word = '!Microsoft IME Dictionary Tool\n!Version:\n!Format:WORDLIST\n\n';
　　　for(var j = 0; j < a_word.length; j++){
　　　　ret_word += a_word[j] + '\n';
　　　}
　　　//brdprops.txt読み込み
　　　var datePath = String(th.localFile);
　　　//v2c.println(datePath);
　　　var brdpropsPath = v2c.saveDir + '\\script\\data\\' + datePath.substring(datePath.lastIndexOf('\\') + 1, datePath.length-3) + 'txt';
　　　v2c.println(brdpropsPath);
　　　var f1 = new java.io.File( brdpropsPath );
　　　v2c.writeStringToFile(f1, ret_word);
　　}
　}
}
///////////////関数終了///////////////

WordToDicText(parseInt(option, 10));