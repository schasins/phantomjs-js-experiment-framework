/*
    requires: phantomjs, async
    usage: phantomjs-1.9.2-linux-i686/bin/phantomjs javascript_testing_parallel_split.js inputFile javaScriptFile outputFile start end
*/

var fs = require('fs'),
    system = require('system'),
    async = require('async');
    
if (system.args.length < 6) {
    console.log('Usage: javascript_testing_parallel_split.js inputFile javaScriptFile outputFile start end');
    phantom.exit(1);
}

var inputFile = system.args[1];
var javaScriptFile = system.args[2];
var outputFile = system.args[3];
var start = system.args[4];
var end = system.args[5];
var loadJquery = true;

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

var javaScriptFunctions = '',
    input2 = null;
try {
    input2 = fs.open(javaScriptFile, "r");
    javaScriptFunctions = input2.read();
} catch (e) {
    console.log(e);
	console.log("Failed to open second input file: "+javaScriptFile);
}
if (input2) {
    input2.close();
}

var functions = 0;
while(true){
	if(javaScriptFunctions.indexOf("var func"+(functions+1)) > -1){
		functions+=1;
	}
	else{
		break;
	}
}
console.log("functions: "+this.functions);

//Output

var result = "";
		
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
        
        	var loadInProgress = false;
        	
    	    page.onLoadStarted = function() {
			  loadInProgress = true;
			  console.log("load started");
			};
			
			page.onLoadFinished = function() {
			  loadInProgress = false;
			  console.log("load finished");
			};
			
			if(loadJquery){page.injectJs('resources/jquery-1.10.2.min.js');}
        
        	for (var i = 0; i<functions; i++){
        	    //console.log("f: "+(i+1));
				//continually check whether page is loaded until it is and we can run the function
				setInterval(function(){
					if (!loadInProgress) {
					    try{
						var ans = page.evaluate("function(){"+javaScriptFunction+" return func"+(i+1)+"("+argString+");}");
						//console.log(ans);
						output.write(ans+eol);
						clearInterval();
						//console.log("ran");
						}catch(err){console.log("no run");}
					}
					else{
					   //console.log("waiting to run");
					}
				}, 50);
				
        	}
        }
        page.release();
        callback();
    });
}

function finish(err){
	console.log("Time: "+((new Date()).getTime()-startTime));
	//Output
	var output = null;
	try {
		output = fs.open(outputFile, "a");
	} catch (e) {
		console.log(e);
		console.log("Failed to open output file.");
	}
	console.log(result);
	output.write(result);
	output.close();
	phantom.exit();
	return;
}

startTime = (new Date()).getTime();
async.each(rows,run,finish);
