var lineDelimiters = {
	cr:{
		latex:/[\n]+/,
		key:"\n",
	},
	crcf:{
		latex:/[\r\n]+/,
		key:"\r\n",
	},
	cf:{
		latex:/[\r]+/,
		key:"\r",
	}
}
var defaultOpts = {
	type:"ini",
	textQuote:"\"",
	arrayDelimiter:",",
	lineEndDelimiter:"cr"
	}
var parser = function(options){
	for(var i in defaultOpts)
		this[i] = defaultOpts[i];
	this.setOptions(options);
	}

parser.prototype.setOptions = function(options){
	for(var i in options)
		this[i] = options[i];
	this.setLineDelimiters(options.lineEndDelimiter);
	}

parser.prototype.setLineDelimiters = function(ld){
	if(!ld) return;
	this.lineEndDelimiter = lineDelimiters[ld].latex;
	this.linebreak = lineDelimiters[ld].key;
}

parser.prototype.showFileDialog = function(target) {
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
	    var output = [];
	    for (var i = 0, f; f = files[i]; i++) {
	        var ext=f.name.split(".");
	        if(ext[ext.length-1].toLowerCase()==tmp.type)
	        	output.push('<li role="presentation" ind="'+i+'"><a href="#">', escape(f.name), '<span class="glyphicon glyphicon-chevron-right"></span>\
	        	<span class="optionVal" style="max-width: 70%;">(', f.type || 'n/a', ') - ',f.size, ' bytes, last modified: ',
	                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
	                  '</span></a></li>');
	    }
	    var fs = list.html('<ul class="nav nav-pills nav-stacked col-xs-12">' + output.join('') + '</ul>')
	    	.children().last().children().attr("style","background-color: #F0F8FF;");
	    fs.each(function(){
	    	var file = files[$(this).attr("ind")*1];
	    	$(this).on("click",function(){
	    		var reader = new FileReader();
			    reader.onload = function(e){
			    	var obj = tmp.parseFile(e);
			    	tmp.parent.find(".fileoutput").html("<pre>"+JSON.stringify(obj,undefined,2)+"</pre>");
			    	}
			    reader.readAsText(file);
	    	})
	    });
	    
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
	};

parser.prototype.parseFile = function(file){
	return this.parse(file.target.result);
	}

parser.prototype.parse = function(fileText){
	switch(this.type.toLocaleLowerCase()){
		case "ini":
			return this.parseINI(fileText);
		case "csv":
			return this.parseCSV(fileText);
		case "xml":
			return this.parseXML(fileText);
		case "json":
			return JSON.parse(fileText);
		default:
			return {error:"Unknown file type."};
		}
	}

parser.prototype.parseINI = function(fileText){
	var obj ={};
	var f1=fileText.split("["); //f1:objectname and attributes
	for(var i=1;i<f1.length;i++){
		var f2 = f1[i].split("]");//f2[0]: object name, f2[1]:object attrs
		var objName = this.removeSpecialChars(f2[0]);
		var params = f2[1];
		obj[objName]={};
		var sobj = obj[objName];
		var attr = params.split(this.lineEndDelimiter);
		for(var ii=0;ii<attr.length;ii++){
			var cattr = attr[ii].split(";")[0].split("=");
			if(cattr.length>1) sobj[cattr[0]] = cattr[1];
		}
	}
	return obj;
	}

parser.prototype.parseCSV = function(fileText){
	var array = [];
	var lines = fileText.split(this.lineEndDelimiter);
	var titles = lines[0].split(this.valueDelimiter);
	for(var i in lines)
		if(i*1){
			var vals = lines[i].split(this.valueDelimiter);
			var nobj = {};
			for(var ii in vals)
				nobj[titles[ii]] = vals[ii];
			if(vals.length>1) array.push(nobj);
		}
	return array;
	}

parser.prototype.parseXML = function(fileText){
	if (window.DOMParser)
	  {
	  Dparser=new DOMParser();
	  xmlDoc=Dparser.parseFromString(fileText,"text/xml");
	  }
	else // Internet Explorer
	  {
	  xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
	  xmlDoc.async=false;
	  xmlDoc.loadXML(fileText); 
	  }
	  var doc = this.parseXMLDoc(xmlDoc.children);
	  console.log(doc);

	  return doc;
	}
parser.prototype.parseXMLDoc = function(xd){
	if(xd.length>1){
		var list = [];
		for(var i in xd){
			var newObj = {};
			var attr = xd[i].attributes;
			for(var ii in attr){
				var nn = attr[ii].name;
				if(nn){
					newObj[nn] = attr[ii].value; 
					}
				}
			var ch = xd[i].children;
			for(var k in ch){
				var name = ch[k].tagName;
				if(ch[k].children&&ch[k].children.length)
					newObj[name] = this.parseXMLDoc(ch[k].children);
				else newObj[name] = ch[k].innerHTML;
				}
			list.push(newObj);
			}
		return list;
		}
		else if(xd.length==1){
			var list = {};
			list[xd[0].tagName] = this.parseXMLDoc(xd[0].children);
			return list;
		}
		else return {};

		
}

