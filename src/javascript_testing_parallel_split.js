/*
  requires: phantomjs, async
  usage: phantomjs-1.9.2-linux-i686/bin/phantomjs src/javascript_testing_parallel_split.js inputFile javaScriptFile outputFile start end
*/

var fs = require('fs'),
system = require('system'),
async = require('async');

if (system.args.length < 6) {
    console.log('Usage: javascript_testing_parallel_split.js inputFile javaScriptFile outputFile start end');
    phantom.exit(1);
}

var id = system.args[6];
var inputFile = system.args[1];
var javaScriptFile = system.args[2];
var outputFile = system.args[3] + id + ".csv";
var start = system.args[4];
var end = system.args[5];
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
    rows = rows.slice(start,end); //only do the segment we're supposed to do
}

//Input 2

var javaScriptFunction = '',
input2 = null;
try {
    input2 = fs.open(javaScriptFile, "r");
    javaScriptFunction = input2.read();
} catch (e) {
    console.log(e);
    console.log("Failed to open second input file: "+javaScriptFile);
}
if (input2) {
    input2.close();
}

//Output

var result = "";

//Execution

function run(row,callback){
    var t0 = (new Date()).getTime();
    var page = require('webpage').create();
    page.settings.resourceTimeout = 10000; // 10 seconds
    page.onResourceTimeout = function(e) {
	// console.log(e.errorCode);   // it'll probably be 408 
	// console.log(e.errorString); // it'll probably be 'Network timeout on resource'
	// console.log(e.url);         // the url whose request timed out
	console.log(e.url + ';' + 'timeout')
	result+=(url + ';' + 'timeout' + eol);
	// whatever else we might want to do on a failure?
        page.release();
        callback();
    };
    var t1 = (new Date()).getTime();
    for(var j = 1; j < row.length; j++){
	row[j] = "'"+row[j]+"'";
    }
    var argString = row.slice(1,row.length).join(",");
    
    var url = row[0];
    if (!url.startsWith("http")){url = "http://"+url;}
    page.open(url, function (status) {
        if (status === 'fail') {
            //console.log('Unable to access network');
	    console.log(url + ';' + 'Unable to access network')
	    result+=(url + ';' + 'Unable to access network' + eol);
        } else {
	    var t2 = (new Date()).getTime();
	    if(loadJquery){page.injectJs('resources/jquery-1.10.2.min.js');}
	    var ans = page.evaluate("function(){"+javaScriptFunction+" return func("+argString+");}");
	    var t3 = (new Date()).getTime();
	    //console.log(ans);
	    console.log(url + ';' + ans)
	    result+=(url + ';' + ans + ';' + (t1-t0) + ';' + (t2-t1) + ';' + (t3-t2) + eol);
        }
        page.release();
        callback();
    });
}

function finish(err){
    //console.log("Time: "+((new Date()).getTime()-startTime));
    var output = null;
    try {
    	output = fs.open(outputFile, "a");
    	// console.log(result);
    	output.write(result);
    	output.close();
    } catch (e) {
    	console.log(e);
    	console.log("Failed to open output file.");
    }
    phantom.exit();
    return;
}

try {
    output = fs.open(outputFile, "w");
    output.close();
} catch (e) {
    console.log(e);
    console.log("Failed to open output file.");
}
startTime = (new Date()).getTime();
async.each(rows,run,finish);
