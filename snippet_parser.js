function lcs(lcstest, lcstarget) {
	matchfound = 0
	lsclen = lcstest.length
	for(lcsi=0; lcsi<lcstest.length; lcsi++){
		lscos=0
		for(lcsj=0; lcsj<lcsi+1; lcsj++){
			re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
			temp = re.test(lcstest);
			re = new RegExp("(" + RegExp.$1 + ")", "i");
			if(re.test(lcstarget)){
				matchfound=1;
				result = RegExp.$1;
				break;
			}
			lscos = lscos + 1;
		}
		if(matchfound==1){return result; break;}
		lsclen = lsclen - 1;
		//
	}
	result = "";
	return result;
}
var possibleFile = null;
function visitMemberExpression(node, nameChain, flg)
{
	//possibleFile = null;
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
	else if(node.object.type === 'ArrayExpression')
	{
		//console.log('THIS');
		var name = 'ArrayExpression';
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			name = name +'.'+node.property.name;
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
		//var mname = node.object.callee.name+'().'+node.property.name;
		var mname = node.object.callee.name;
		//console.log(mname + "." + node.property.name);
		if(flg===1)
		{
			//console.log(mname + "." + node.property.name);
			possibleFile = mname;
		}
		var name = 'undefined.'+node.property.name;
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
		return visitMemberExpression(node.object, nameChain, 0);
	}
	else
	{
		if(node.property.name !== 'prototype' && node.property.name !== 'self')
			return "undefined."+node.property.name;
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
			name = visitMemberExpression(assignmentChain[j], [], 0);
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


function arrayContains(a, obj) 
{
	var i = a.length;
	while (i--) 
	{
		if (a[i]['file'] === obj['file'] && a[i]['method'] === obj['method'] && a[i]['call'] === obj['call']) 
		{
			return true;
		}
	}
	return false;
}

function hasKey(obj, a)
{
	for(var key in obj)
	{
		if(key === a)
			return true;
	}
	return false;
}

function stringArrayContains(array, element)
{
	var i = array.length;
	while(i>=0)
	{
		if(array[i] === element)
			return true
		i--;
	}
	return false;
}


function getRequiresList(res3, res4, ast)
{
	//console.log("I was here!!!!");
	var requires = {};
	for(var item in res3)
	{
		var test = res4[item];
		test = test.slice(1);
		var array = test.split(']');
		for(var item2 in array)
		{
			if(isInt(array[item2][1]))
				array[item2] = array[item2].slice(1);
			else
				array[item2] = array[item2].slice(2, -1);
		}
		var astcopy = ast;
		var leftNodes = [];
		for(var item2 in array)
		{
			var node = astcopy[array[item2]];
			if(node !== undefined)
			{
				if(node.hasOwnProperty('type'))
				{
					//console.log(node.type);
				}
				astcopy = node;
			}
			
		}
		if(astcopy.type === 'AssignmentExpression')
		{
			//console.log("I was here!!!!");
			if(astcopy.left.type === 'Identifier')
			{
				//console.log('re-id : ' + astcopy.left.name + ' : ' + astcopy.right.arguments[0].value);
				requires[astcopy.left.name] = astcopy.right.arguments[0].value;
			}
			else if(astcopy.callee.type === 'MemberExpression')
			{
				var mName = visitMemberExpression(astcopy.callee, [], 0)
				//console.log('re-me : ' + mName + ' : ' + astcopy.right.arguments[0].value);
				requires[mName] = astcopy.right.arguments[0].value;		
			}
			else
			{
				//console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.property.name);
			}
		}
		/*else if (astcopy.type === 'MemberExpression')
		{
			if(astcopy.left.type === 'Identifier')
			{
				//console.log('re-id : ' + astcopy.left.name + ' : ' + astcopy.right.arguments[0].value);
				requires[astcopy.left.name] = astcopy.right.arguments[0].value;
			}
			else if(astcopy.callee.type === 'MemberExpression')
			{
				var mName = visitMemberExpression(astcopy.callee, [])
				//console.log('re-me : ' + mName + ' : ' + astcopy.right.arguments[0].value);
				requires[mName] = astcopy.right.arguments[0].value;		
			}
			else
			{
				console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.property.name);
			}
		}*/
		else if(astcopy.type === 'VariableDeclarator')
		{
			//console.log("I was here too!!!!");
			if(astcopy.id.type === 'Identifier')
			{
				//console.log('re-id v : ' + astcopy.left.name + ' : ' + astcopy.right.arguments[0].value);
				requires[astcopy.id.name] = astcopy.init.arguments[0].value;
			}
			else if(astcopy.id.type === 'MemberExpression')
			{
				var mName = visitMemberExpression(astcopy.id, [], 0)
				//console.log('re-me v : ' + mName + ' : ' + astcopy.right.arguments[0].value);
				requires[mName] = astcopy.init.arguments[0].value;		
			}
			else
			{
				//console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.property.name);
			}
		}
}
return requires;
}

function getMethodCalls(res2, ast)
{
	var methodCalls = [];
	for(var item in res2)
	{
		var test = res2[item];
		test = test.slice(1);
		var array = test.split(']');
		for(var item2 in array)
		{
			if(isInt(array[item2][1]))
				array[item2] = array[item2].slice(1);
			else
				array[item2] = array[item2].slice(2, -1);
		}
		var astcopy = ast;
		for(var item2 in array)
		{
			var node = astcopy[array[item2]];
			if(node !== undefined)
			{
				if(node.hasOwnProperty('type'))
				{
					//console.log(node.type);
				}
				astcopy = node;
			}
			
		}
		if(astcopy.callee.type === 'Identifier')
		{
			//console.log('id : ' + astcopy.callee.name);
			var tempObj = {};
			tempObj['method'] = astcopy.callee.name;
			tempObj['file'] = null;
			methodCalls[methodCalls.length] = tempObj;
			//possibleFile = null;
		}
		else if(astcopy.callee.type === 'MemberExpression')
		{
			var mName = visitMemberExpression(astcopy.callee, [] ,1)
			//console.log('me : ' + mName + possibleFile);
			var tempObj = {};
			tempObj['method'] = mName;
			tempObj['file'] = possibleFile;
			methodCalls[methodCalls.length] = tempObj;
			possibleFile = null;
		}
		else
		{
			//console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' + ' ' + astcopy.callee.type);
		}
		//console.log(astcopy.type);
		//console.log('-------------------');
	}
	return methodCalls;
}
var errCount=0;
function analyzeCode(code, filename, oracleObject, fetchAPI, printAnswer) 
{
	var ast = null;
	try{
		ast = esprima.parse(code);
	}
	catch(err){
		errCount++;
		return;
	}
	var identifiedMethods = [];
	var jsonpath = require('JSONPath').eval;

	var res1 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"VALUE"});
	var res2 = jsonpath(ast, "$..[?(@.type=='CallExpression' && @.callee !== null)]", {resultType:"PATH"});	

	var res3 = jsonpath(ast, "$..?(@.type!== null && @.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='CallExpression' && @.right.callee!== null && @.right.callee.name=='require')", {resultType:"VALUE"});
	var res4 = jsonpath(ast, "$..?(@.type!== null && @.type=='AssignmentExpression' && @.right.type !== null && @.right.type=='CallExpression' && @.right.callee!== null && @.right.callee.name=='require')", {resultType:"PATH"});	

/*
	var res5 = jsonpath(ast, "$.body[0]..[?(@.type=='MemberExpression' && @.object.type !== null && @.object.type=='CallExpression' && @.object.callee!== null && @.object.callee.name=='require')]", {resultType:"VALUE"});
	var res6 = jsonpath(ast, "$.body[0]..[?(@.type=='MemberExpression' && @.object.type !== null && @.object.type=='CallExpression' && @.object.callee!== null && @.object.callee.name=='require')]", {resultType:"PATH"});	
*/
	var res7 = jsonpath(ast, "$..?(@.type!== 'null' && @.type=='VariableDeclarator' && @.init.type !== null && @.init.type=='CallExpression' && @.init.callee!== null && @.init.callee.name=='require')", {resultType:"VALUE"});
	var res8 = jsonpath(ast, "$..?(@.type!== null && @.type=='VariableDeclarator' && @.init.type !== null && @.init.type=='CallExpression' && @.init.callee!== null && @.init.callee.name=='require')", {resultType:"PATH"});	

	//console.log(res1[item] + ' : ' + res2[item]);

	/*res3 = res3.concat(res5);	
	res4 = res4.concat(res6);*/
	res3 = res3.concat(res7);	
	res4 = res4.concat(res8);

	var requires = getRequiresList(res3, res4, ast);
	var methodCalls = getMethodCalls(res2, ast);
	//console.log(res3);
	fetchLocal(filename, requires, methodCalls, fetchAPI, oracleObject, printAnswer);
}