parser.prototype.convert = function(obj){
	switch(this.type.toLocaleLowerCase()){
		case "ini":
			return this.toINI(obj);
		case "csv":
			return this.toCSV(obj);
		case "xml": 
			return ('<?xml version="1.0"?>\n' + this.toXML(obj));
		case "json":
			return this.toJSON(obj);
		default:
			return "Unknown Format.";
	}
	}

parser.prototype.toINI = function(obj){
	if(this.iniJsonValidater(obj) == false)
		return "Object is not INI-convertible.";
	var txt = "";
	for(var i in obj){
		txt += "[";
		txt += i;
		txt += "]";
		txt += this.linebreak;
		for(var ii in obj[i]){
			txt += (ii + "=");
			switch(obj[i][ii].constructor){
				case Number:
					txt += obj[i][ii].toString();
					break;
				case Array:
					txt += JSON.stringify(obj[i][ii]);
					break;
				case String:
					txt += obj[i][ii];
					break;
				case Object:
				default:
					txt += "Nested Objects are not supported.";
					break;
				}
			txt += this.linebreak;
		}

	}
	return txt;
	}

parser.prototype.toCSV = function(obj){
	if(this.csvJsonValidater(obj))
		return "Object is not csv-convertable.";
	var toControlledString = new Function;
	toControlledString = function(val){
		switch(val.constructor){
			case String:
				return (this.textQuote+val+this.textQuote);
			case Number:
				return val.toString();
			case Array:
				str = "";
				if(!val.length) return "";
				for(var i in val)
					str += (this.arrayDelimiter+toControlledString(val[i]));
				return str.substring(0,str.length-1);
			}
		}
	var str = "";
	if(obj.length)
		for(var i in obj[0])
			str += toControlledString(i);
		str = str.substring(0,str.length-1);
		str += this.linebreak;
	for(var i in obj){
		for(var ii in obj[i]){
				str += toControlledString(obj[i][ii]);
				str += this.valueDelimiter;
			}
		str = str.substring(0,str.length-1);
		str += this.linebreak;
		}
	return str;
	}

parser.prototype.toXML = function(obj){
	var str ='';
	switch(obj.constructor){
		case Number:
			return obj.toString();
			break;
		case String:
			return obj;
			break;
		case Array:
			for(var i in obj)
				if(obj[i].constructor === Object)
					str += "\n"+this.toXML(obj[i]);
				else str += this.toXML(obj[i])+",";
			return str.substring(0,str.length-1);
			break;
		case Object:
			for(var i in obj){
				if(obj[i].constructor === Object) str += "<"+i+">\n"+this.toXML(obj[i])+"\n</"+i+">\n";
				else str += "<"+i+">"+this.toXML(obj[i])+"</"+i+">\n";
			}
			return str;
			break;
	}
	}

parser.prototype.toPrettyJSON = function(obj){
	return JSON.stringify(obj,undefined,2);
	}
parser.prototype.toJSON = function(obj){
	return JSON.stringify(obj);
}
parser.prototype.iniJsonValidater = function(obj){
	if(obj.constructor === Object){
		for(var i in obj){
			if(obj[i].constructor === Object){
				for(var ii in obj[i]){
					if(obj[i][ii].constructor === Number){}
					else if (obj[i][ii].constructor === String){}
					else if (obj[i][ii].constructor === Array){
						if(this.isNonObjectArray(obj[i[ii]])){}
						}
					else return false;
					}
				}
			else return false;
			}
		}
	else return false;
	return true;
	}

parser.prototype.isNonObjectArray = function(array){
	for(var i in array)
		switch(array[i].constructor){
			case Object:
				return false;
				break;
			case Array:
				if(this.isNonObjectArray(array[i]) == false)
					return false;
				break;
			}
	return true;
	}

parser.prototype.csvJsonValidater = function(obj){
	if(obj.constructor === Array){
		for(var i in obj){
			if(obj[i].constructor === Object){
				for(var ii in obj[i][ii]){
					switch(obj[i][ii]){
						case Object:
							return false;
						case Array:
							if(!this.isNonObjectArray(obj[i][ii]))
								return false;
						}
					}
				}
			else return false;
			}
		}
	else return false;
	return true;
	}



parser.prototype.removeSpecialChars = function(text){
	var newt = "";
	for(var i = 0;i<text.length;i++){
		if(text.charCodeAt(i)>43 && text.charCodeAt(i)<123) newt += text[i];
	}
	return newt;
}