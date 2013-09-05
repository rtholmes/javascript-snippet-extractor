var files = [
"./UIExamples/js/pillButtons.js",
"./UIExamples/js/input.js",
"./UIExamples/js/webworks.js",
"./UIExamples/js/tabs.js",
"./HelloWorld/geo.js",
"./Aura/js/jquery-1.5.js",
"./Aura/js/jquery-ui-1.8.9.custom.min.js",
"./Aura/js/jquery.easing.1.3.js",
"./Aura/js/events.js",
"./Aura/js/classes/WeatherHourObj.js",
"./Aura/js/classes/DateObj.js",
"./Aura/js/classes/WeatherForecastObj.js",
"./Aura/js/weatherEvents.js",
"./Aura/js/dock.js",
"./Aura/js/rope.js",
"./payment/js/payment.js",
"./payment/js/jquery.mobile-1.0a4.1.min.js",
"./Weather/javascript/WeatherDatabase60.js",
"./Weather/javascript/common.js",
"./Weather/javascript/stationsList.js",
"./Weather/javascript/Weather60.js"
];
var sys = require('util')
var exec = require('child_process').exec;
var child;
var pwd = "/home/s23subra/repositories/javascript-snippet-extractor/WebWorks-Samples";
for(var i in files )
{
	child = exec("node snippet_parser.js " + pwd + files[i].substring(1), function (error, stdout, stderr) {
		sys.print('stdout: ' + stdout);
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}