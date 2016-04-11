var type = "count";
var lastname,firstname,stype="lastname";
String.prototype.capitalize = function() {
    return this.toLowerCase().charAt(0).toUpperCase() + this.slice(1);
}
function setLastname(){
  lastname = $(".lastname").val();
  stype = "lastname";
  draw(searchLastname(lastname.toUpperCase()),$(".frequencies"));
}
function setFirstname(){
  stype = "firstname";
  firstname = $(".firstname").val();
  draw(searchFirstname(firstname.toUpperCase()),$(".frequencies"));
}
function setType(t){
  type = t;
  if(stype == "lastname")
    draw(searchLastname(lastname.toUpperCase()),$(".frequencies"));
  else draw(searchFirstname(firstname.toUpperCase()),$(".frequencies"));
}
function getEntry(e){
  var total = $scope.population_city[e.c];
  return {
    "hc-key":hc_city_map[e.c.toLowerCase()],
    "value":(type=="count"?e.f*1:(100*e.f/total)),
    "value_":total*1
  }
}
function searchLastname(key){
  var res = [];
  for(var i=0,e;e=$scope.lastname_frequency_city[i];i++){
    if(e.n == key)
      res.push(getEntry(e));
  }
  return res;
}
function searchFirstname(key){
  var res = [];
  for(var i=0,e;e=$scope.firstname_frequency_city[i];i++){
    if(e.n == key)
      res.push(getEntry(e));
  }
  return res;
}

function createCityNameMap(data){
  var map = {};
  for(var i=0,d;d=data[i];i++){
    if(map[d.c]){
      if(map[d.c][d.n]){
        map[d.c][d.n] += d.f;
      }
      else{
        map[d.c][d.n] = d.f;
      }
    }
    else{
      map[d.c] = {};
      map[d.c][d.n] = d.f;
    } 
  }
  var mapa ={
    sorted:{}
  }
  /*for(var i in map){
    mapa[i] = [];
    for(var ii in map[i]){
      mapa[i].push({n:ii,f:map[i][ii]});
    }
    //mapa[i].sort(function(a,b){return (a.f>b.f?-1:1);});
  }*/
  return map;
}

function draw(data,target){
  var dataviewtype = (type=="count"?"occurrences":"frequency").capitalize();
  var name = (stype=="lastname"?lastname:firstname).capitalize();
  target.highcharts('Map', {

        title : {
            text : stype.capitalize()+' '+dataviewtype+': '+name
        },

        subtitle : {
            text : 'Source: <a href="https://github.com/ftkurt/Turkey-Migration-Name-Statistics">Turkey Migration & Name Statistics</a>'
        },

        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },

        colorAxis: {
            min: 0
        },

        tooltip:{
          formatter:function(a){
            console.log(a);
            var value = (type=="count"?this.point.value:this.point.value.toFixed(2)+"%");
            var city = hc_city_map[this.point["hc-key"]].toUpperCase();
            var text = "<strong>'" + name + "' " + dataviewtype + " in "+city.capitalize() + ": " + value + "</strong><br><strong>Top entries:</strong><br>";
            /*if(!$scope[stype].mapa.sorted[city]){
              $scope[stype].mapa.sorted[city] = true;
              $scope[stype].mapa[city].sort(function(a,b){return (a.f>b.f?-1:1);});
            }*/
            var cnt=0;
            for(var i in $scope[stype][city]){
              var c = $scope[stype][city][i];
              var value = (type=="count"?c:c.toFixed(2)+"%");
              text += "<p>" + i + ": " + value + "</p><br>";
              if(++cnt>4) break;
            }
            //$scope.city[city].sort(function(a,b){return (a.f>b.f?-1:1);});

            return text;
          }
        },

        series : [{
            data : data,
            mapData: Highcharts.maps['countries/tr/tr-all'],
            joinBy: 'hc-key',
            name: (stype=="lastname"?lastname:firstname).capitalize(),
            states: {
                hover: {
                    color: '#BADA55'
                }
            },
            dataLabels: {
                enabled: true,
                format: '{point.name}'
            }
        }]
    });
}
var app;
var $scope = {};
function start(){
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
    	setLastname();
      $(".graphheader").show();
      $(".loading").hide();
    }
    var worker = new Worker(3);
    function getData(url, callback){
      $.get(url, function(data, status){
        if(data.constructor === String)
              return callback(JSON.parse(data));
            else return callback(data);
        });
    }
    getData("data/population_city.json",function(res){
      $scope.population_city = {};
      for(var i=0,p;p=res[i];i++)
        $scope.population_city[p.city] = p.population;
      worker.assert();
    });
    getData("data/lastname_frequency_city.json",function(res){
      $scope.lastname_frequency_city = res;
      $scope.lastname = createCityNameMap(res);
      worker.assert();
    });
    getData("data/firstname_frequency_city.json",function(res){
    	$scope.firstname_frequency_city = res;
      $scope.firstname = createCityNameMap(res);
    	worker.assert();
    });
	}

