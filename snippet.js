
$(window).bind("orientationchange", function(){
    var orientation = window.orientation;
    var new_orientation = (orientation) ? 0 : 180 + orientation;
    $('body').css({ 
        "-webkit-transform": "rotate(" + new_orientation + "deg)"
    });
});
