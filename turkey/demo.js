
 //data:{nodes:nodes,edges:edges}
 //node: {id: 1,  value: 2,  label: 'Algie' }
 //edge: {from: 2, to: 8, value: 3, title: '3 emails per week'},
function createNodes(data, nameTag, valueTag){
	var result = {
		data:[],
		map:{}
	}
	for(var i=0,t;t=data[i];i++){
		result.data.push({id:i+1,value:t[valueTag],label:t[nameTag],physics:false});
		result.map[t[nameTag]] = i+1;
	}
	return result;
}
function createEdges(data, map, fromTag, toTag, valueTag,maxEdges,city){
	var result = [];
	var cityno = map[city];
	for(var i=0,t;t=data[i];i++){
		var from = map[t[fromTag]];
		var to = map[t[toTag]];
		var value = t[valueTag]*1;
		var title = (from==to?("Internal migration: "+value):('From '+t[fromTag]+" to "+t[toTag]+": "+value));
		if(cityno==from||cityno==to||city==undefined)
			result.push({from: from, to: to, value: value, title:title});//TODO: check function of title.
			
	}
	var sr = result.sort(function(a,b){
		return (a.value<b.value?1:-1);
	})
	return sr.slice(0,maxEdges);
}
function getInterCityMigration(population_city, migration_city,city){
	var nodes = createNodes(population_city,"city","population");
	var edges = createEdges(migration_city,nodes.map,"from_city","to_city","migration",100,city);
	return {
		nodes:nodes.data,
		edges:edges
	}
}
function getIntraCityMigration(population_city, migration_city,city){
	var d = [];
	for(var i=0,p;p=population_city[i];i++){
		if(p.address_city==city) d.push(p);
	}
	var nodes = createNodes(d,"address_district","count");
	var m = [];
	for(var i=0,p;p=migration_city[i];i++){
		if(p.from_city==city&&p.to_city==city) m.push(p);
	}
	var edges = createEdges(m,nodes.map,"from_district","to_district","migration",40,undefined);
	return {
		nodes:nodes.data,
		edges:edges
	}
}
function draw(target, data){
 	var options = {
		nodes: {
			shape: 'dot',
			scaling:{
				label: {
					min:5,
					max:25
				}
			}
		}
	};
 	return new vis.Network(target, data, options);
}

var app;
function start(){
	var $scope = {};
	var Worker = function(limit){
    	this.limit = limit;
    	this.count = 0;
    	return this;
    }
    Worker.prototype.assert = function(){
		this.count++;
    	if(this.count<this.limit) return;
    	this.run();
    }
    Worker.prototype.run = function(){
    	var target = $(".migrationMap")[0];
    	var data = getInterCityMigration($scope.population_city,$scope.migration_city,$scope.city);
    	console.log(data);
    	var network = draw(target,data);
    }
    var worker = new Worker(5);
    
    getData("data/population_district.json",function(res){
    	$scope.population_district = res;
    	worker.assert();
    });
    getData("data/internal_migration_district.json",function(res){
    	$scope.internal_migration_district = res;
    	worker.assert();
    });
    getData("data/population_city.json",function(res){
    	$scope.population_city = res;
  		fillList(res,$("#cityselection"),"city","population",setCity);
    	worker.assert();
    });
    getData("data/external_migration_district.json",function(res){
    	$scope.external_migration_district = res;
    	worker.assert();
    });
    getData("data/migration_city.json",function(res){
    	$scope.migration_city = res;
    	worker.assert();
    });
    function setCity(city){
		$scope.city = city;
		worker.assert();
		if(city!=undefined){
			var target = $(".internalMigrationMap")[0];
	    	var data = getIntraCityMigration($scope.population_district,$scope.internal_migration_district,$scope.city);
	    	console.log(data);
	    	var network = draw(target,data);
		}
	}
	function getData(url, callback){
		$.get(url, function(data, status){
			if(data.constructor === String)
	        	return callback(JSON.parse(data));
	        else return callback(data);
	    });
	}
	function fillList(data, target, namaTag,infoTag, callback){
		var label = target.find(".selection");
		var list = target.find(".list");
		function getFnc(val){
			return function(){
				label.html(val);
				callback(val);
			}
		}
		list.append('<li><a href="#">Clear filter</a></li>').children().last().find("a").on("click",getFnc());
		for(var i=0,l;l=data[i];i++){
			list.append('<li><a href="#">'+l[namaTag]+' ('+l[infoTag]+')</a></li>').children().last().find("a").on("click",getFnc(l[namaTag]));
		}
	}
    /*
	app = angular.module('app', ["ngRoute", "ngResource"])
	  .controller('DemoController', ['$scope', "$resource", function($scope, $resource) {
		    
		    function getData(url,callback){
		    	var req = $resource(url);
        		req.get(callback);
		    }

		}]);
	app.filter('reverse', function() {
	  return function(items) {
	    return items.slice().reverse();
	  };
	});
	*/
}