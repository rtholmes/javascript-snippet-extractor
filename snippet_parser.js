function lcs(lcstest, lcstarget) {
	matchfound = 0
	lsclen = lcstest.length
	for(lcsi=0; lcsi<lcstest.length; lcsi++){
		lscos=0
		for(lcsj=0; lcsj<lcsi+1; lcsj++){
			re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
			temp = re.test(lcstest);
			re = new RegExp("(" + RegExp.$1 + ")", "i");
			if(re.test(lcstarget)){
				matchfound=1;
				result = RegExp.$1;
				break;
			}
			lscos = lscos + 1;
		}
		if(matchfound==1){return result; break;}
		lsclen = lsclen - 1;
	}
	result = "";
	return result;
}

function visitMemberExpression(node, nameChain)
{
	if(node.object.type === 'Identifier')
	{
		var name = node.object.name;
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			name = name+'.'+node.property.name;
		for(var j=nameChain.length-1; j>=0;j--)
		{
			name = name +'.'+nameChain[j];
		}
		return name;
	}
	else if(node.object.type === 'ArrayExpression')
	{
		//console.log('THIS');
		var name = 'ArrayExpression';
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			name = name +'.'+node.property.name;
		for(var j=nameChain.length-1; j>=0;j--)
		{
			name = name +'.'+nameChain[j];
		}
		return name;
	}
	else if(node.object.type === 'ThisExpression')
	{
		//console.log('THIS');
		var name = 'this';
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			name = name +'.'+node.property.name;
		for(var j=nameChain.length-1; j>=0;j--)
		{
			name = name +'.'+nameChain[j];
		}
		return name;
	}
	else if(node.object.type === 'CallExpression')
	{
		//var name = node.object.callee.name+'().'+node.property.name;
		var name = 'undefined.'+node.property.name;
		for(var j=nameChain.length-1; j>=0;j--)
		{
			name = name +'.'+nameChain[j];
		}
		return name;
	}
	else if(node.object.type === 'MemberExpression')
	{
		//console.log('YES');
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			nameChain[nameChain.length] = node.property.name;
		//console.log('---' + node.property.name);
		return visitMemberExpression(node.object, nameChain);
	}
	else
	{
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			return "undefined."+node.property.name;
	}
}


function dumpError(err) 
{
	if (typeof err === 'object') 
	{
		if (err.message) 
		{
			console.log('\nMessage: ' + err.message)
		}
		if (err.stack) 
		{
			console.log('\nStacktrace:')
			console.log('====================')
			console.log(err.stack);
		}
	} 
	else 
	{
		console.log('dumpError :: argument is not an object');
	}
}

function append(array, value)
{
	var newArray = [];
	for(var i=0; i<value.length; i++)
	{
		if(value[i] === 'prototype' ||  value[i] === 'self')
		{

		}
		else if(array.length === 0)
		{
			newArray[newArray.length] = value[i];
		}
		else
		{
			for(var j=0; j<array.length; j++)
			{
				newArray[newArray.length] = array[j].concat('.',value[i]);
			}
		}
	}
	return newArray;
}

function getAssignmentChain(assignmentChain)
{
	var array =[];
	for(var j=0; j<assignmentChain.length;j++)
	{
		var name;
		if(assignmentChain[j] === undefined || assignmentChain[j].hasOwnProperty('type') === false)
		{

		}
		else if(assignmentChain[j].type === 'MemberExpression')    
		{	
			name = visitMemberExpression(assignmentChain[j], []);
		}
		else if(assignmentChain[j].type === 'Identifier')
		{
			name = assignmentChain[j].name;
		}
		else if(assignmentChain[j].type === 'VariableDeclarator')
		{
			name = assignmentChain[j].id.name;
		}
		array[array.length] = name;
	}
	return array;
}

function isInt(value) 
{
	return !isNaN(parseInt(value,10)) && (parseFloat(value,10) == parseInt(value,10)); 
}

function contains(a, obj) 
{
	var i = a.length;
	while (i--) 
	{
		if (a[i] === obj) 
		{
			return true;
		}
	}
	return false;
}


function arrayContains(a, obj) 
{
	var i = a.length;
	while (i--) 
	{
		if (a[i]['file'] === obj['file'] && a[i]['method'] === obj['method'] && a[i]['call'] === obj['call']) 
		{
			return true;
		}
	}
	return false;
}

function stringArrayContains(array, element)
{
	var i = array.length;
	while(i>=0)
	{
		if(array[i] === element)
			return true
		i--;
	}
	return false;
}


