/*
  requires: phantomjs, async
  usage: phantomjs-1.9.2-linux-i686/bin/phantomjs javascript_testing_parallel_async.js 
*/

var fs = require('fs'),
system = require('system'),
async = require('async');

var inputFile = "resources/input.csv";
var javaScriptFile = "resources/javaScript.js";
var outputFile = system.args[1];
var loadJquery = false;

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

//Input 2

var javaScriptFunction = '',
input2 = null;
try {
    input2 = fs.open(javaScriptFile, "r");
    javaScriptFunction = input2.read();
} catch (e) {
    console.log(e);
    console.log("Failed to open second input file.");
}
if (input2) {
    input2.close();
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
    var t0 = (new Date()).getTime();
    var page = require('webpage').create();
    var t1 = (new Date()).getTime();
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
	    var t2 = (new Date()).getTime();
	    if(loadJquery){page.injectJs('resources/jquery-1.10.2.min.js');}
	    var ans = page.evaluate("function(){"+javaScriptFunction+" return func("+argString+");}");
	    var t3 = (new Date()).getTime();
	    console.log(ans);
	    output.write(url + ';' + ans + ';' + (t1-t0) + ';' + (t2-t1) + ';' + (t3-t2) + eol);
        }
        page.release();
        callback();
    });
}

function finish(err){
    var t = (new Date()).getTime()-startTime;
    output.write("TOTAL;" + t);
    output.close();
    phantom.exit();
    return;
}

output.write('url;title;start-up;load;execute' + eol);
startTime = (new Date()).getTime();
async.each(rows,run,finish);