function printObject(analyzedSnippet)
{
	for(var key in analyzedSnippet)
	{
		if(key === 'requires')
		{
			for(var item in analyzedSnippet['requires'])
			{
				//console.log('req- ' + item + ' : ' + analyzedSnippet['requires'][item]);
			}
		}
		else if(key === 'methodcalls')
		{
			//console.log('has key');
			for(var i=0; i<analyzedSnippet['methodcalls'].length; i++)
			{
				//console.log('call- ' + i + ' : ' + analyzedSnippet['methodcalls'][i]);
			}
		}
	}
}

function fetchOracle()
{
	var oracle = 'oracle.js'
	var dataFile = fs.readFileSync(oracle);
	var oracleObject = JSON.parse(dataFile);
	return oracleObject;
}

var matchMap = {"$":"jQuery"};
// mname : file
function mapMethod(mname, fname, oracleObject)
{
	var objArray = [];
	var flag = 0;
	
		var new_js = null;
		//console.log("++++" + fname);
		if(hasKey(matchMap,fname))
		{
			new_js = matchMap[fname];
			//console.log("worked " + new_js);
		}
		if(new_js!==null)
		{
			//console.log("worked " + new_js + mname);
			var js = new_js;
			for(var key in oracleObject[js])
			{
				//console.log(key);
				var new_mname = null;
				if(mname.indexOf("undefined") != -1)
				{
					new_mname = mname.replace("undefined", js);
				}
				else
					new_mname = mname;
				if(key.toLowerCase() === new_mname.toLowerCase() || key.toLowerCase() === "window."+new_mname.toLowerCase())
				{
					//console.log('match: ' + js + ' : ' + key);
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 0;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
					//return obj;
				}
				else if(new_mname.endsWith('.'+key))
				{
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 0;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
				}
				else
				{
					var match = getLongestMatch(mname, key);
					if(match!==null)
					{
						var obj = {};
						obj['file'] = js;
						obj['method'] = key;
						obj['source'] = 5;
						obj['match'] = match;
						obj['call'] = mname;
						if(!arrayContains(objArray, obj))
						{
							objArray[objArray.length] = obj;
							flag =1;
						}
					}
				}
				
			
			}
		}

	if(flag===0)
	{

			//console.log("worked " + new_js + mname);
			var js = "jscore";
			for(var key in oracleObject[js])
			{
				//console.log(key);
				var new_mname = null;
				if(mname.indexOf("undefined") != -1)
				{
					new_mname = mname.replace("undefined", js);
				}
				else
					new_mname = mname;
				if(key.toLowerCase() === new_mname.toLowerCase() || key.toLowerCase() === "window."+new_mname.toLowerCase())
				{
					//console.log('match: ' + js + ' : ' + key);
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 0;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
					//return obj;
				}
				else if(new_mname.endsWith('.'+key))
				{
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 0;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
				}
				else
				{
					var match = getLongestMatch(mname, key);
					if(match!==null)
					{
						var obj = {};
						obj['file'] = js;
						obj['method'] = key;
						obj['source'] = 5;
						obj['match'] = match;
						obj['call'] = mname;
						if(!arrayContains(objArray, obj))
						{
							objArray[objArray.length] = obj;
							flag =1;
						}
					}
				}
				
			
			}
		
	}
	
	if(flag===0)
	for(var js in oracleObject)
	{
		for(var key in oracleObject[js])
		{
			//console.log(key);
			if(key.toLowerCase() === mname.toLowerCase() || key.toLowerCase() === "window."+mname.toLowerCase())
			{
				//console.log('match: ' + js + ' : ' + key);
				var obj = {};
				obj['file'] = js;
				obj['method'] = key;
				obj['source'] = 1;
				obj['call'] = mname;
				if(!arrayContains(objArray, obj))
				{
					//console.log("!!!"+ key + " " + js);
					matchMap[key] = js;
					objArray[objArray.length] = obj;
					flag = 1;
				}
				//return obj;
			}
		}
	}
	if(flag === 0)
	{
		for(var js in oracleObject)
		{
			for(var key in oracleObject[js])
			{
				var new_name = js + '.' + key; 
				if(new_name.toLowerCase() === mname.toLowerCase())
				{
					//console.log('match: ' + js + ' : ' + key);
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 2;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						matchMap[key] = js;
						objArray[objArray.length] = obj;
						flag = 1;
					}
					//return obj;
				}
			}
		}
	}
	if(flag === 0)
	{
		for(var js in oracleObject)
		{
			for(var key in oracleObject[js])
			{
				if(key.endsWith('.'+mname) === true)
				{
					//console.log('match: ' + key + ' : ' + key);
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 3;
					obj['call'] = mname;
					if(!arrayContains(objArray, obj))
					{
						objArray[objArray.length] = obj;
						flag = 1;
					}
					//return obj;
				}
			}
		}
	}
	if(flag === 0)
	{
		var objArray2 = [];
		for(var js in oracleObject)
		{
			for(var key in oracleObject[js])
			{
				var match = getLongestMatch(mname, key);
				if(match!==null)
				{
					var obj = {};
					obj['file'] = js;
					obj['method'] = key;
					obj['source'] = 5;
					obj['match'] = match;
					obj['call'] = mname;
					if(!arrayContains(objArray2, obj))
						objArray2[objArray2.length] = obj;
				}
				
			}

		}
		var objArrayMin = [];
		var longest = 0;
		for(var index=0; index<objArray2.length;index++)
		{
			if(objArray2[index]['match'].length > longest)
			{
				objArrayMin = [];
				objArrayMin[objArrayMin.length] = objArray2[index];
				longest = objArray2[index]['match'].length;
			}
			else if(objArray2[index]['match'].length === longest)
			{
				objArrayMin[objArrayMin.length] = objArray2[index];
				longest = objArray2[index]['match'].length;
			}
		}
		objArray = objArray.concat(objArrayMin);
	}
	
	if(objArray.length === 0)
		return null;
	else
		return objArray;
}

