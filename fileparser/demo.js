var iniOpts = {
		type:"ini",
		lineEndDelimiter:"cr"
	};
var csvOpts = {
		type:"csv",
		valueDelimiter:";",
		lineEndDelimiter:"cr"
	};
var xmlOpts = {
		type:"xml",
	};
var jsonOpts = {
	type:"json"
	}
var opts = {
	ini:iniOpts,
	csv:csvOpts,
	xml:xmlOpts,
	json:jsonOpts
}
var content = {
	left:{},
	right:{}
}
function start(){
	var els = createDialog($(".testInput"));

	return;
	var iniparser = new parser({
		type:"ini",
		lineEndDelimiter:"cr"
	});
	iniparser.showFileDialog($(".initest"));

	var csvparser = new parser({
		type:"csv",
		valueDelimiter:",",
		lineEndDelimiter:"cf"
	});
	csvparser.showFileDialog($(".csvtest"));
}
function createDialog(target){
	var els = target.append('<h2>Convert File Types</h2>\
		<div class="dialogContainer">\
		<div class="inputField col-xs-6">\
			<div class="inputSelect">\
				<div class="col-xs-6 left"></div>\
				<div class="col-xs-6 right"></div>\
			</div>\
			<div class="inputSettings"></div>\
			<div class="inputDropdown"></div>\
			<div class="inputText"></div>\
			<div class="inputSave"><button class="btn btn-primary" onclick="save(\'input\')">Save</button></div>\
		</div>\
		<div class="outputField col-xs-6">\
			<div class="outputSelect">\
				<div class="col-xs-6 left"></div>\
				<div class="col-xs-6 right"></div>\
			</div>\
			<div class="outputSettings"></div>\
			<div class="outputDropdown"></div>\
			<div class="outputText"></div>\
			<div class="outputSave"><button class="btn btn-primary" onclick="save(\'output\')">Save</button></div>\
		</div>\
		</div>').children().last();
	var elems = {
		input:{
			settings:{},
			text:{}
			},
		output:{
			settings:{},
			text:{}
			}
		};
	var forward = function(){
		var opts = JSON.parse(elems.input.settings.val());
		var text = content.left.data;
		var prs = new parser(opts);
		var obj = prs.parse(text);
		var opts1 = JSON.parse(elems.output.settings.val());
		prs.setOptions(opts1);
		var newF = prs.convert(obj);
		elems.output.text.val(newF.substring(0,1000));
		content.right.data = newF;
		content.right.type = opts1.type;
		console.log({text:text,obj:obj,out:newF});
		};
	var backward = function(){
		var opts = JSON.parse(elems.output.settings.val());
		var text = content.right.data;
		var prs = new parser(opts);
		var obj = prs.parse(text);
		var opts1 = JSON.parse(elems.input.settings.val());
		prs.setOptions(opts1);
		var newF = prs.convert(obj);
		elems.input.text.val(newF.substring(0,1000));
		content.left.data = newF;
		content.left.type = opts1.type;
		console.log({text:text,obj:obj,out:newF});
		}
	elems.input.settings = createOptionsInputBox(els.find(".inputSettings"))
	elems.input.text = createFileIOBox(els.find(".inputText"));
	createFiledropArea(els.find(".inputDropdown"),elems.input.text);
	createConversionTypeDropdown(els.find(".inputSelect>.left"),elems.input,"left")
		.title.html("Input type ");
	els.find(".inputSelect>.right").append('<button type="button" \
		class="btn btn-primary"><span class="glyphicon glyphicon-arrow-right"></span></button>').find("button").on("click",forward);

	elems.output.settings = createOptionsInputBox(els.find(".outputSettings"))
	elems.output.text = createFileIOBox(els.find(".outputText"));
	createFiledropArea(els.find(".outputDropdown"),elems.output.text);
	createConversionTypeDropdown(els.find(".outputSelect>.right"),elems.output,"right").title.html("Output type ");
	els.find(".outputSelect>.left").append('<button type="button" \
		class="btn btn-primary"><span class="glyphicon glyphicon-arrow-left"></span></button>').find("button").on("click",backward);
	return elems;
}

function createConversionTypeDropdown(target,starget,type){
	var els = target.append('<div class="btn-group filetype"><button type="button" \
		class="btn btn-primary dropdown-toggle" data-toggle="dropdown">\
		<span class="DDtitle">Action </span><span class="caret"></span></button><ul class="dropdown-menu" role="menu"></ul></div>').children();
	var ul = els.find("ul");
	var title = els.find(".DDtitle");
	var retVal = function(inp){
		return function(){
			content[type].type = opts[inp].type;
			title.html(inp+" ");
			starget.settings.val(JSON.stringify(opts[inp],undefined,2));
			starget.text.val(JSON.stringify(sample[inp],undefined,2));
			}
		}
	for(var i in opts){
		ul.append('<li><a href="#">'+i+'</a></li>')
			.children().last().on("click",retVal(i));
		}
	return {title:title,ul:ul};
}
function createOptionsInputBox(target){
	var el = target.append("<textarea class='optionsTA'></textarea>")
		.children().last();
	return el;//.on("change",function(){event(el.val()));
}
function createFileIOBox(target){
	var el= target.append("<textarea class='IOTA'></textarea>")
		.children().last();
	return el;//.on("change",function(){event(el.val()));
}

function createFiledropArea(target,textTarget) {
	if(!target) return "This method needs a target element to load UI elements.";
	else if(!$){
		target.innerHTML = "showFileDialog method depends on jQuery and Bootstrap.<br>\
		Please make sure both are configured correctly.";
		return false;
		}
	else if(target.append) target = $(target);

	this.parent = target;
	var zone = 0;
	var list = 0;
	var tmp = this;
	var handleFileSelect = function(evt){
	    evt.stopPropagation();
	    evt.preventDefault();
	    if(evt.type=="change") var files = evt.target.files;
	    else var files = evt.dataTransfer.files; // FileList object.

	    // files is a FileList of File objects. List some properties.
	    var reader = new FileReader();
	    reader.onload = function(e){
	    	textTarget.val(e.target.result.substring(0,1000));
	    	content.left.data = e.target.result;
	    	}
	    reader.readAsText(files[0]);
	    return;
	}
	var handleDragOver = function(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		}
	var handleDragEnter = function(evt){
		evt.stopPropagation();
	    evt.preventDefault();
		}

	var zone = this.parent.html('<div class="filedrop">Drop files here or \
			<input type="file" style="font-size: 16px;width: 100%;"></input></div>\
			<output id="list"></output><div class="fileoutput"></div>').children().first()[0];
	zone.addEventListener('dragover',handleDragOver,false)
	zone.addEventListener('dragenter',handleDragEnter,false)
	zone.addEventListener('drop',handleFileSelect,false);
	zone.addEventListener('change',handleFileSelect,false);
	list = this.parent.find("output");
	return target.find(".fileoutput");

}
function save(type){
	switch(type){
		case "input":
			saveFile(content.left.data,prompt("Type file name:")+"."+content.left.type);
			break;
		case "output":
			saveFile(content.right.data,prompt("Type file name:")+"."+content.right.type);
			break
	}
}
function saveFile(text,name){
	saveAs(new Blob([text], {type: "text/plain;charset=" + document.characterSet}),name);
}