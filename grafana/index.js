var express = require('express');
var bodyParser = require('body-parser');
var path = require('path')
var fs = require('fs');
var app = express();

//create array of images
const imageDir = path.resolve(__dirname, './images/')
  var images = [];
  fs.readdir(imageDir, (err, files) => {
    files.forEach(file => {
      if (file.indexOf('.jpg') != -1) {
        images.push(file);
      }
    });
  });

app.use(bodyParser.json());

var timeserie = require('./series');
var countryTimeseries = require('./country-series');

var now = Date.now();

for (var i = timeserie.length -1; i >= 0; i--) {
  var series = timeserie[i];
  var decreaser = 0;
  for (var y = series.datapoints.length -1; y >= 0; y--) {
    series.datapoints[y][1] = Math.round((now - decreaser) /1000) * 1000;
    decreaser += 50000;
  }
}

var annotation = {
  name : "annotation name",
  enabled: true,
  datasource: "generic datasource",
  showLine: true,
}

var annotations = [
  { annotation: annotation, "title": "title", "time": 1450754160000, text: "text", tags: "tags" },
];

var tagKeys = [
  {"type":"string","text":"Country"}
];

var countryTagValues = [
  {'text': 'SE'},
  {'text': 'DE'},
  {'text': 'US'}
];

var now = Date.now();
var decreaser = 0;
for (var i = 0;i < annotations.length; i++) {
  var anon = annotations[i];

  anon.time = (now - decreaser);
  decreaser += 1000000
}

var table =
  {
    columns: [{text: 'Time', type: 'time'}, {text: 'Country', type: 'string'}, {text: 'Number', type: 'number'}],
    values: [
      [ 1234567, 'SE', 123 ],
      [ 1234567, 'DE', 231 ],
      [ 1234567, 'US', 321 ],
    ]
  };
  
function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");  
}


var now = Date.now();
var decreaser = 0;
for (var i = 0;i < table.values.length; i++) {
  var anon = table.values[i];

  anon[0] = (now - decreaser);
  decreaser += 1000000
}

//serve static files from images dir
app.use("/images", express.static(imageDir));

app.all('/', function(req, res) {
  setCORSHeaders(res);
  res.send('ok');
  res.end();
});

app.all('/randomimage', function(req, res) {
  setCORSHeaders(res);

  let item = images[Math.floor(Math.random()*images.length)];
  res.send(item);
  res.end();
});

app.all('/search', function(req, res){
  setCORSHeaders(res);
  var result = [];

  timeserie.forEach(ts => {
    result.push(ts.target);
  });

  res.json(result);
  res.end();
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(annotations);
  res.end();
});

app.all('/query', function(req, res){
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  var tsResult = [];
  let fakeData = timeserie;

  if (req.body.adhocFilters && req.body.adhocFilters.length > 0) {
    fakeData = countryTimeseries;
  }

  req.body.targets.forEach(target => {
    if (target.type === 'table') {
      tsResult.push(table);
    } else {
      var k = fakeData.filter(function(t) {
        return t.target === target.target;
      });

      k.forEach(element => {
        tsResult.push(element)
      });
    }
  });
 
  res.json(tsResult);
  res.end();
});

app.all('/tag[\-]keys', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(tagKeys);
  res.end();
});

app.all('/tag[\-]values', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  if (req.body.key == 'City') {
    res.json(cityTagValues);
  } else if (req.body.key == 'Country') {
    res.json(countryTagValues);
  }
  res.end();
});

var port = 3333;

app.listen(port);

console.log(`Server listening on port ${port}...`);
