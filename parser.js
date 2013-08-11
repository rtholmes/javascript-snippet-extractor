var types = [];

var parentNodes = {};

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
	if(types.indexOf(node.type) === -1)
	{
		types[types.length]=node.type;
	}
	//console.log(itemsVisited);
	//console.log('------------------------------------');
	for (var key in node) 
	{
		if(node.hasOwnProperty('id') && node.id!== null)
		{
			if(node.id.hasOwnProperty('name'))
				itemsVisited[itemsVisited.length]=node.id.name;
		}
		if (node.hasOwnProperty(key)) 
		{
			var child = node[key];
			if (typeof child === 'object' && child !== null) 
			{
				if (Array.isArray(child)) 
				{
					child.forEach(function(node) 
					{
						traverse(node, performAtNode, itemsVisited);
					});
				} 
				else 
				{
					traverse(child, performAtNode, itemsVisited);
				}
			}
		}
	}
}


var performAtNode = function(node)
{
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
								obj['name'] = visitMemberExpression(assignmentChain[j]);
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

}


			
			function analyzeCode(code) 
			{
				//var ast = esprima.parse(code, {loc : true});
				var ast = esprima.parse(code);
				var itemsVisited = [];
				
				traverse(ast, performAtNode, itemsVisited);
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
