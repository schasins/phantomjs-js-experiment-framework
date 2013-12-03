//var func = function(a,b){return document.title+' - '+a+' - '+b;};

/*
var func = function(){
	try{var link = $('a:first');}catch(err){return "jquery not ready";}
	var first_title = document.title;
	if (link){
		//link.click();
		return link.html();
	}
	//setTimeout(function(){return first_title;},1200);
	return "no link";
};
*/

var func1 = function(){
	var link = $('a:first');
	var first_title = document.title;
	if (link){
		link.click();
		return first_title+" # "+link.text();
	}
	return "no link";
};

var func2 = function(){
    return document.title;
};