function getLongestMatch(mname, key)
{
	var tokens = mname.split('.');
	var temp = null;
	var foundFlag = 0;
	var ans = null;
	for(var i=tokens.length-1; i>=0;i--)
	{

		if(temp === null)
			temp = tokens[i];
		else
			temp = tokens[i] + '.' + temp;
		//console.log(temp);
		if((key.indexOf('.'+temp)!==-1 && key.endsWith('.'+temp)===true)|| key === temp)
		{
			foundFlag = 1;
			ans = temp;
		}
		else if(foundFlag === 1)
			break;
	}
	return ans;
}

function fetchAPI(analyzedSnippet, oracleObject, printAnswer, k)
{
	var apifound = [];
	var apinotfound = [];
	for(var key in analyzedSnippet)
	{
		if(key === 'methodcalls')
		{
			for(var i=0; i<analyzedSnippet['methodcalls'].length; i++)
			{
				//var op = mapMethod(analyzedSnippet['methodcalls'][i]['method'], oracleObject);
				var op = mapMethod(analyzedSnippet['methodcalls'][i]['method'], analyzedSnippet['methodcalls'][i]['file'], oracleObject);
				if(op!==null && op!=undefined)
					apifound[apifound.length] = op;
				else
					apinotfound[apinotfound.length] = analyzedSnippet['methodcalls'][i];
			}
		}
	}
	var temp = {};
	temp['found'] = apifound;
	temp['notfound'] = apinotfound;
	printAnswer(temp, k, analyzedSnippet['requires']);
}
function fetchLocal(filename, requires, methodCalls, fetchAPI, oracleObject, printAnswer)
{
	var sys = require('util')
	var exec = require('child_process').exec;
	//var child = exec("node parser.js " + filename, function (error, stdout, stderr) {
	//var child = exec("", function (error, stdout, stderr) {
		//sys.print('stdout: ' + stdout);
		
		/*if (error !== null) {
			console.log('exec error: ' + error);
		}*/

		//var localMethods = stdout;
		var localMethods = "";
		var methods = localMethods.split("\n");
		//methods = methods.slice(1, methods.length-2);
		//console.log(methods);
		var newMethodCalls = [];
		var k =0;
		for(var i=0; i<methodCalls.length; i++)
		{
			if(stringArrayContains(methods, methodCalls[i]['method']) === false)
			{
				//console.log("----" + methodCalls[i]);
				var obj = {};
				obj['method'] = methodCalls[i]['method'];
				obj['file'] = methodCalls[i]['file'];
				newMethodCalls[newMethodCalls.length] = obj;
			}
			else
			{
				//console.log("+++LOCAL : "+methodCalls[i]['method']);
				k++;
			}
		}
		var obj = {};
		obj['requires'] = requires;
		obj['methodcalls'] = newMethodCalls;
		fetchAPI(obj, oracleObject, printAnswer, k);
	//});
}

