var fs = require('fs');
var escodegen = require('escodegen');
var filename = process.argv[2];
var data     = fs.readFileSync(filename);
//var esprima  = require('esprima');
//var ast = esprima.parse(data);
//console.log(ast);
//var code = eval(data);
console.log(code);

/*for(var key in code)
    console.log(key);*/



var Reflector = function(obj) {
  this.getProperties = function() {
    var properties = [];
    for (var prop in obj) {
      if (typeof obj[prop] != 'function') {
        properties.push(prop);
      }
    }
    return properties;
  };
}