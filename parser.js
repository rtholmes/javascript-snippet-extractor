function traverse(node, func) 
{
	func(node);
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
						traverse(node, func);
					});
				} 
				else 
				{
					traverse(child, func);
				}
			}
		}
	}
}

function analyzeCode(code) 
{
	var ast = esprima.parse(code);
	var functionsStats = {};
	var addStatsEntry = function(funcName) 
	{
		if (!functionsStats[funcName]) 
		{
			functionsStats[funcName] = {calls: 0, declarations:0};
		}
	};

	traverse(ast, function(node){
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
		}
		else if(node.type === 'AssignmentExpression')
		{
			try
			{
				if(node.right.type === 'FunctionExpression')    
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
						//console.log('+++++++++++++++++++++++++',node.left.object.name, '.', node.left.property.name, ':', node.right.params);
						newFunc['id'] = node.left.object.name+'.'+node.left.property.name;
					}

					console.log(newFunc);
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
						newFunc['id'] = declaration.id.name;
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
	}
	);
}

function processResults(results) 
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
}


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