function getRequiresList(res3, res4, ast)
{
	console.log("I was here!!!!");
	var requires = {};
	for(var item in res3)
	{
		var test = res4[item];
		test = test.slice(1);
		var array = test.split(']');
		for(var item2 in array)
		{
			if(isInt(array[item2][1]))
				array[item2] = array[item2].slice(1);
			else
				array[item2] = array[item2].slice(2, -1);
		}
		var astcopy = ast;
		var leftNodes = [];
		for(var item2 in array)
		{
			var node = astcopy[array[item2]];
			if(node !== undefined)
			{
				if(node.hasOwnProperty('type'))
				{
					//console.log(node.type);
				}
				astcopy = node;
			}
			
		}
		if(astcopy.type === 'AssignmentExpression')
		{
			console.log("I was here!!!!");
			if(astcopy.left.type === 'Identifier')
			{
				console.log('re-id : ' + astcopy.left.name + ' : ' + astcopy.right.arguments[0].value);
				requires[astcopy.left.name] = astcopy.right.arguments[0].value;
			}
			else if(astcopy.callee.type === 'MemberExpression')
			{
				var mName = visitMemberExpression(astcopy.callee, [])
				console.log('re-me : ' + mName + ' : ' + astcopy.right.arguments[0].value);
				requires[mName] = astcopy.right.arguments[0].value;		
			}
			else
			{
				console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.property.name);
			}
		}
		/*else if (astcopy.type === 'MemberExpression')
		{
			if(astcopy.left.type === 'Identifier')
			{
				//console.log('re-id : ' + astcopy.left.name + ' : ' + astcopy.right.arguments[0].value);
				requires[astcopy.left.name] = astcopy.right.arguments[0].value;
			}
			else if(astcopy.callee.type === 'MemberExpression')
			{
				var mName = visitMemberExpression(astcopy.callee, [])
				//console.log('re-me : ' + mName + ' : ' + astcopy.right.arguments[0].value);
				requires[mName] = astcopy.right.arguments[0].value;		
			}
			else
			{
				console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.property.name);
			}
		}*/
		else if(astcopy.type === 'VariableDeclarator')
		{
			console.log("I was here too!!!!");
			if(astcopy.id.type === 'Identifier')
			{
				console.log('re-id v : ' + astcopy.left.name + ' : ' + astcopy.right.arguments[0].value);
				requires[astcopy.id.name] = astcopy.init.arguments[0].value;
			}
			else if(astcopy.id.type === 'MemberExpression')
			{
				var mName = visitMemberExpression(astcopy.id, [])
				console.log('re-me v : ' + mName + ' : ' + astcopy.right.arguments[0].value);
				requires[mName] = astcopy.init.arguments[0].value;		
			}
			else
			{
				console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.property.name);
			}
		}
}
return requires;
}

function getMethodCalls(res2, ast)
{
	var methodCalls = [];
	for(var item in res2)
	{
		var test = res2[item];
		test = test.slice(1);
		var array = test.split(']');
		for(var item2 in array)
		{
			if(isInt(array[item2][1]))
				array[item2] = array[item2].slice(1);
			else
				array[item2] = array[item2].slice(2, -1);
		}
		var astcopy = ast;
		for(var item2 in array)
		{
			var node = astcopy[array[item2]];
			if(node !== undefined)
			{
				if(node.hasOwnProperty('type'))
				{
					//console.log(node.type);
				}
				astcopy = node;
			}
			
		}
		if(astcopy.callee.type === 'Identifier')
		{
			//console.log('id : ' + astcopy.callee.name);
			methodCalls[methodCalls.length] = astcopy.callee.name;
		}
		else if(astcopy.callee.type === 'MemberExpression')
		{
			var mName = visitMemberExpression(astcopy.callee, [])
			//console.log('me : ' + mName);
			methodCalls[methodCalls.length] = mName;
		}
		else
		{
			console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.type);
		}
		//console.log(astcopy.type);
		//console.log('-------------------');
	}
	return methodCalls;
}

function analyzeCode(code, filename, oracleObject, fetchAPI, printAnswer) 
{
	var ast = esprima.parse(code);
	var identifiedMethods = [];
	var jsonpath = require('JSONPath').eval;

	var res1 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"PATH"});	

	var res3 = jsonpath(ast, "$..?(@.type!== null && @.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='CallExpression' && @.right.callee!== null && @.right.callee.name=='require')", {resultType:"VALUE"});
	var res4 = jsonpath(ast, "$..?(@.type!== null && @.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='CallExpression' && @.right.callee!== null && @.right.callee.name=='require')", {resultType:"PATH"});	

