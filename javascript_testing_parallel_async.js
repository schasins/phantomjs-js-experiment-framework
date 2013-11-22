/*
    requires: phantomjs, async
    usage: phantomjs-1.9.2-linux-i686/bin/phantomjs javascript_testing_parallel_async.js 
*/

var fs = require('fs'),
    system = require('system'),
    async = require('async');

var inputFile = "resources/input2.csv";
var javaScriptFunction = "var func = function(a,b){return document.title+' - '+a+' - '+b;};";
var outputFile = "resources/output.csv";

var startTime;

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

//Input 1
var content = '',
    input = null,
    lines = null,
    eol = system.os.name == 'windows' ? "\r\n" : "\n";
try {
    input = fs.open(inputFile, "r");
    content = input.read();
} catch (e) {
    console.log(e);
	console.log("Failed to open input file.");
}
if (input) {
    input.close();
}

var rows = [];
if (content) {
    lines = content.split(eol);
    for (var i = 0, len = lines.length; i < len; i++) {
		row = lines[i].split(',');
        rows.push(row);
    }
}

//Output
var output = null;
try {
    output = fs.open(outputFile, "w");
} catch (e) {
    console.log(e);
    console.log("Failed to open output file.");
}
		
//Execution

function run(row,callback){
	var page = require('webpage').create();
	for(var j = 1; j < row.length; j++){
		row[j] = "'"+row[j]+"'";
	}
	var argString = row.slice(1,row.length).join(",");
	
	var url = row[0];
	if (!url.startsWith("http")){url = "http://"+url;}
    page.open(url, function (status) {
        if (status === 'fail') {
            console.log('Unable to access network');
        } else {
			var ans = page.evaluate("function(){"+javaScriptFunction+" return func("+argString+");}");
			output.write(ans+eol);
        }
        page.release();
        callback();
    });
}

function finish(err){
	console.log("Time: "+((new Date()).getTime()-startTime));
	output.close();
	phantom.exit();
	return;
}

startTime = (new Date()).getTime();
async.each(rows,run,finish);
