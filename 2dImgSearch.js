//【登録場所】リンク
//【ラベル】二次元画像詳細検索
//【内容】二次元画像詳細検索（http://www.ascii2d.net/imagesearch）の検索結果を表示
//【コマンド】${SCRIPT:S} 2dImgSearch.js

ImgSearch();
function ImgSearch(){
	var s = '';
	var vcx = v2c.context;
	if(!vcx.link) return;
	
	// multipart/form-data
	var data =
	'-----------------------------8ageo9rchef0\r\n' +
	'Content-Disposition: form-data; name="uri"\r\n' +
	'\r\n' +
	vcx.link + '\r\n' +
	'-----------------------------8ageo9rchef0\r\n' +
	'Content-Disposition: form-data; name="commit"\r\n' +
	'\r\n' +
	'検索\r\n' +
	'-----------------------------8ageo9rchef0--\r\n';
	
	// Java String に変換
	data = new java.lang.String(data);
	
	// デバッグ用
	v2c.print('post data =\n' + data);
	v2c.print('\nend of data\n\n通信開始…');
	
	var hr = v2c.createHttpRequest('http://www.ascii2d.net/imagesearch/search',data);
	
	// Content-Type以外要らないかも
	hr.setRequestProperty('Host','www.ascii2d.net');
	hr.setRequestProperty('Connection','keep-alive');
	hr.setRequestProperty('Content-Length',data.length() );
	hr.setRequestProperty('Cache-Control','max-age=0');
	hr.setRequestProperty('Origin','http://www.ascii2d.net');
//hr.setRequestProperty('User-Agent','V2C Script');
	hr.setRequestProperty('Content-Type','multipart/form-data; boundary=---------------------------8ageo9rchef0');
	hr.setRequestProperty('Accept','text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
	hr.setRequestProperty('Referer','http://www.ascii2d.net/imagesearch');
//hr.setRequestProperty('Accept-Encoding','gzip,deflate,sdch');
	hr.setRequestProperty('Accept-Language','ja,en-US;q=0.8,en;q=0.6');
	hr.setRequestProperty('Accept-Charset','utf-8;q=0.7,*;q=0.3');

	var html = hr.getContentsAsString();	
	
	// 200の場合はエラー理由がサイト側で表示されている
	if(hr.responseCode==200||hr.responseCode==302){
		v2c.println('HTTP '+hr.responseCode+' success!');
		if(hr.responseCode==302){
			var newUrl = hr.getResponseHeader('Location');
			v2c.println('new url:'+newUrl);
			var html = v2c.readURL(newUrl);
		}
		
		if(html.match(/(<div class='content'>[^]+?)<div class='right_info'>/i)){
			s = RegExp.$1;
			// 相対パスを絶対パスに置き換え
			s = s.replace(/<img src="(\/[^"]+)/ig,'<img src="http://www.ascii2d.net$1');
		} else {
			s = 'HTML解析エラー';
		}		
	} else {
		v2c.println('HTTP '+hr.responseCode+' failed.');
		v2c.print(hr.allResponseHeaders);
		s = '通信エラー';
	}
	
	vcx.setPopupHTML('<html><body>'+s+'</body></html>');
}