
 //data:{nodes:nodes,edges:edges}
 //node: {id: 1,  value: 2,  label: 'Algie' }
 //edge: {from: 2, to: 8, value: 3, title: '3 emails per week'},
function createNodes(data, nameTag, valueTag){
	var result = {
		data:[],
		map:{}
	}
	for(var i=0,t;t=data[i];i++){
		result.data.push({id:i+1,value:t[valueTag],label:t[nameTag]});
		result.map[t[nameTag]] = i+1;
	}
	return result;
}
function createEdges(data, map, fromTag, toTag, valueTag){
	var result = [];
	for(var i=0,t;t=data[i];i++){
		var from = map[t[fromTag]];
		var to = map[t[toTag]];
		result.push({from: from, to: to, value: t[valueTag], title: ''});//TODO: check function of title.
	}
	return result;
}
function getInterCityMigration(population_city, migration_city){
	var nodes = createNodes(population_city,"city","population");
	var edges = createEdges(migration_city,nodes.map,"from_city","to_city","migration");
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
					min:8,
					max:20
				}
			}
		}
	};
 	return new vis.Network(target, data, options);
}

var app;
function start(){
	app = angular.module('demoapp', ["ngResource"])
	  .controller('SlideShowController', ['$scope', "$resource", function($scope, $resource) {
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
		    	var data = getInterCityMigration($scope.population_city,$scope.migration_city);
		    	var network = draw(target,data);
		    }
		    var worker = new Worker(5);
		    function getData(url,callback){
		    	var req = $resource(url);
        		req.get(callback);
		    }
		    getData("data/population_district.json",function(res){
		    	$scope.population_district = res;
		    	worker.assert();
		    });
		    getData("data/external_migration_district.json",function(res){
		    	$scope.external_migration_district = res;
		    	worker.assert();
		    });
		    getData("data/population_city.json",function(res){
		    	$scope.population_city = res;
		    	worker.assert();
		    });
		    getData("data/external_migration_city.json",function(res){
		    	$scope.external_migration_city = res;
		    	worker.assert();
		    });
		    getData("data/migration_city.json",function(res){
		    	$scope.migration_city = res;
		    	worker.assert();
		    });


		}]);
	app.filter('reverse', function() {
	  return function(items) {
	    return items.slice().reverse();
	  };
	});
}