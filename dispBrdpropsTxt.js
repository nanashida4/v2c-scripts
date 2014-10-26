//【登録場所】全体・レス表示
//【ラベル】brdprops.txt表示
//【コマンド】${SCRIPT:Fr} dispBrdpropsTxt.js
//【内容】表示しているスレの板のbrdprops.txtをスクリプトコンソールへ表示。2ch限定。
//【スクリプト】
if (v2c.context.thread.bbs.is2ch){
bd=v2c.context.thread.board;
bkey=bd.key;

savedir=v2c.saveDir;
savedirpath=savedir.getCanonicalPath();
separator=savedir.separator;


bdbrdprops=savedirpath+separator+"log"+separator+"2ch_"+separator+bkey+separator+"brdprops.txt";
v2c.println(bdbrdprops);

v2c.println(v2c.readFile(bdbrdprops));

}