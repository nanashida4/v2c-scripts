//【登録場所】 レス表示
//【ラベル】キャッシュ済みの画像を保存
//【内容】スレッド内の表示されているすべてのレスに含まれる、キャッシュ済みの画像を保存します。
//        同じリンクが複数あった場合もすべて保存します。
//【コマンド】 ${SCRIPT:Frw} SaveImages.js
//【更新日】 2013/10/03
//【元URL】 http://yy61.60.kg/test/read.cgi/v2cj/1365215326/176,178
//【スクリプト】 
// ----- 次の行から -----

var options = {
	// 保存先のディレクトリを指定
	// 空文字列の場合は、<v2c.saveDir>/userdata/imagesに保存されます。
	saveDirectory: "",
	// {0}: レス番号, {1}: レス内の画像index, {2}: 画像のファイル名
	fileNameFormatString: "{0}_{1}_{2}"
};

var util = (function() {
	var scriptName = "SaveImages.js";

	var format_ = function(formatString, args) {
		if(!formatString || typeof formatString !== "string")
				throw "引数 formatString を指定してください。";

		return formatString.replace(/\{(\d)\}/g, function(m, c) {
			return args[parseInt(c)];
		});
	};
	return {
		println: function(formatString /*, ...*/) {
			var message = format_(formatString, Array.prototype.slice.call(arguments, 1));
			v2c.println("[" + scriptName + "] " + message);
		},
		format: function(formatString /*, ...*/) {
			return format_(formatString, Array.prototype.slice.call(arguments, 1));
		}
	};
})();

function getFilteredResponses() {
	var thread = v2c.context.thread;
	return Array.map(v2c.context.filteredResIndex, function(x) { return thread.getRes(x); });
}

function repeat(s, count) {
	return new Array(count + 1).join(s);
}
function padLeft(x, ch, count) {
	return (repeat(ch, count) + x).slice(-count);
}

function formatFileName(resIndex, n, count, original) {
	return util.format(options.fileNameFormatString,
		padLeft(resIndex, '0', 4),
		padLeft(n, '0', String(count).length),
		original);
}

function escape(s) {
	return ('' + s).replace(/(?:\\|\/|\:|\*|\?|\"|<|>|\|)/g, '_');
}

var th = v2c.context.thread;
var saveDirectoryRoot = options.saveDirectory
	|| v2c.saveDir.getPath() + "/userdata/images";
var saveDirectory = new java.io.File(saveDirectoryRoot,
	util.format("{0}/[{1}] {2}", th.board.key, th.key, escape(th.title)));

var images = getFilteredResponses()
	.reduce(function(a, x) {
		var imageLinks = x.links.filter(function(x) {
			return x.type_IMAGE && x.imageCacheFile;
		});

		return a.concat(imageLinks.map(function(link, i) {
			var originalName = java.nio.file.Paths.get(link.url.getPath()).getFileName();

			return {
				res: x,
				imageIndex: i,
				imageLink: link,
				fileName: formatFileName(x.number, i + 1, imageLinks.length, originalName)
			};
		}));
	}, []);

if(0 < images.length) {
	if(!saveDirectory.exists()) {
		if(!saveDirectory.mkdirs())
			throw '保存先ディレクトリの作成に失敗しました。';
	}

	images.forEach(function(x) {
		var destFile = new java.io.File(saveDirectory, x.fileName);
		var path = destFile.getPath();
		if(destFile.exists()) {
			util.println("既にファイルが存在するため、この項目を無視します: {0}", path);
			return;
		}

		if(!v2c.copyFile(x.imageLink.imageCacheFile, path)) {
			util.println("保存に失敗しました: {0}",　path);
			return;
		}
		
		//util.println("保存しました: {0}",　path);
	});

	v2c.context.setStatusBarText("[SaveImages.js] 完了しました。");
} else {
	v2c.context.setStatusBarText("[SaveImages.js] このスレッドにはキャッシュ済みの画像はありません。");
}