var filedb = "javascript.db";
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(filedb);
function printAnswer(answer, k, requires)
{
	//console.log('***********************\nFOUND:');
	
	/*db.serialize(function() {
			  var stmt = db.prepare("INSERT INTO map VALUES (?,?,?,?)");
			  stmt.run(aid, qid, codeid, globalCode, function(err) {
                if (err) throw err;
                //inserted1++;
            	});
			  
			  stmt.finalize();
			});*/
	
	//var exists = fs.existsSync(file);
	
	var i=0,j=0;
	for(i=0; i<answer['found'].length; i++)
	{
		//console.log('----------\n' + answer['found'][i][0]['call']);
		for(var j=0;j<answer['found'][i].length; j++)
		{
			console.log(answer['found'][i][j]['file']+'  :  '+answer['found'][i][j]['method'] + '   -   ' + answer['found'][i].length);
			var answermethod = answer['found'][i][j]['method'];
			var answerfile = answer['found'][i][j]['file'];
			var answerlength = answer['found'][i].length;
			/*db.serialize(function() {
				var data = [aid, codeid,answer['found'][i][j]['method'], answer['found'][i][j]['file'], answer['found'][i].length, scriptFlag ];
				console.log(data);
				//var stmt = db.prepare("INSERT INTO types VALUES (?,?,?,?,?,?)", data, function (succ){ if(succ===null) console.log("success")});
				var stmt = db.prepare("INSERT INTO types VALUES (1,1,1,1,1,1)");
				stmt.run();
				stmt.finalize();
				//console.log(stmt);
				stmt.run();
				data = [aid, qid, codeid, globalCode];
				stmt = db.prepare("INSERT INTO map VALUES (?,?,?,?)", data);
				//console.log(stmt);
				stmt.run();
				stmt.finalize();
			});*/
			
			db.serialize(function() {

				var stmt = db.prepare("INSERT INTO types VALUES (?,?,?,?,?,?)");
			  stmt.run(aid, codeid,answermethod, answerfile,answerlength, scriptFlag, function(err) {
                if (err) throw err;
                //inserted1++;
            });
			  //Insert random data
			  stmt.finalize();
			  //Insert random data
			  
			});


	
		}
	}
	
	//console.log('***********************\nNOT FOUND:');
	for(var j=0; j<answer['notfound'].length; j++)
	{
		/*if(stringArrayContains(localMethods, answer['notfound'][j]) === true)
		{
			console.log("+++LOCAL : "+answer['notfound'][j]);
			k++;
		}
		else*/
		{
			//console.log(answer['notfound'][j]);
			//l++;
		}
	}
	//console.log('***********************\nREQUIRES:');
	for(var key in requires)
	{
		//console.log(requires[key])
	}
	//console.log('***********************\nSTATS: ');
	console.log("Mapped- "+(i).toString()+ ": Unmapped- " + (j).toString() + " : Local Calls- " + k.toString());
}



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


