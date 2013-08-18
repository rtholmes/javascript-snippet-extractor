var performAtNode = function(node)
{
	if(node.hasOwnProperty('type') === false)
	{

	}
	else if(node.type === 'CallExpression')
	{
		var callee = node.callee;
		var name;
		if(callee.type === 'MemberExpression')
		{
			name = visitMemberExpression(callee, []);
			//console.log(name);
		}
		else if(callee.type === 'Identifier')
		{
			name = callee.name;
			//console.log(name);
		}
		else if(true)
		{

		}
		console.log(name + '  :  ' + node.arguments.length);
	}

}
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
		var name = node.object.callee.name+'().'+node.property.name;
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
			return true;
		}
	}
	return false;
}

function analyzeCode(code) 
{
	var ast = esprima.parse(code);
	var identifiedMethods = [];
	var jsonpath = require('JSONPath').eval;

/*
	var res1 = jsonpath(ast, "$.body[0]..[?(@.type=='CallExpression' && @.property !== null && @.property.type=='Identifier' )].property.name", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$.body[0]..[?(@.type=='CallExpression' && @.property !== null && @.property.type=='Identifier' )].property.name", {resultType:"PATH"});*/	

	var res1 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"PATH"});	
	console.log('done 3');

	//console.log(res1[item] + ' : ' + res2[item]);
	var breakFlag = 0;
	for(item in res2)
	{
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
				if(node.hasOwnProperty('type'))
				{
					console.log(node.type);
				}
			}
			astcopy = node;
		}
		console.log(astcopy);
		console.log('-------------------');
	}
}


fs           = require('fs');
var filename = process.argv[2];
var data     = fs.readFileSync(filename);
var esprima  = require('esprima');
try
{
	analyzeCode(data);
}
catch(err)
{
	var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
	dumpError(err);
}