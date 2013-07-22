function traverse(node, func) {
    func(node);
    for (var key in node) {
        if (node.hasOwnProperty(key)) {
            var child = node[key];
            if (typeof child === 'object' && child !== null) {

                if (Array.isArray(child)) {
                    child.forEach(function(node) {
                        traverse(node, func);
                    });
                } else {
                    traverse(child, func);
                }
            }
        }
    }
}

function analyzeCode(code) {
    var ast = esprima.parse(code);
    var functionsStats = {}; //1
    var addStatsEntry = function(funcName) { //2
        if (!functionsStats[funcName]) {
            functionsStats[funcName] = {calls: 0, declarations:0};
        }
    };

    traverse(ast, function(node) {
        if (node.type === 'FunctionDeclaration') {
            addStatsEntry(node.id.name); //3
            functionsStats[node.id.name].declarations++;
        } else if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
            addStatsEntry(node.callee.name);
            functionsStats[node.callee.name].calls++; //4
        }
        else if(node.type === 'AssignmentExpression')
        {
		if(node.right.type === 'FunctionExpression')    
		{
			console.log(node.left.object.name, '.', node.left.property.name, ':', node.right.params);
		}    	
        }
    });
    //processResults(functionsStats);
}

function processResults(results) {
    for (var name in results) {
        if (results.hasOwnProperty(name)) {
            var stats = results[name];
            if (stats.declarations === 0) {
                console.log('Function', name, 'undeclared');
            } else if (stats.declarations > 1) {
                console.log('Function', name, 'decalred multiple times');
            } else if (stats.calls === 0) {
                console.log('Function', name, 'declared but not called');
            }
        }
    }
}


function getFunctions(ast)
{
	//console.log(ast.type);
}

fs = require('fs');
var data = fs.readFileSync('lib/backbone.js', 'utf8');
var esprima = require('esprima');

analyzeCode(data);
//console.log('Done');


//var ast = esprima.parse(data);
//console.log(JSON.stringify(output, null, 4));

getFunctions(ast);