/*
	var res5 = jsonpath(ast, "$.body[0]..[?(@.type=='MemberExpression' && @.object.type !== null && @.object.type=='CallExpression' && @.object.callee!== null && @.object.callee.name=='require')]", {resultType:"VALUE"});
	var res6 = jsonpath(ast, "$.body[0]..[?(@.type=='MemberExpression' && @.object.type !== null && @.object.type=='CallExpression' && @.object.callee!== null && @.object.callee.name=='require')]", {resultType:"PATH"});	
*/
	var res7 = jsonpath(ast, "$..?(@.type!== 'null' && @.type=='VariableDeclarator' && @.init.type !== null && @.init.type=='CallExpression' && @.init.callee!== null && @.init.callee.name=='require')", {resultType:"VALUE"});
	var res8 = jsonpath(ast, "$..?(@.type!== null && @.type=='VariableDeclarator' && @.init.type !== null && @.init.type=='CallExpression' && @.init.callee!== null && @.init.callee.name=='require')", {resultType:"PATH"});	

	//console.log(res1[item] + ' : ' + res2[item]);

	/*res3 = res3.concat(res5);	
	res4 = res4.concat(res6);*/
	res3 = res3.concat(res7);	
	res4 = res4.concat(res8);

	var requires = getRequiresList(res3, res4, ast);
	var methodCalls = getMethodCalls(res2, ast);
	//console.log(res3);
	fetchLocal(filename, requires, methodCalls, fetchAPI, oracleObject, printAnswer);
}

function printObject(analyzedSnippet)
{
	for(var key in analyzedSnippet)
	{
		if(key === 'requires')
		{
			for(var item in analyzedSnippet['requires'])
			{
				console.log('req- ' + item + ' : ' + analyzedSnippet['requires'][item]);
			}
		}
		else if(key === 'methodcalls')
		{
			//console.log('has key');
			for(var i=0; i<analyzedSnippet['methodcalls'].length; i++)
			{
				console.log('call- ' + i + ' : ' + analyzedSnippet['methodcalls'][i]);
			}
		}
	}
}

function fetchOracle()
{
	var oracle = 'oracle.js'
	var dataFile = fs.readFileSync(oracle);
	var oracleObject = JSON.parse(dataFile);
	return oracleObject;
}



function mapMethod(mname, oracleObject)
{
	var objArray = [];
	var flag = 0;
	for(var js in oracleObject)
	{
		for(var key in oracleObject[js])
		{
			//console.log(key);
			if(key.toLowerCase() === mname.toLowerCase() || key.toLowerCase() === "window."+mname.toLowerCase())
			{
				//console.log('match: ' + js + ' : ' + key);
				var obj = {};
				obj['file'] = js;
				obj['method'] = key;
				obj['source'] = 1;
				obj['call'] = mname;
				if(!arrayContains(objArray, obj))
				{
					objArray[objArray.length] = obj;
					flag = 1;
				}
				//return obj;
			}
		}
	}
	if(flag === 0)
	{
		for(var js in oracleObject)
		{
			for(var key in oracleObject[js])
			{
				var new_name = js + '.' + key; 
				if(new_name.toLowerCase() === mname.toLowerCase())
				{
					//console.log('match: ' + js + ' : ' + key);
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 2;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
					//return obj;
				}
			}
		}
	}
	if(flag === 0)
	{
		for(var js in oracleObject)
		{
			for(var key in oracleObject[js])
			{
				if(key.endsWith('.'+mname) === true)
				{
					//console.log('match: ' + key + ' : ' + key);
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 3;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
					//return obj;
				}
			}
		}
	}
	if(flag === 0)
	{
		var objArray2 = [];
		for(var js in oracleObject)
		{
			for(var key in oracleObject[js])
			{
				var match = getLongestMatch(mname, key);
				if(match!==null)
				{
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 5;
					obj['match'] = match;
					obj['call'] = mname;
					if(!arrayContains(objArray2, obj))
						objArray2[objArray2.length] = obj;
				}
				
			}

		}
		var objArrayMin = [];
		var longest = 0;
		for(var index=0; index<objArray2.length;index++)
		{
			if(objArray2[index]['match'].length > longest)
			{
				objArrayMin = [];
				objArrayMin[objArrayMin.length] = objArray2[index];
				longest = objArray2[index]['match'].length;
			}
			else if(objArray2[index]['match'].length === longest)
			{
				objArrayMin[objArrayMin.length] = objArray2[index];
				longest = objArray2[index]['match'].length;
			}
		}
		objArray = objArray.concat(objArrayMin);
	}
	
	if(objArray.length === 0)
		return null;
	else
		return objArray;
}

function getLongestMatch(mname, key)
{
	var tokens = mname.split('.');
	var temp = null;
	var foundFlag = 0;
	var ans = null;
	for(var i=tokens.length-1; i>=0;i--)
	{

		if(temp === null)
			temp = tokens[i];
		else
			temp = tokens[i] + '.' + temp;
		//console.log(temp);
		if((key.indexOf('.'+temp)!==-1 && key.endsWith('.'+temp)===true)|| key === temp)
		{
			foundFlag = 1;
			ans = temp;
		}
		else if(foundFlag === 1)
			break;
	}
	return ans;
}

