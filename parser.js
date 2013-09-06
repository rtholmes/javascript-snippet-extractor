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
		var name = node.property.name;
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
			return i;
		}
	}
	return -1;
}

function containsFunction(identifiedMethods, obj)
{
	var array = [];
	var object = {};
	object['value'] = [];
	object['key'] = [];
	object['flag'] = -1;
	for(var key in identifiedMethods)
	{
		if(key === obj )
		{
			object['key'] = [];
			object['value'] = [];
			object['value'][0] = identifiedMethods[key];
			object['flag'] = 0;
			//console.log(key + ":" + obj);
			//funObj = identifiedMethods[key];
			//array[array.length] = identifiedMethods[key];
			break;
		}
		else if(key.startsWith(obj+'.'))
		{
			object['key'][object['key'].length] = key.substring(key.indexOf(obj+'.') + obj.length + 1, key.length);
			object['value'][object['value'].length] = identifiedMethods[key];
			object['flag'] = 1;
			//console.log(key + "-" + obj);
			array[array.length] = identifiedMethods[key];
		}
	}
	if(object.flag !== -1)
		return object;
	else
		return null;
}

function getRes(code)
{
	var ast = esprima.parse(code);
	var jsonpath = require('JSONPath').eval;

	var res1 = jsonpath(ast, "$.body..declarations[?(@.init !== null && @.init.type=='FunctionExpression')].id.name", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$.body..declarations[?(@.init !== null && @.init.type=='FunctionExpression')].init", {resultType:"PATH"});	

	var res3 = jsonpath(ast, "$.body..properties[?(@.value !== null && @.value.type=='FunctionExpression')].key.name", {resultType:"VALUE"});
	var res4 = jsonpath(ast, "$.body..properties[?(@.value !== null && @.value.type=='FunctionExpression')].value", {resultType:"PATH"});	

	var res5 = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='FunctionExpression' )].left", {resultType:"VALUE"});
	var res6 = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='FunctionExpression' )].right", {resultType:"PATH"});	

	var res7 = jsonpath(ast, "$.body..[?(@.type=='FunctionDeclaration' && @.id !== null )].id.name", {resultType:"VALUE"});
	var res8 = jsonpath(ast, "$.body..[?(@.type=='FunctionDeclaration' && @.id !== null )]", {resultType:"PATH"});

	
	res2 = res2.concat(res4, res6, res8);
	res1 = res1.concat(res3, res5, res7);
	

	var identifiedMethods = analyzeCode(res2, ast, 0, null);

	var res9_temp = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='Identifier')].right.name", {resultType:"VALUE"});
	var res10_temp = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='Identifier')].right", {resultType:"PATH"});

	var res9 = [];
	var res10 = [];
	//var res11 = [];
	for(var item in res9_temp)
	{
		var returnObject = containsFunction(identifiedMethods, res9_temp[item]);
		if(returnObject !== null)
		{
			res9[res9.length] = returnObject;
			res10[res10.length] = res10_temp[item];
			//res11[res10.length] = res1[i];
		}
	}
	//res2 = res2.concat(res10);	
	//res1 = res1.concat(res9);
	//console.log(res1);
	//console.log('done merging');
	var tester = analyzeCode(res10, ast, 1, res9);
	//var identifiedMethods = analyzeCode(res1, res2, ast);

	for(var key in tester)
	{
		//console.log("----------------------  " + key);
		identifiedMethods[key] = tester[key];
		//console.log(JSON.stringify(tester[key]))
	}
	return identifiedMethods;
}

