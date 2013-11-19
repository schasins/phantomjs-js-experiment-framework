var urls = ["http://google.com", "http://facebook.com", "http://cnn.com"];
var counter = 0;

function run(index, callback) {
    var page = require('webpage').create();
    page.open(urls[index], function (status) {
        if (status === 'fail') {
            console.log('Unable to access network');
        } else {
			var title = page.evaluate(function () {
                return document.title;
            });
            console.log("-------------");
            console.log(urls[index]);
            console.log(title);
        }
        page.release();
        callback.apply();
    });
}

function process() {
    if (counter < urls.length) {
        counter += 1;
        run(counter-1, process);
    } else {
        phantom.exit();
    }
}

process();