var esprima  = require('esprima');
var fs = require('fs');
var parseString = require('xml2js').parseString;


/*var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("javascript.db");*/

/*db.serialize(function() {
  //db.run("CREATE TABLE lorem (info TEXT)");

  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});*/



fs.readFile( '/home/s23subra/workspace/stackoverflow/javascript_codes_specifictags_final.xml', function(err, data) {
    
        parseString(data, function (err, results) {
       	traverseXML(results);
    	db.close();
});

});

var globalCode;
var aid;
var codeid;
var scriptFlag;
var tags;
var code;
var qid;
function traverseXML(result)
{

	//console.log(JSON.stringify(result));
	var postArray = result.root.post;
	var counter = 0;
	for(var i=0; i<postArray.length; i++)
	{
		var postContent = postArray[i];
		//console.log(postContent['aid'][0]);
		aid = postContent['aid'][0];
		qid = postContent['qid'][0];
		codeid = postContent['codeid'][0];
		scriptFlag = postContent['scriptFlag'][0];
		tags = postContent['tags'][0];
		code = postContent['code'][0];
		code = code.replace("&lt;", "<");
		code = code.replace("&gt;", ">");
		code = code.replace("&amp;", "&");
		code = code.replace("&quot;", "\"");
		globalCode = code;

		try
		{
			var oracleObject = fetchOracle();
			var analyzedSnippet = analyzeCode(code, null, oracleObject, fetchAPI, printAnswer);
			counter++;
			//if(counter>5)
			//{
		//		break;
	//			return;
//			}
			console.log("COUNTER: ------"+counter);
			//printObject(analyzedSnippet);
			//var answer = fetchAPI(analyzedSnippet, oracleObject);
			//fetchLocal(filename , answer, printAnswer);
			
			//printAnswer(answer);

			//printObject(analyzedSnippet);
			//console.log(oracleObject['jquery'].length);
		}
		catch(err)
		{
			var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
			dumpError(err);
		}
	}
}