function analyzeCode(res2, ast, differFlag, res1) 
{
	//var ast = esprima.parse(code, {loc : true});
	
	var identifiedMethods = {};

	
	var breakFlag = 0;
	for(item in res2)
	{
		var callStatementCount = 0;
		breakFlag = 0;
		var assignmentChain = [];
		var test = res2[item];
		test = test.slice(1);
		var array = test.split(']');
		for(var item in array)
		{
			if(isInt(array[item][1]))
				array[item] = array[item].slice(1);
			else
				array[item] = array[item].slice(2, -1);
		}
		var astcopy = ast;
		var leftNodes = [];
		for(var item in array)
		{
			var node = astcopy[array[item]];
			if(node !== undefined)
			{
				//console.log(node.type);
				if(item === 'arguments')
				{
					breakFlag =1;
					break;
				}
				if(node.hasOwnProperty('type'))
				{
					/*if(node.type === VariableDeclarator)
					{
						breakFlag =1;
						break;
					}*/
					if(node.type === 'FunctionExpression')
					{
						callStatementCount++;
						if(callStatementCount <= 1)
						{
							//console.log('Inaccessible!');
							breakFlag =1;
							break;
						}
					}
				}
				if(node.hasOwnProperty('left'))
				{
					if(node.right.type === 'AssignmentExpression')
					{
						assignmentChain[assignmentChain.length] = node.left;
					}
					else if(node.left.type === 'MemberExpression')    
					{
						assignmentChain[assignmentChain.length] = node.left;
						if(node.right.type!=='FunctionExpression')
						{
							leftNodes=[];
						}
						var assignmentArray =[];
						assignmentArray = getAssignmentChain(assignmentChain);						
						leftNodes = append(leftNodes, assignmentArray);
						assignmentChain = [];
					}
					else if(node.left.type === 'Identifier')
					{
						assignmentChain[assignmentChain.length] = node.left;
						if(node.right.type!=='FunctionExpression')
						{
							leftNodes=[];
						}
						var assignmentArray = [];
						assignmentArray = getAssignmentChain(assignmentChain);
						leftNodes = append(leftNodes, assignmentArray);
						//console.log('---'+node.left.name);
						assignmentChain = [];
					}
				}
				if(node.type === 'VariableDeclarator')
				{
					if(node.init.type === 'AssignmentExpression')
					{
						assignmentChain[assignmentChain.length] = node.id;
					}
					else if(node.init.type === 'VariableDeclarator')
					{
						assignmentChain[assignmentChain.length] = node.id;
					}
					else
					{
						assignmentChain[assignmentChain.length] = node.id;
						if(node.init.type!=='FunctionExpression')
						{
							var assignmentArray = [];
							assignmentArray = getAssignmentChain(assignmentChain);
							leftNodes = [];
							leftNodes = append(leftNodes, assignmentArray);
							assignmentChain = [];
							//console.log('---'+node.id.name);
						}
					}
				}
				if(node.type === 'Property')
				{
					var tempArray = [];
					tempArray[0]=node.key.name;
					leftNodes = append(leftNodes, tempArray);
					//console.log('---'+node.key.name);
				}
				if(node.type === 'FunctionDeclaration')
				{
					var tempArray = [];
					tempArray[0]=node.id.name;
					leftNodes = append(leftNodes, tempArray);
					//console.log('-------'+node.id.name);
				}
				astcopy = node;
			}
		}
		if(breakFlag !== 1)
		{
			//console.log(leftNodes);
			for(var item in leftNodes)
			{

				var functionId = leftNodes[item];
				if(differFlag == 0)
				{
					if(!objContains(identifiedMethods, functionId))
					{
						identifiedMethods[functionId] = astcopy;
						console.log(functionId);
					}
				}
				else
				{
					for(var index=0; index < res1.length; index++)
					{
						var resItem = res1[index];
						//console.log("here!!!" + resItem['flag']);
						if(resItem['flag'] === 0)
						{
							if(!objContains(identifiedMethods, functionId))
							{
								identifiedMethods[functionId] = resItem['value'][0];
								console.log(functionId);
							}
						}
						else if(resItem['flag'] === 1)
						{
							for(var p=0;p<resItem['key'].length; p++)
							{
								var name2 = functionId + '.' + resItem['key'][p];
								if(!objContains(identifiedMethods, name2))
								{
									identifiedMethods[name2] = resItem['value'][p];
									console.log(name2);
								}
							}
						}
					}
				}
			}
		}
	}
	var count = 0;
	for(var key in identifiedMethods)
	{
		//console.log(key + " : " + JSON.stringify(identifiedMethods[key]));
		count++;
	}
	//console.log(count);
	return identifiedMethods;
}

function objContains(object, name)
{
	for(key in object)
	{
		if(key === name)
			return true;
	}
	return false;
}

function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}


var fs = require('fs');
var oracle = 'oracle.js'
var path = 'lib/'
var files = fs.readdirSync(path);
var esprima = require('esprima');

if (process.argv.length < 3)
{
	console.log(files);
	for(var i=0; i<files.length; i++)
	{
		var filename = files[i];
		//console.log(esprima.parse(data));

		console.log('Processing ' + filename + ' ...');
		var dataFile = fs.readFileSync(oracle);
		var oracleObject = JSON.parse(dataFile);
		if(oracleObject.hasOwnProperty(filename.substring(0, filename.length-3)))
		{
			console.log('File already exists!');
		}
		else
		{
			var data = fs.readFileSync(path + filename);
			var functionList = [];
			try
			{
				functionList = getRes(data);
			}
			catch(err)
			{
				var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
				dumpError(err);
			}
			if(functionList.length === 0)
				oracleObject[filename.substring(0, filename.length-3)] = {};
			else
				oracleObject[filename.substring(0, filename.length-3)] =  functionList;

			//console.log(JSON.stringify(oracleObject), null, 3);
			fs.writeFileSync(oracle, JSON.stringify(oracleObject, null, 3),encoding='utf8');
		}

	}
}
else
{
	var filename = process.argv[2];
	var data = fs.readFileSync(filename);
	try
	{
		var functionList = getRes(data);
		//console.log(JSON.stringify(functionList));
	}
	catch(err)
	{
		var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
		dumpError(err);
	}
}

