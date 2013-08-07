var types = [];

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

var assignmentChain = [];
var knownFunctions = {};


function analyzeCode(code) 
{
	var ast = esprima.parse(code);
	var performAtNode = function(node){

		if (node.type === 'FunctionDeclaration') 
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
			console.log(newFunc);
			knownFunctions[newFunc.id.name]=newFunc;
			
		}
		else if(node.type === 'AssignmentExpression')
		{
			try
			{
				if(node.right.type === 'AssignmentExpression')
				{
					assignmentChain[assignmentChain.length] = node.left;
				}

				else if(node.right.type === 'FunctionExpression')    
				{
					//console.log('f-f-f-f-f-f-f---------------',node.left.object.name, '.', node.left.property.name, ':', node.right.params);
					var newFunc = {};
					for(var key in node.right)
					{
						if (node.right.hasOwnProperty(key))
						{	
							if(key !== 'body')
								newFunc[key]=node.right[key];
						}
					}
					if(node.left.type === 'MemberExpression')    
					{
						var obj = {};
						obj['type'] = 'Identifier';
						obj['name'] = node.left.object.name+'.'+node.left.property.name;
						newFunc.id=obj;
						//newFunc.id['name'] = node.left.object.name+'.'+node.left.property.name;
						knownFunctions[newFunc.id.name]=newFunc;
					}
					for(var j=0; j<assignmentChain.length;j++)
					{
						console.log(JSON.stringify(assignmentChain[j])+'+++++++++++++++++++++++++++++++++++++++++++++++++++++++');
					}
					console.log(newFunc);
					assignmentChain=[];
				}
				else if(node.right.type='Identifier')
				{
					if(knownFunctions.hasOwnProperty(node.right.name))
					{
						//console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
						var newFunc = knownFunctions[node.right.name];
						if(node.left.type === 'MemberExpression')    
						{
							var obj = {};
							obj['type'] = 'Identifier';
							obj['name'] = node.left.object.name+'.'+node.left.property.name;
							newFunc.id=obj;
							//newFunc.id['name'] = node.left.object.name+'.'+node.left.property.name;
							knownFunctions[newFunc.id.name]=newFunc;
						}
						for(var j=0; j<assignmentChain.length;j++)
						{
							console.log(JSON.stringify(assignmentChain[j])+'^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
							if(assignmentChain[j].type === 'MemberExpression')    
							{
								var obj = {};
								obj['type'] = 'Identifier';
								obj['name'] = assignmentChain[j].object.name+'.'+assignmentChain[j].property.name;
								newFunc.id=obj;
								//newFunc.id['name'] = node.left.object.name+'.'+node.left.property.name;
								knownFunctions[newFunc.id.name]=newFunc;
							}
							/*else if(assignmentChain[j].type === 'VariableDeclarator')
							{
								var obj = {};
								obj['type'] = 'Identifier';
								obj['name']= assignmentChain[j].name;
								newFunc.id = obj;
								knownFunctions[newFunc.id.name]=newFunc;
								//console.log(newFunc);
							}*/
						}
					}
					assignmentChain=[];
				}
				
				
				
			}
			catch(err)
			{
				var txt="Error description: " + err.message + "\n\n";
			}

		}
		else if(node.type === 'VariableDeclaration')
		{
			for(var i=0; i<node.declarations.length;i++)
			{
				var declaration = node.declarations[i];
				try
				{
					if(declaration.init.type === 'FunctionExpression')
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
						console.log(newFunc);
						//console.log('fu-fu-fu-fu-fu-fu-fu---------------',declaration.id.name, ':', declaration.init.params);
					}
				}
				catch(err)
				{
					var txt="Error description: " + err.message + "\n\n";
				}
			}
		}
	};
	var itemsVisited = [];
	traverse(ast, performAtNode, itemsVisited);
}

/*function processResults(results) 
{
	for (var name in results) 
	{
		if (results.hasOwnProperty(name)) 
		{
			var stats = results[name];
			if (stats.declarations === 0) 
			{
				console.log('Function', name, 'undeclared');
			} 
			else if (stats.declarations > 1) 
			{
				console.log('Function', name, 'decalred multiple times');
			} 
			else if (stats.calls === 0) 
			{
				console.log('Function', name, 'declared but not called');
			}
		}
	}
}*/


if (process.argv.length < 3)
{
	console.log('Usage: analyze.js file.js');
	process.exit(1);
}


fs = require('fs');
var filename = process.argv[2];
var data = fs.readFileSync(filename);

var esprima = require('esprima');
	//console.log(esprima.parse(data));
analyzeCode(data);
console.log(types.sort());
for(key in knownFunctions)
	console.log(key);