var hc_city_map = {
  "ordu": "tr-or",
  "samsun": "tr-ss",
  "gaziantep": "tr-ga",
  "kocaeli": "tr-kc",
  "balikesir": "tr-bk",
  "canakkale": "tr-ck",
  "tokat": "tr-tt",
  "giresun": "tr-gi",
  "erzincan": "tr-en",
  "bingol": "tr-bg",
  "hatay": "tr-ht",
  "adana": "tr-aa",
  "corum": "tr-cm",
  "kirikkale": "tr-kk",
  "nigde": "tr-ng",
  "aksaray": "tr-ak",
  "kirsehir": "tr-kh",
  "yozgat": "tr-yz",
  "amasya": "tr-am",
  "mus": "tr-ms",
  "batman": "tr-bm",
  "kars": "tr-ka",
  "igdir": "tr-ig",
  "duzce": "tr-du",
  "zonguldak": "tr-zo",
  "karabuk": "tr-kb",
  "yalova": "tr-yl",
  "sakarya": "tr-sk",
  "cankiri": "tr-ci",
  "bolu": "tr-bl",
  "edirne": "tr-ed",
  "eskisehir": "tr-es",
  "konya": "tr-ko",
  "bursa": "tr-bu",
  "kirklareli": "tr-kl",
  "istanbul": "tr-ib",
  "karaman": "tr-kr",
  "antalya": "tr-al",
  "afyonkarahisar": "tr-af",
  "burdur": "tr-bd",
  "isparta": "tr-ip",
  "aydin": "tr-ay",
  "manisa": "tr-mn",
  "diyarbakir": "tr-dy",
  "adiyaman": "tr-ad",
  "kahramanmaras": "tr-km",
  "kayseri": "tr-ky",
  "elazig": "tr-eg",
  "mersin": "tr-ic",
  "sinop": "tr-sp",
  "artvin": "tr-av",
  "rize": "tr-ri",
  "trabzon": "tr-tb",
  "ankara": "tr-an",
  "sanliurfa": "tr-su",
  "bayburt": "tr-bb",
  "erzurum": "tr-em",
  "mardin": "tr-mr",
  "sirnak": "tr-sr",
  "siirt": "tr-si",
  "hakkari": "tr-hk",
  "van": "tr-va",
  "ardahan": "tr-ar",
  "kilis": "tr-ki",
  "bartin": "tr-br",
  "tekirdag": "tr-tg",
  "izmir": "tr-iz",
  "kastamonu": "tr-ks",
  "mugla": "tr-mg",
  "kutahya": "tr-ku",
  "nevsehir": "tr-nv",
  "sivas": "tr-sv",
  "tunceli": "tr-tc",
  "malatya": "tr-ml",
  "agri": "tr-ag",
  "bitlis": "tr-bt",
  "gumushane": "tr-gu",
  "osmaniye": "tr-os",
  "bilecik": "tr-bc",
  "denizli": "tr-dn",
  "usak": "tr-us"
};
//cross map:
for(var i in hc_city_map){
  hc_city_map[hc_city_map[i]] = i;
}