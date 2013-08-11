function traverse(node, performAtNode, itemsVisited)
{
	performAtNode(node);
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

var memberExpChain = [];

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

function analyzeCode(code) 
{
	var ast = esprima.parse(code);
	var itemsVisited = [];
	traverse(ast, performAtNode, itemsVisited);
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


function dumpError(err) 
{
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