function fetchAPI(analyzedSnippet, oracleObject, printAnswer, k)
{
	var apifound = [];
	var apinotfound = [];
	for(var key in analyzedSnippet)
	{
		if(key === 'methodcalls')
		{
			for(var i=0; i<analyzedSnippet['methodcalls'].length; i++)
			{
				var op = mapMethod(analyzedSnippet['methodcalls'][i], oracleObject);
				if(op!==null && op!=undefined)
					apifound[apifound.length] = op;
				else
					apinotfound[apinotfound.length] = analyzedSnippet['methodcalls'][i];
			}
		}
	}
	var temp = {};
	temp['found'] = apifound;
	temp['notfound'] = apinotfound;
	printAnswer(temp, k, analyzedSnippet['requires']);
}
function fetchLocal(filename, requires, methodCalls, fetchAPI, oracleObject, printAnswer)
{
	var sys = require('util')
	var exec = require('child_process').exec;
	var child = exec("node parser.js " + filename, function (error, stdout, stderr) {

		//sys.print('stdout: ' + stdout);
		
		if (error !== null) {
			console.log('exec error: ' + error);
		}
		var localMethods = stdout;
		var methods = localMethods.split("\n");
		//methods = methods.slice(1, methods.length-2);
		//console.log(methods);
		var newMethodCalls = [];
		var k =0;
		for(var i=0; i<methodCalls.length; i++)
		{
			if(stringArrayContains(methods, methodCalls[i]) === false)
			{
				//console.log("----" + methodCalls[i]);
				newMethodCalls[newMethodCalls.length] = methodCalls[i];
			}
			else
			{
				console.log("+++LOCAL : "+methodCalls[i]);
				k++;
			}
		}
		var obj = {};
		obj['requires'] = requires;
		obj['methodcalls'] = newMethodCalls;
		fetchAPI(obj, oracleObject, printAnswer, k);
	});
}

function printAnswer(answer, k, requires)
{
	console.log('***********************\nFOUND:');
	var i=0,j=0;
	for(i=0; i<answer['found'].length; i++)
	{
		console.log('----------\n' + answer['found'][i][0]['call']);
		for(var j=0;j<answer['found'][i].length; j++)
			console.log(answer['found'][i][j]['file']+'  :  '+answer['found'][i][j]['method'] + '   -   ' + answer['found'][i][j]['source']);
	}
	console.log('***********************\nNOT FOUND:');
	for(var j=0; j<answer['notfound'].length; j++)
	{
		/*if(stringArrayContains(localMethods, answer['notfound'][j]) === true)
		{
			console.log("+++LOCAL : "+answer['notfound'][j]);
			k++;
		}
		else*/
		{
			console.log(answer['notfound'][j]);
			//l++;
		}
	}
	console.log('***********************\nREQUIRES:');
	for(var key in requires)
	{
		console.log(requires[key])
	}
	console.log('***********************\nSTATS: ');
	console.log("Mapped- "+(i).toString()+ ": Unmapped- " + (j).toString() + " : Local Calls- " + k.toString());
}



if (typeof String.prototype.startsWith != 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) == str;
	};
}

if (typeof String.prototype.endsWith != 'function') {
	String.prototype.endsWith = function (str){
		return this.slice(this.length - str.length, this.length) == str;
	};
}



var fs;
fs       = require('fs');
var filename = process.argv[2];
var data     = fs.readFileSync(filename);
var esprima  = require('esprima');
try
{
	var oracleObject = fetchOracle();
	var analyzedSnippet = analyzeCode(data, filename, oracleObject, fetchAPI, printAnswer);
	
	//printObject(analyzedSnippet);
	//var answer = fetchAPI(analyzedSnippet, oracleObject);
	//fetchLocal(filename , answer, printAnswer);
	
	//printAnswer(answer);

	//printObject(analyzedSnippet);
	//console.log(oracleObject['jquery'].length);
}
catch(err)
{
	var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
	dumpError(err);
}

function lcs(lcstest, lcstarget) {
	matchfound = 0
	lsclen = lcstest.length
	for(lcsi=0; lcsi<lcstest.length; lcsi++){
		lscos=0
		for(lcsj=0; lcsj<lcsi+1; lcsj++){
			re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
			temp = re.test(lcstest);
			re = new RegExp("(" + RegExp.$1 + ")", "i");
			if(re.test(lcstarget)){
				matchfound=1;
				result = RegExp.$1;
				break;
			}
			lscos = lscos + 1;
		}
		if(matchfound==1){return result; break;}
		lsclen = lsclen - 1;
	}
	result = "";
	return result;
}