//-------------------------------------------------------------------

var fs;
fs       = require('fs');
//var filename = process.argv[2];
//var data     = fs.readFileSync(filename);
var esprima  = require('esprima');

/*var filenamearray = [
'/src/bb10/ext/client.js',
'/src/bb10/ext/index.js',
'/src/bb10/js/_bb10_fileInput.js',
'/src/bb10/js/_bb10_activityIndicator.js',
'/src/bb10/js/core.js',
'/src/bb10/js/progress.js',
'/src/bb10/js/_bb10_contextMenu.js',
'/src/bb10/js/_PlayBook_contextMenu.js',
'/src/bb10/js/_bb10_imageList.js',
'/src/bb10/js/_bb10_labelControlContainers.js',
'/src/bb10/js/_bb_PlayBook_10_scrollPanel.js',
'/src/bb10/js/_bb10_button.js',
'/src/bb10/js/screen.js',
'/src/bb10/js/iscroll.js',
'/src/bb10/js/menuBar.js',
'/src/bb10/js/_bb10_checkbox.js',
'/src/bb10/js/_bb10_radio.js',
'/src/bb10/js/titleBar.js',
'/src/bb10/js/_bb10_roundPanel.js',
'/src/bb10/js/bbmBubble.js',
'/src/bb10/js/tabOverflow.js',
'/src/bb10/js/_bb10_toggle.js',
'/src/bb10/js/_bb10_slider.js',
'/src/bb10/js/_bb10_grid.js',
'/src/bb10/js/_bb10_textInput.js',
'/src/bb10/js/_bb10_pillButtons.js',
'/src/bb10/js/actionBar.js',
'/src/bb10/js/_bb10_dropdown.js',
'/src/bbos/ext/client.js',
'/src/bbos/ext/index.js',
'/src/bbos/js/_bb_6_7_PlayBook_labelControlContainers.js',
'/src/bbos/js/core.js',
'/src/bbos/js/progress.js',
'/src/bbos/js/_bb_6_7_PlayBook_dropdown.js',
'/src/bbos/js/_bb_6_7_button.js',
'/src/bbos/js/_bb_6_7_PlayBook_pillButtons.js',
'/src/bbos/js/screen.js',
'/src/bbos/js/_bb5_button.js',
'/src/bbos/js/menuBar.js',
'/src/bbos/js/titleBar.js',
'/src/bbos/js/_bb_6_7_textInput.js',
'/src/bbos/js/bbmBubble.js',
'/src/bbos/js/_bb_5_6_7_imageList.js',
'/src/bbos/js/_bb5_pillButtons.js',
'/src/bbos/js/_bb_5_6_7_roundPanel.js',
'/src/bbos/js/_bb5_labelControlContainers.js',
'/src/playbook/ext/client.js',
'/src/playbook/ext/index.js',
'/src/playbook/js/_bb10_fileInput.js',
'/src/playbook/js/_bb10_activityIndicator.js',
'/src/playbook/js/core.js',
'/src/playbook/js/progress.js',
'/src/playbook/js/_bb10_contextMenu.js',
'/src/playbook/js/_bb10_imageList.js',
'/src/playbook/js/_bb10_labelControlContainers.js',
'/src/playbook/js/_bb10_button.js',
'/src/playbook/js/_bbPlayBook_textInput.js',
'/src/playbook/js/screen.js',
'/src/playbook/js/iscroll.js',
'/src/playbook/js/_bb_PlayBook_pillButtons.js',
'/src/playbook/js/menuBar.js',
'/src/playbook/js/_bbPlayBook_button.js',
'/src/playbook/js/_bb10_checkbox.js',
'/src/playbook/js/_bb10_radio.js',
'/src/playbook/js/titleBar.js',
'/src/playbook/js/_bb_6_7_textInput.js',
'/src/playbook/js/_bb10_roundPanel.js',
'/src/playbook/js/bbmBubble.js',
'/src/playbook/js/_bb10_toggle.js',
'/src/playbook/js/_bbPlayBook_activityIndicator.js',
'/src/playbook/js/_bbPlayBook_dropdown.js',
'/src/playbook/js/_bbPlayBook_imageList.js',
'/src/playbook/js/_bbPlayBook_roundPanel.js',
'/src/playbook/js/_bb_PlayBook_scrollPanel.js',
'/src/playbook/js/_bb10_slider.js',
'/src/playbook/js/_bb10_grid.js',
'/src/playbook/js/_bb10_textInput.js',
'/src/playbook/js/_bb10_pillButtons.js',
'/src/playbook/js/_bb10_dropdown.js',
'/src/playbook/js/_bb_PlayBook_labelControlContainers.js',
'/samples/bb10/js/gauge.js',
'/samples/bb10/js/dynamicRadioButtons.js',
'/samples/bb10/js/dynamicButtons.js',
'/samples/bb10/js/dataOnLoad.js',
'/samples/bb10/js/imageListAddButtons.js',
'/samples/bb10/js/dynamicDropDowns.js',
'/samples/bb10/js/dynamicActionBar.js',
'/samples/bb10/js/dynamicToggle.js',
'/samples/bb10/js/menuBar.js',
'/samples/bb10/js/slider.js',
'/samples/bb10/js/pillButtons.js',
'/samples/bb10/js/dynamicCheckBoxes.js',
'/samples/bb10/js/dynamicInputs.js',
'/samples/bb10/js/dataOnTheFly.js',
'/samples/bb10/js/input.js',
'/samples/bb10/js/dynamicPillButtons.js',
'/samples/bb10/js/titlePillButtons.js',
'/samples/bb10/js/checkboxes.js',
'/samples/bb10/js/dynamicBubbles.js',
'/samples/bb10/js/tabs.js',
'/samples/bb10/js/dynamicProgress.js',
'/samples/bb10/js/actionBar.js',
'/samples/bb10/js/inboxList.js',
'/samples/bb10/js/masterDetail.js',
'/samples/bb10/js/imageList.js',
'/samples/bbos/js/gauge.js',
'/samples/bbos/js/dynamicRadioButtons.js',
'/samples/bbos/js/dynamicButtons.js',
'/samples/bbos/js/dataOnLoad.js',
'/samples/bbos/js/imageListAddButtons.js',
'/samples/bbos/js/dynamicDropDowns.js',
'/samples/bbos/js/dynamicActionBar.js',
'/samples/bbos/js/dynamicToggle.js',
'/samples/bbos/js/menuBar.js',
'/samples/bbos/js/slider.js',
'/samples/bbos/js/pillButtons.js',
'/samples/bbos/js/dynamicCheckBoxes.js',
'/samples/bbos/js/dynamicInputs.js',
'/samples/bbos/js/dataOnTheFly.js',
'/samples/bbos/js/input.js',
'/samples/bbos/js/dynamicPillButtons.js',
'/samples/bbos/js/titlePillButtons.js',
'/samples/bbos/js/checkboxes.js',
'/samples/bbos/js/dynamicBubbles.js',
'/samples/bbos/js/tabs.js',
'/samples/bbos/js/dynamicProgress.js',
'/samples/bbos/js/actionBar.js',
'/samples/bbos/js/inboxList.js',
'/samples/bbos/js/masterDetail.js',
'/samples/bbos/js/imageList.js',
'/samples/bbos/bbui.js',
'/samples/playbook/js/gauge.js',
'/samples/playbook/js/dynamicRadioButtons.js',
'/samples/playbook/js/dynamicButtons.js',
'/samples/playbook/js/dataOnLoad.js',
'/samples/playbook/js/imageListAddButtons.js',
'/samples/playbook/js/dynamicDropDowns.js',
'/samples/playbook/js/dynamicActionBar.js',
'/samples/playbook/js/dynamicToggle.js',
'/samples/playbook/js/menuBar.js',
'/samples/playbook/js/slider.js',
'/samples/playbook/js/pillButtons.js',
'/samples/playbook/js/dynamicCheckBoxes.js',
'/samples/playbook/js/dynamicInputs.js',
'/samples/playbook/js/dataOnTheFly.js',
'/samples/playbook/js/input.js',
'/samples/playbook/js/dynamicPillButtons.js',
'/samples/playbook/js/titlePillButtons.js',
'/samples/playbook/js/checkboxes.js',
'/samples/playbook/js/dynamicBubbles.js',
'/samples/playbook/js/tabs.js',
'/samples/playbook/js/dynamicProgress.js',
'/samples/playbook/js/actionBar.js',
'/samples/playbook/js/inboxList.js',
'/samples/playbook/js/masterDetail.js',
'/samples/playbook/js/imageList.js',
'pkg/bb10/ext/client.js',
'/pkg/bb10/ext/index.js'
];


var filetoinsert;
try
{
	for(var p = 0; p<filenamearray.length; p++)
	{
		var filename = '/home/s23subra/repositories/javascript-snippet-extractor/BBUI_Samples'+filenamearray[p];
		filetoinsert = filenamearray[p];
		console.log(filenamearray[p]);
		var data     = fs.readFileSync(filename);
		var oracleObject = fetchOracle();
		var analyzedSnippet = analyzeCode(data, filename, oracleObject, fetchAPI, printAnswer);

		//printObject(analyzedSnippet);
		//var answer = fetchAPI(analyzedSnippet, oracleObject);
		//fetchLocal(filename , answer, printAnswer);

		//printAnswer(answer);

		//printObject(analyzedSnippet);
		//console.log(oracleObject['jquery'].length);
	}
}
catch(err)
{
	var txt="Error description: " + err.message + " : "+err.line+ "\n\n";
	dumpError(err);
}

function lcs(lcstest, lcstarget) {
	matchfound = 0
	lsclen = lcstest.length
	for(lcsi=0; lcsi<lcstest.length; lcsi++){
		lscos=0
		for(lcsj=0; lcsj<lcsi+1; lcsj++){
			re = new RegExp("(?:.{" + lscos + "})(.{" + lsclen + "})", "i");
			temp = re.test(lcstest);
			re = new RegExp("(" + RegExp.$1 + ")", "i");
			if(re.test(lcstarget)){
				matchfound=1;
				result = RegExp.$1;
				break;
			}
			lscos = lscos + 1;
		}
		if(matchfound==1){return result; break;}
		lsclen = lsclen - 1;
	}
	result = "";
	return result;
}*/