function visitMemberExpression(node, nameChain)
{
	if(node.object.type === 'Identifier')
	{
		var name = node.object.name;
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			name = name+'.'+node.property.name;
		for(var j=0; j<nameChain.length;j++)
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
		for(var j=0; j<nameChain.length;j++)
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
		for(var j=0; j<nameChain.length;j++)
		{
			name = name +'.'+nameChain[j];
		}
		return name;
	}
	else if(node.object.type === 'CallExpression')
	{
		//var name = node.object.callee.name+'().'+node.property.name;
		var name = 'undefined.'+node.property.name;
		for(var j=0; j<nameChain.length;j++)
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


function getRequiresList(res3, res4, ast)
{
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

function analyzeCode(code) 
{
	var ast = esprima.parse(code);
	var identifiedMethods = [];
	var jsonpath = require('JSONPath').eval;

	var res1 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"PATH"});	

	var res3 = jsonpath(ast, "$.body[0]..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='CallExpression' && @.right.callee!== null && @.right.callee.name=='require')]", {resultType:"VALUE"});
	var res4 = jsonpath(ast, "$.body[0]..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='CallExpression' && @.right.callee!== null && @.right.callee.name=='require')]", {resultType:"PATH"});	
	//console.log(res1[item] + ' : ' + res2[item]);

	var requires = getRequiresList(res3, res4, ast);
	var methodCalls = getMethodCalls(res2, ast);
	var obj = {};
	obj['requires'] = requires;
	obj['methodcalls'] = methodCalls;
	return obj;
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
	for(var js in oracleObject)
	{
		for(var key in oracleObject[js])
		{
			//console.log(key);
			if(key === mname)
			{
				//console.log('match: ' + js + ' : ' + key);
				var obj = {};
				obj['file'] = js;
				obj['method'] = key;
				return obj;
			}
			else if(key.indexOf(mname) !==-1)
			{
				//console.log('match: ' + js + ' : ' + key);
				var obj = {};
				obj['file'] = js;
				obj['method'] = key;
				return obj;
			}
			else if(mname.indexOf(key) !==-1)
			{
				//console.log('match: ' + js + ' : ' + key);
				var obj = {};
				obj['file'] = js;
				obj['method'] = key;
				return obj;
			}
			else
			{
				/*var name_split = mname.split('.');
				var temp;
				console.log(name_split);
				for(var i=name_split.length-1; i>=0;i--)
				{
					if(temp === null)
						temp = name_split[i];
					else
						temp = name_split[i] + '.' + temp;
					//console.log(temp);
					if(key.indexOf(temp)!==-1)
					{
						var obj = {};
						obj['file'] = js;
						obj['method'] = key;
						return obj;
					}
				}*/
			}
		}
	}
	return null;
}

function fetchAPI(analyzedSnippet, oracleObject)
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
				if(op!==null)
					apifound[apifound.length] = op;
				else
					apinotfound[apinotfound.length] = analyzedSnippet['methodcalls'][i];
			}
		}
	}
	var temp = {};
	temp['found'] = apifound;
	temp['notfound'] = apinotfound;
	return temp;
}

function printAnswer(answer)
{
	for(var i=0; i<answer['found'].length; i++)
	{
		console.log('found: '+answer['found'][i]['file']+'-'+answer['found'][i]['method']);
	}
	for(var i=0; i<answer['notfound'].length; i++)
	{
		console.log('notfound: '+answer['notfound'][i]);
	}
	console.log(answer['found'].length + ':' + analyzedSnippet['methodcalls'].length);
}
var fs       = require('fs');
var filename = process.argv[2];
var data     = fs.readFileSync(filename);
var esprima  = require('esprima');
try
{
	var analyzedSnippet = analyzeCode(data);
	var oracleObject = fetchOracle();
	//printObject(analyzedSnippet);
	var answer = fetchAPI(analyzedSnippet, oracleObject);
	printAnswer(answer);
}
catch(err)
{
	var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
	dumpError(err);
}