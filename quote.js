//【登録場所】 レス表示
//【ラベル】このレスにレス［本文引用］
//【内　容】レス番右クリの”このレスにレス［本文引用］”をそのレスの右クリ、或いはマウスジェスチャから行えるようにする
//【コマンド】 $SCRIPT quote.js
//【スクリプト】
v2c.context.insertToPostMessage('>>'+v2c.context.res.number+'\n> '+v2c.context.res.message.replaceAll('\n(?!$)','\n> ')+'\n');

//引用後の空白改行がいらない場合は以下を
//v2c.context.insertToPostMessage('>>'+v2c.context.res.number+'\n> '+v2c.context.res.message.replaceAll('\n(?!$)','\n> '));
