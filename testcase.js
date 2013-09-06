var obj  = function(blah)
{
    var foo = function()
    {
        console.log("this works too");
    }
    return foo;
}
obj()();