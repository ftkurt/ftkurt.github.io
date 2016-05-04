var type = "count";
var freq_selection = "top";
var lastname,firstname,stype="lastname";
var page = 0;
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
  var chs = $(".frequencies").html('<div class="col col-xs-4"></div><div class="col col-xs-8"></div>').children();
  draw(searchFirstname(firstname.toUpperCase()),chs.last());
  var l = $scope.gender_frequency_firstname[firstname.toUpperCase()];
  drawPie([
    {
      name:"Female",
      y:l.f
    },
    {
      name:"Male",
      y:l.m
    }
    ], chs.first(),"Gender distribution for "+firstname.capitalize());
}
function showGenderFrequency(){
  stype = "firstname";
  firstname = $(".firstname").val();
  drawRegular(getGenderFrequency(),$(".frequencies"),"Gender Frequencies");
}
function setType(t){
  type = t;
  if(stype == "lastname")
    draw(searchLastname(lastname.toUpperCase()),$(".frequencies"));
 }
function setSelection(t){
  freq_selection = t;
  drawPareto(getParetoData($scope.firstname_ranking),$(".firstnamerank"));
  drawPareto(getParetoData($scope.lastname_ranking),$(".lastnamerank"));
}
function setPage(inc){
  page = page+inc;
  if(page<0) page = 0;
  $("#page").val(page);
  setSelection(freq_selection);
}
function setPage_(){
  page = $("#page").val()*1;
  setSelection(freq_selection);
}
function getEntry(e){
  var total = $scope.population_city[e.c];
  return {
    "hc-key":hc_city_map[e.c.toLowerCase()],
    "value":(type=="count"?e.f*1:(100*e.f/total)),
    "value_":total*1,
    "count":e.f*1
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
function getGenderFrequency(){
  var res = [];
  for(var i=0,e;e=$scope.gender_frequency_city[i];i++){
    var diff = (e.female-e.male);
    res.push({
      "hc-key":hc_city_map[e.city.toLowerCase()],
      "value":diff>0?1:-1,
      "desc":Math.abs(diff)+" more "+(diff>0?"females":"males")+", ratio(f/m): "+(e.female/e.male).toFixed(2)//(e.kiz+e.erkek)
    });
  }
  return res;
}
function getFrequentEntries(data){
  var res = {};
  for(var i=0,d;d=data[i];i++){
    var n = d.n.split(" ");
    for(var ii=0,nn;nn=n[ii];ii++){
      if(res[nn]) res[nn] += d.f*1;
      else res[nn] = d.f*1;
    }
  }
  var list = [];
  for(var i in res){
    list.push({
      n:i,
      f:res[i]
    })
  }
  list.sort(function(a,b){return (a.f>b.f?-1:1);});
  return {map:res,list:list};
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
  var ttl = 0;
  for(var i=0,t;t=data[i];i++) ttl += t.count*1;
  total = (type=="count"?(ttl+" / "+$scope.totalPopulation):((ttl/($scope.totalPopulation/100)).toFixed(2)+" %"));
  target.highcharts('Map', {

        title : {
            text : stype.capitalize()+' '+dataviewtype+': '+name+" ("+total+")"
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
            var value = (type=="count"?this.point.value:(this.point.value.toFixed(2)+"%"));
            var city = hc_city_map[this.point["hc-key"]].toUpperCase();
            var text = "<strong>'" + name + "' " + dataviewtype + " in "+city.capitalize() + ": " + value + "</strong><br/><br/><strong>Top entries:</strong><br>";
            /*if(!$scope[stype].mapa.sorted[city]){
              $scope[stype].mapa.sorted[city] = true;
              $scope[stype].mapa[city].sort(function(a,b){return (a.f>b.f?-1:1);});
            }*/
            var cnt=0;
            for(var i in $scope[stype][city]){
              var c = $scope[stype][city][i]*1;
              var value = (type=="count"?c:((100*c/this.point.value_).toFixed(2)+"%"));
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

function drawRegular(data,target,name){
  target.highcharts('Map', {

        title : {
            text : name
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
            return this.point.desc;
          }
        },
        series : [{
            data : data,
            mapData: Highcharts.maps['countries/tr/tr-all'],
            joinBy: 'hc-key',
            name: name,
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
function getParetoData(list){
  var limit = 50;
  var data = {
    "series":[
      {
        "data":[],
        "name":"Occurences",
        "type":"column",
        "categories":[]
      },
      {
        "data":[],
        "name":"Accumulated",
        "type":"spline",
        "yAxis":1,
        "id":"accumulated"
      }
    ],
    "categories":[]
  }
  var total = 0;
  if(freq_selection == "top"){
    for(var i=0,l;l=list[i];i++){
      total += l.f*1;
      if(i<limit&&(i/limit)>=page){
        var frk = $scope.gender_frequency_firstname[l.n.toUpperCase()]||{};
        data.series[0].data.push({name:l.n,y:l.f*1,color:(frk.f>frk.m?"red":"blue")});
        data.series[1].data.push({name:l.n,y:total});
        //data.categories.push(l.n);
      }
    }
  }
  else{
    var cnt = 0, cnt1=0;
    for(var i=list.length-1,l;l=list[i];i--){
      total += l.f*1;
      cnt1++;
      if(cnt<limit&&(cnt1/limit)>=page){
        cnt++;
        var frk = $scope.gender_frequency_firstname[l.n.toUpperCase()]||{};
        data.series[0].data.push({name:l.n,y:l.f*1,color:(frk.f>frk.m?"red":"blue")});
        data.series[1].data.push({name:l.n,y:total});
        //data.categories.push(l.n);
      }
    }
  }
  for(var i=0;i<data.series[1].data.length;i++){
    data.series[1].data[i] = (100*data.series[1].data[i])/total;
  }
  console.log(data);
  return data;
}
function drawPareto(data,target){
  var options = {
      credits: {
          enabled: false
      },
      legend: {
          layout: 'horizontal',
          verticalAlign: 'bottom'
      },
      title: {
          text: ''
      },
      tooltip: {
          formatter: function () {
              if (data.name == 'Accumulated') {
                  return this.y + '%';
              }
              return this.x + '<br/>' + '<b> ' + this.y.toString().replace('.', ',') + ' </b>';
          }
      },
      xAxis: {
          categories: data.categories
      },
      yAxis: [{
          title: {
            type:"logarithmic", // TODO: logarithmic olup olmayacagini test et.
              text: ''
          }
      }, {
          labels: {
              formatter: function () {
                  return this.value + '%';
              }
          },
          max: 100,
          min: 0,
          opposite: true,
          plotLines: [{
              color: '#89A54E',
              dashStyle: 'shortdash',
              value: 80,
              width: 3,
              zIndex: 10
          }],
          title: {
              text: ''
          }
      }],
      series:data.series
  };
  var graph = target.highcharts(options);
}
function drawPie(data,target,name){
  target.highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: name||'Browser market shares January, 2015 to May, 2015'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %<br><b>{point.name}</b>: {point.value:.1f}',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            name: 'Count',
            colorByPoint: true,
            data: data || [{
                name: 'Microsoft Internet Explorer',
                y: 56.33
            }, {
                name: 'Chrome',
                y: 24.03,
                sliced: true,
                selected: true
            }, {
                name: 'Firefox',
                y: 10.38
            }, {
                name: 'Safari',
                y: 4.77
            }, {
                name: 'Opera',
                y: 0.91
            }, {
                name: 'Proprietary or Undetectable',
                y: 0.2
            }]
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
    	//setLastname();
      showGenderFrequency();
      $(".graphheader").show();
      $(".loading").hide();
      drawPareto(getParetoData($scope.firstname_ranking),$(".firstnamerank"));
      drawPareto(getParetoData($scope.lastname_ranking),$(".lastnamerank"));

    }
    var worker = new Worker(7);
    function getData(url, callback){
      $.get(url, function(data, status){
        if(data.constructor === String)
              return callback(JSON.parse(data));
            else return callback(data);
        });
    }
    getData("data/population_city.json",function(res){
      $scope.population_city = {};
      $scope.totalPopulation = 0;
      for(var i=0,p;p=res[i];i++){
        $scope.population_city[p.city] = p.population*1;
        $scope.totalPopulation += p.population*1;
      }
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
    getData("data/gender_frequency_city.json",function(res){
      $scope.gender_frequency_city = res;
      $scope.firstname = createCityNameMap(res);
      worker.assert();
    });
    getData("data/firstname_ranking.json",function(res){
      $scope.firstname_ranking = res;
      worker.assert();
    });
    getData("data/lastname_ranking.json",function(res){
      $scope.lastname_ranking = res;
      worker.assert();
    });
    getData("data/gender_frequency_firstname.json",function(res){
      var names = {},list = $(".binames");
      for(var i=0,n;n=res[i];i++){
        var ratio = n.f/n.m;
        if(ratio>1/3||ratio<2/3) list.append('<tr><th>'+n.n.capitalize()+'</th><td>'+n.f+'</td><td>'+n.m+'</td><td>'+(100*n.f/(n.f+n.m)).toFixed(1)+' %</td></tr>');
        names[n.n] = {f:n.f*1,m:n.m*1};
      }
      $scope.gender_frequency_firstname = names;
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