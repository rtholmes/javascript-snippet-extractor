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
		var name = node.property.name;
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

function analyzeCode(code) 
{
	//var ast = esprima.parse(code, {loc : true});
	var ast = esprima.parse(code);
	var identifiedMethods = {};

	var jsonpath = require('JSONPath').eval;

	var res1 = jsonpath(ast, "$.body..declarations[?(@.init !== null && @.init.type=='FunctionExpression')].id.name", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$.body..declarations[?(@.init !== null && @.init.type=='FunctionExpression')].init", {resultType:"PATH"});	

	var res3 = jsonpath(ast, "$.body..properties[?(@.value !== null && @.value.type=='FunctionExpression')].key.name", {resultType:"VALUE"});
	var res4 = jsonpath(ast, "$.body..properties[?(@.value !== null && @.value.type=='FunctionExpression')].value", {resultType:"PATH"});	

	var res5 = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='FunctionExpression' )].left", {resultType:"VALUE"});
	var res6 = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='FunctionExpression' )].right", {resultType:"PATH"});	

	var res7 = jsonpath(ast, "$.body..[?(@.type=='FunctionDeclaration' && @.id !== null )].id.name", {resultType:"VALUE"});
	var res8 = jsonpath(ast, "$.body..[?(@.type=='FunctionDeclaration' && @.id !== null )]", {resultType:"PATH"});

	var res9_temp = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='Identifier')].right.name", {resultType:"VALUE"});
	var res10_temp = jsonpath(ast, "$.body..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='Identifier')].right", {resultType:"PATH"});

	
	res2 = res2.concat(res4, res6, res8);
	res1 = res1.concat(res3, res5, res7);
	
	var res9 = [];
	var res10 = [];
	var res11 = [];
	for(var item in res9_temp)
	{
		var i = contains(res1, res9_temp[item]);
		if(i !== -1)
		{
			res9[res9.length] = res9_temp[item];
			res10[res10.length] = res10_temp[item];
			res11[res10.length] = res1[i];
		}
	}
	res2 = res2.concat(res10);	
	res1 = res1.concat(res9);
	//console.log(res1);
	console.log('done merging');
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
					/*if(node.type === 'CallExpression')
					{
						callStatementCount++;
						if(callStatementCount > 1)
						{
							//console.log('Inaccessible!');
							breakFlag =1;
							break;
						}
					}*/
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
						var assignmentArray =[];
						assignmentArray = getAssignmentChain(assignmentChain);
						leftNodes = append(leftNodes, assignmentArray);
						assignmentChain = [];
					}
					else if(node.left.type === 'Identifier')
					{
						assignmentChain[assignmentChain.length] = node.left;
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
						var assignmentArray = [];
						assignmentArray = getAssignmentChain(assignmentChain);
						leftNodes = append(leftNodes, assignmentArray);
						assignmentChain = [];
						//console.log('---'+node.id.name);
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
				identifiedMethods[functionId] = astcopy;
			}
		}
	}
	var count = 0;
	for(var key in identifiedMethods)
	{
		//console.log(key + " : " + JSON.stringify(identifiedMethods[key]));
		count++;
	}
	console.log(count);
	return identifiedMethods;
}

function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}


var fs = require('fs');
var oracle = 'oracle.js'
var path = 'lib/'
var files = fs.readdirSync(path);
var esprima = require('esprima');
console.log(files);

if (process.argv.length < 3)
{
	
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
				functionList = analyzeCode(data);
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
			var functionList = analyzeCode(data);
		//console.log(JSON.stringify(functionList));
	}
	catch(err)
	{
		var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
		dumpError(err);
	}
}

