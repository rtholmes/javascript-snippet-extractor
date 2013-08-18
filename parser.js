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
		var name = node.object.name+'.'+node.property.name;
		for(var j=0; j<nameChain.length;j++)
		{
			name = name +'.'+nameChain[j];
		}
		return name;
	}
	else if(node.object.type === 'ThisExpression')
	{
		//console.log('THIS');
		var name = 'this'+'.'+node.property.name;
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
{/*
	//console.log(itemsVisited.length);
	if(node.hasOwnProperty('type') === false)
	{
		return;
	}
	else if (node.type === 'FunctionDeclaration') 
	{
			//console.log('f-f-f-f-f-f-f---------------',node.id.name, ':', node.params);
			var newFunc = {};
			for(var key in node)
			{
				if (node.hasOwnProperty(key))
				{	
					if(key !== 'body')
						newFunc[key]=node[key];
				}
			}
			//console.log(newFunc);
			knownFunctions[newFunc.id.name]=newFunc;
			
		}
		else if(node.type === 'AssignmentExpression')
		{
			if(node.right.hasOwnProperty('type') === false)
			{
				//return;
			}
			else if(node.right.type === 'AssignmentExpression')
			{
				assignmentChain[assignmentChain.length] = node.left;
			}

			else if(node.right.type === 'FunctionExpression')    
			{
				//if(node.left.type === 'MemberExpression')
					//console.log('f-f-f-f-f-f-f---------------',node.left.object.name, '.', node.left.property.name, ':', node.right.params);
					//console.log(JSON.stringify(node.left));
					//console.log(JSON.stringify(node.right));
					var newFunc = {};
					var obj = {};
					obj['type'] = 'Identifier';
					for(var key in node.right)
					{
						if (node.right.hasOwnProperty(key))
						{	
							if(key !== 'body')
								newFunc[key]=node.right[key];
						}
					}
					
					if(node.left.hasOwnProperty('type') === false)  
					{
						//return;
					}
					else if(node.left.type === 'MemberExpression')    
					{
						
						obj['name'] = visitMemberExpression(node.left, []);
						newFunc.id=obj;
						//console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% '+ newFunc.id.name);
						knownFunctions[newFunc.id.name]=newFunc;
					}
					else if(node.left.type === 'Identifier')    
					{
						obj['name'] = node.left.name;
						newFunc.id=obj;
						knownFunctions[newFunc.id.name]=newFunc;
					}
					
					for(var j=0; j<assignmentChain.length;j++)
					{
						//console.log(JSON.stringify(assignmentChain[j])+'+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
						if(assignmentChain[j] != undefined || assignmentChain[j].hasOwnProperty('type') === false)
						{

						}
						else if(assignmentChain[j].type === 'MemberExpression')    
						{	
							obj['name'] = visitMemberExpression(assignmentChain[j], []);
							newFunc.id=obj;
							knownFunctions[newFunc.id.name]=newFunc;
						}
						else if(assignmentChain[j].type === 'Identifier')
						{
							obj['name']= assignmentChain[j].name;
							newFunc.id=obj;
							knownFunctions[newFunc.id.name]=newFunc;
						}
						else if(assignmentChain[j].type === 'VariableDeclarator')
						{
							obj['name']= assignmentChain[j].id.name;
							newFunc.id=obj;
							knownFunctions[newFunc.id.name]=newFunc;
						}
					}
					//console.log(newFunc);
					assignmentChain=[];
				}

				else if(node.right.type==='Identifier')
				{
					if(knownFunctions.hasOwnProperty(node.right.name))
					{
						var newFunc = knownFunctions[node.right.name];
						var obj = {};
						obj['type'] = 'Identifier';
						if(node.left.hasOwnProperty('type') === false)
						{

						}
						else if(node.left.type === 'MemberExpression')    
						{
							obj['name'] = visitMemberExpression(node.left, []);
							newFunc.id=obj;
							knownFunctions[newFunc.id.name]=newFunc;
						}
						else if(node.left.type === 'Identifier')    
						{	
							obj['name'] = node.left.name;
							newFunc.id=obj;
							knownFunctions[newFunc.id.name]=newFunc;
						}
						

						for(var j=0; j<assignmentChain.length;j++)
						{
							//console.log(JSON.stringify(assignmentChain[j])+'^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
							if(assignmentChain[j].hasOwnProperty('type') === false)
							{

							}
							else if(assignmentChain[j].type === 'MemberExpression')    
							{
								obj['name'] = visitMemberExpression(assignmentChain[j],[]);
								newFunc.id=obj;
								knownFunctions[newFunc.id.name]=newFunc;
								
							}
							else if(assignmentChain[j].type === 'Identifier')
							{
								obj['name']= assignmentChain[j].name;
								newFunc.id=obj;
								knownFunctions[newFunc.id.name]=newFunc;
							}
							else if(assignmentChain[j].type === 'VariableDeclarator')
							{
								obj['name']= assignmentChain[j].id.name;
								newFunc.id=obj;
								knownFunctions[newFunc.id.name]=newFunc;
							}
						}
					}
					assignmentChain=[];
				}
				else if(node.right.type === 'ObjectExpression')
				{
					//console.log('*********************************************************************************************');
					var id;
					if(node.left.hasOwnProperty('type') === false)
					{

					}
					else if(node.left.type === 'MemberExpression')    
					{
						id = visitMemberExpression(node.left, []);
					}
					else if(node.left.type === 'Identifier')    
					{
						id = node.left.name;
					}
					
					for(var i=0; i<node.right.properties.length;i++)
					{
						var property = node.right.properties[i];
						if(property.value.hasOwnProperty('type') === false)
						{
							//return;
						}
						else if(property.value.type === 'Identifier')
						{
							if(knownFunctions.hasOwnProperty(property.value.name))
							{
								var newFunc = knownFunctions[property.value.name];
								var obj = {};
								obj['type'] = 'Identifier';
								obj['name'] = id + '.' + property.key.name;
								newFunc.id = obj;
								knownFunctions[newFunc.id.name] = newFunc;
								for(var j=0; j<assignmentChain.length;j++)
								{
										//console.log(JSON.stringify(assignmentChain[j])+'^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
										if(assignmentChain[j].hasOwnProperty('type') === false)
										{

										}
										else if(assignmentChain[j].type === 'MemberExpression')    
										{
											obj['name'] = visitMemberExpression(assignmentChain[j], [])+'.'+property.key.name;
											newFunc.id=obj;
											knownFunctions[newFunc.id.name]=newFunc;
										}
										else if(assignmentChain[j].type === 'Identifier')
										{
											obj['name']= assignmentChain[j].name+'.'+property.key.name;
											newFunc.id=obj;
											knownFunctions[newFunc.id.name]=newFunc;
										}
										else if(assignmentChain[j].type === 'VariableDeclarator')
										{
											obj['name']= assignmentChain[j].id.name;
											newFunc.id=obj;
											knownFunctions[newFunc.id.name]=newFunc;
										}
										
									}
								}
								else
								{
									nonFunctionProperties[nonFunctionProperties.length] = id + '.' + property.key.name;
								}
							}
							else if (property.value.type === 'FunctionExpression') 
							{
								var newFunc = {};
								for(var key in property.value)
								{
									if (property.value.hasOwnProperty(key))
									{	
										if(key !== 'body')
											newFunc[key]=node.right[key];
									}
								}
								var obj = {};
								obj['type'] = 'Identifier';
								obj['name'] = id+'.' + property.key.name;
								newFunc.id=obj;
								//newFunc.id['name'] = node.left.object.name+'.'+node.left.property.name;
								knownFunctions[newFunc.id.name]=newFunc;
								for(var j=0; j<assignmentChain.length;j++)
								{
									//console.log(JSON.stringify(assignmentChain[j])+'^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
									var obj = {};
									obj['type'] = 'Identifier';
									if(assignmentChain[j] === undefined || assignmentChain[j].hasOwnProperty('type') === false) 
									{

									}
									else if(assignmentChain[j].type === 'MemberExpression')    
									{
										obj['name'] = visitMemberExpression(assignmentChain[j],[])+'.'+property.key.name;
										newFunc.id=obj;
										knownFunctions[newFunc.id.name]=newFunc;
									}
									else if(assignmentChain[j].type === 'Identifier')
									{
										obj['name']= assignmentChain[j].name+'.'+property.key.name;
										newFunc.id=obj;
										knownFunctions[newFunc.id.name]=newFunc;
									}
									else if(assignmentChain[j].type === 'VariableDeclarator')
									{	
										obj['name']= assignmentChain[j].id.name;
										newFunc.id=obj;
										knownFunctions[newFunc.id.name]=newFunc;
									}
									//newFunc.id=obj;
									//knownFunctions[newFunc.id.name]=newFunc;
								}
							}

						}
						assignmentChain=[];
					}
				}
				else if(node.type === 'VariableDeclaration')
				{
					//console.log(node.declarations.length);
					for(var k=0; k<node.declarations.length;k++)
					{
						var declaration = node.declarations[k];
						//console.log(i+ ' ' +declaration.id.name);
						if(declaration.hasOwnProperty('init') === false || declaration.init === null || declaration.init.hasOwnProperty('type') === false)
						{

						}
						else if(declaration.init.type === 'AssignmentExpression')
						{
							var obj = {};
							//obj.type = declaration.type;
							//obj.id = declaration.id;
							for(var key2 in declaration)
							{
								if (declaration.hasOwnProperty(key2))
								{
									if(key!== 'init')	
										obj[key2] = declaration[key2];
								}
							}
							assignmentChain[assignmentChain.length] = obj;
						}
						else if(declaration.init.type === 'FunctionExpression')
						{
							var newFunc = {};
							for(var key in declaration.init)
							{
								if (declaration.init.hasOwnProperty(key))
								{	
									if(key !== 'body')
										newFunc[key]=declaration.init[key];
								}
							}
							var obj = {};
							obj['type'] = 'Identifier';
							obj['name']= declaration.id.name;
							newFunc.id = obj;
							knownFunctions[newFunc.id.name]=newFunc;
							//console.log(newFunc);
							//console.log('fu-fu-fu-fu-fu-fu-fu---------------',declaration.id.name, ':', declaration.init.params);
							assignmentChain=[];
						}
						else if(declaration.init.type === 'ObjectExpression')
						{
							var id = declaration.id.name;
							//console.log(JSON.stringify(declaration) + '^^^^^^^^^^^^^^^^^^^^');
							for(var i=0; i<declaration.init.properties.length;i++)
							{
								var property = declaration.init.properties[i];
								if(property.value.hasOwnProperty('type') === false)
								{

								}
								else if(property.value.type === 'Identifier')
								{
									if(knownFunctions.hasOwnProperty(property.value.name))
									{
										var newFunc = knownFunctions[property.value.name];
										var obj = {};
										obj['type'] = 'Identifier';
										obj['name'] = id + '.' + property.key.name;
										newFunc.id = obj;
										knownFunctions[newFunc.id.name] = newFunc;
									}
									else
									{
										nonFunctionProperties[nonFunctionProperties.length] = id + '.' + property.key.name;
									}
								}
								else if (property.value.type === 'FunctionExpression') 
								{
									var newFunc = {};
									for(var key in property.value)
									{
										if (property.value.hasOwnProperty(key))
										{	
											if(key !== 'body')
												newFunc[key]=property.value[key];
										}
									}
									var obj = {};
									obj['type'] = 'Identifier';
									obj['name'] = id+'.' + property.key.name;
									newFunc.id=obj;
									//newFunc.id['name'] = node.left.object.name+'.'+node.left.property.name;
									knownFunctions[newFunc.id.name]=newFunc;
								}
							}
							assignmentChain=[];
						}

					}

				}
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
	*/}

			function append(array, value)
			{
				/*if(Array.isArray(value))
				{*/
					var newArray = [];
					for(var i=0; i<value.length; i++)
					{
						if(array.length === 0)
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

		

				var res2 = res2.concat(res4, res6, res8);
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
									var nameOfME = visitMemberExpression(node.left, []);
									//console.log('---AE--'+nameOfME);
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
								var tempArray = [];
								tempArray[0]=node.id.name;
								leftNodes = append(leftNodes, tempArray);
								console.log('---'+node.id.name);
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
						identifiedMethods[identifiedMethods.length] = leftNodes[item];
					}
					console.log('------------------------------------------------------------------------------');
				}
 				//console.log(ast[array[0]]);
 			}
 			console.log(identifiedMethods);
 			console.log(identifiedMethods.length);
				/*var video = eval(JSON.stringify(res2[0]).replace('$','ast'));
				console.log(eval(eval(video)));*/

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