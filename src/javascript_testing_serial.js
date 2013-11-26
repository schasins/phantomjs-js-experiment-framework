var inputFile = "resources/input2.csv";
var javaScriptFile = "resources/titleExtractor.js";
var outputFile = "resources/output.csv";
var loadJquery = true;

var startTime;

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

var fs = require('fs'),
    system = require('system');

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

var counter = 0;

function run(index, callback) {
    var page = require('webpage').create();
    row = rows[index];
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
			if(loadJquery){page.injectJs('jquery-1.10.2.min.js');}
			var ans = page.evaluate("function(){"+javaScriptFunction+" return func("+argString+");}");
			console.log(ans);
			output.write(ans+eol);
        }
        page.release();
        callback.apply();
    });
}

function rowProcessing() {
    if (counter < rows.length) {
        counter += 1;
        run(counter-1, rowProcessing);
    } else {
		console.log("Time: "+((new Date()).getTime()-startTime));
		output.close();
        phantom.exit();
    }
}

startTime = (new Date()).getTime();
rowProcessing();
