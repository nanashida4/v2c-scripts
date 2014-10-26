【登録場所】リンク、URLExec
【ラベル】Tweetのポップアップ
【内容】Tweetのポップアップ
【コマンド  API版】${SCRIPT:Fr} popupTweet.js
【コマンド HTML版】${SCRIPT:FrS} popupTweetAPI.js
【URLExec API版】https?://twitter\.com/(?:#!/)?[^/]+?/status/\d+	$&	${V2CSCRIPT:FrS} popupTweetAPI.js
【URLExec HTML版】https?://twitter\.com/(?:#!/)?[^/]+?/status/\d+	$&	${V2CSCRIPT:Fr} popupTweet.js

【概要】
http://twitter.com/アカウント名/status/数字 の形式のツイート(特定の一つのツイート)をポップアップします。
リンクを右クリック、リンクにマウスオーバーで実行可能なスクリプトです。

【スクリプトファイル】
popupTweet.js    : htmlから情報を取得
popupTweetAPI.js : API経由で情報を取得

主な機能は同じです。
API版は以下の制限がありますが、html版より多少高速です。
・時間辺りのアクセス回数制限がある(150回/h　今後仕様変更される可能性あり）
・リツイート人数がうまく反映されない(ポップアップ上では0と表示される)


【使い方】
popupTweet.js もしくはpopupTweetAPI.jsと popupTweet フォルダをV2C保存用フォルダの scriptフォルダに配置してください。
・リンクを右クリックから実行する場合は、上記【ラベル】と【コマンド】をV2Cの外部コマンド設定から登録してください
・マウスオーバーで実行する場合は、V2C保存用フォルダのURLExec2.datに、【URLExec】を追加してください
・URLExec2.dat が無ければテキストファイルを新規作成し、【URLExec】を書き込み保存して、ファイルをURLExec2.datにリネームします。

読み込みに多少時間がかかる場合があります。
通信中はステータスバーに「popupTweet通信中...」と表示されます。

ポップアップのレイアウトは、popupTweetフォルダ内のtemplate.txtのHTMLを書き換えることで変更可能です。
template.txtに使える変数はparameter.txt参照してください。

--20101107