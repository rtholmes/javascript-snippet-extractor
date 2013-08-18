var types = [];

var parentNodes = {};

/*function traverse2(obj,func, parent) {
  for (i in obj){
    func.apply(this,[i,obj[i],parent]);      
    if (obj[i] instanceof Object && !(obj[i] instanceof Array)) {
      traverse2(obj[i],func, i);
    }
  }
}
 
function getPropertyRecursive(obj, property){
  var acc = [];
  traverse2(obj, function(key, value, parent){
    if(key === property){
      acc.push({parent: parent, value: value});
    }
  });
  return acc;
}*/

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

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
  	return this.indexOf(str) == 0;
  };
}

function traverse(node, performAtNode, itemsVisited)
{
	performAtNode(node);
	if(itemsVisited.length !=0 )
		console.log(itemsVisited);
	for (var key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			var child = node[key];
			if (typeof child === 'object' && child !== null) 
			{
				if (Array.isArray(child)) 
				{
					child.forEach(function(node) 
					{
						if(key === 'init')
						{
							var itemsVisited2 = itemsVisited;
							itemsVisited2.push(node.id.name);
							traverse(child, performAtNode, itemsVisited2);
						}
						traverse(node, performAtNode, itemsVisited);
					});
				}
				else 
				{
					
					//else
					traverse(child, performAtNode, itemsVisited);
				}
			}
		}
	}
}


var performAtNode = function(node)
{
	
				else if(node.type === 'MemberExpression')    
				{
					id = visitMemberExpression(node,[]);
					if(nonFunctionProperties.indexOf(id) === -1)
						nonFunctionProperties[nonFunctionProperties.length]=id;
					
				}
				else if(node.type === 'FunctionExpression')    
				{
					//id = visitMemberExpression(node,[]);
					if(nonFunctionProperties.indexOf(id) === -1)
						nonFunctionProperties[nonFunctionProperties.length]=id;
					
				}
	}

			function append(array, value)
			{
				/*if(Array.isArray(value))
				{*/
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
					//array = newArray;
				//}
				/*else
				{
					if(array.length == 0)
					{
						array[0] = value;
					}
					else
					{
						for(var item in array)
						{
							array[item] = array[item].concat('.',value);
						}
					}
				}*/
				//console.log(newArray);
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
					//console.log(array);
					return array;
			}

			function isInt(value) 
			{
				return !isNaN(parseInt(value,10)) && (parseFloat(value,10) == parseInt(value,10)); 
			}
			
			function analyzeCode(code) 
			{
				//var ast = esprima.parse(code, {loc : true});
				var ast = esprima.parse(code);
				var identifiedMethods = [];
				//traverse(ast, performAtNode, itemsVisited);

				var jsonpath = require('JSONPath').eval;
				var res1 = jsonpath(ast, "$.body[0]..declarations[?(@.init !== null && @.init.type=='FunctionExpression')].id.name", {resultType:"VALUE"});
				var res2 = jsonpath(ast, "$.body[0]..declarations[?(@.init !== null && @.init.type=='FunctionExpression')].id.name", {resultType:"PATH"});	
				console.log('done 1');

				var res3 = jsonpath(ast, "$.body[0]..properties[?(@.value !== null && @.value.type=='FunctionExpression')].key.name", {resultType:"VALUE"});
				var res4 = jsonpath(ast, "$.body[0]..properties[?(@.value !== null && @.value.type=='FunctionExpression')].key.name", {resultType:"PATH"});	
				console.log('done 2');				
				
				var res5 = jsonpath(ast, "$.body[0]..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='FunctionExpression' )].left", {resultType:"VALUE"});
				var res6 = jsonpath(ast, "$.body[0]..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='FunctionExpression' )].left", {resultType:"PATH"});	
				console.log('done 3');

				var res7 = jsonpath(ast, "$.body[0]..[?(@.type=='FunctionDeclaration' && @.id !== null )].id.name", {resultType:"VALUE"});
				var res8 = jsonpath(ast, "$.body[0]..[?(@.type=='FunctionDeclaration' && @.id !== null )].id.name", {resultType:"PATH"});
				console.log('done 4');

				var res9_temp = jsonpath(ast, "$.body[0]..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='Identifier')].right.name", {resultType:"VALUE"});
				var res10_temp = jsonpath(ast, "$.body[0]..[?(@.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='Identifier')].right", {resultType:"PATH"});
				console.log('done 5');
				
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
				res2 = res2.concat(res4, res6, res8);
				res1 = res1.concat(res3, res5, res7);

				var res9 = [];
				var res10 = [];
				for(var item in res9_temp)
				{

					if(contains(res1, res9_temp[item]) === true)
					{
						res9[res9.length] = res9_temp[item];
						res10[res10.length] = res10_temp[item];
					}
				}
				res2 = res2.concat(res10);	
				res1 = res1.concat(res9);
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
							if(node.hasOwnProperty('type'))
							{
								if(node.type === 'CallExpression')
								{
									callStatementCount++;
									if(callStatementCount > 1)
									{
										console.log('Inaccessible!');
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
									console.log('---'+node.left.name);
									assignmentChain = [];
								}
							}
							if(node.type === 'VariableDeclarator')
							{
								if(node.init.type === 'AssignmentExpression')
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
									console.log('---'+node.id.name);
								}
							}
							if(node.type === 'Property')
							{
								var tempArray = [];
								tempArray[0]=node.key.name;
								leftNodes = append(leftNodes, tempArray);
								console.log('---'+node.key.name);
							}
							if(node.type === 'FunctionDeclaration')
							{
								var tempArray = [];
								tempArray[0]=node.id.name;
								leftNodes = append(leftNodes, tempArray);
								console.log('-------'+node.id.name);
							}
					}
					astcopy = node;
				}
				if(breakFlag !== 1)
				{
					console.log(leftNodes);
					for(var item in leftNodes)
					{
						var functionId = leftNodes[item];
						identifiedMethods[identifiedMethods.length] = functionId;
					}
					console.log('------------------------------------------------------------------------------');
				}
 				//console.log(ast[array[0]]);
 			}
 			console.log(identifiedMethods);
 			console.log(identifiedMethods.length);
				/*var video = eval(JSON.stringify(res2[0]).replace('$','ast'));
				console.log(eval(eval(video)));*/
				/*for(var item in res9)
				{
					console.log(res9[item] + " : " + res10[item]);
				}*/
		}


			if (process.argv.length < 3)
			{
				console.log('Usage: analyze.js file.js');
				process.exit(1);
			}

			var assignmentChain = [];
			var knownFunctions = {};
			var nonFunctionProperties= [];
			var variableList = {};
			fs = require('fs');
			var filename = process.argv[2];
			var data = fs.readFileSync(filename);
			var esprima = require('esprima');
	//console.log(esprima.parse(data));
	try
	{
		analyzeCode(data);
	}
	catch(err)
	{
		var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
		dumpError(err);
	}

	console.log('------------------------------------------------');
	console.log(types.sort());
	console.log('------------------------------------------------');
	var keys = Object.keys(knownFunctions);
	console.log(keys.sort());
	console.log('------------------------------------------------');
	//console.log(nonFunctionProperties.sort());


	function dumpError(err) {
		if (typeof err === 'object') {
			if (err.message) {
				console.log('\nMessage: ' + err.message)
			}
			if (err.stack) {
				console.log('\nStacktrace:')
				console.log('====================')
				console.log(err.stack);
			}
		} else {
			console.log('dumpError :: argument is not an object');
		}
	}