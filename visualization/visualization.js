/**
 * Created by svenc on 21/10/14.
 */

var vis;


var __copyHandler = function(){
    var copiesToTouches = {};
    var copiesDocked = [];
    return {
        "updateTouchedCopies": function(touches)
        {
            Object.keys(touches).forEach(function(t){
                var touch = touches[t];
                if(touch == undefined) return;
                if(copiesToTouches[touch.id] == undefined) return;
                copiesToTouches[touch.id].manual_updatePosition(touch.x, touch.y);
            });
        },
        "generateCopyFor": function(touch, copy) {
            //we're already touching this copy
            if(copiesToTouches[touch.id] != undefined)
                return;

            copy.manual_updatePosition(touch.x, touch.y);
            copiesToTouches[touch.id] = copy.copy();
        },
        "draw": function()
        {

            Object.keys(copiesToTouches).forEach(function(c){
                if( copiesToTouches[c] == undefined)
                 return;
               copiesToTouches[c].draw();
            });
        }

    }
}();
var loadVisualization = function() {

    //filter it
    var xf = crossfilter(__data);
    var byUser = xf.dimension(function(d){return d.username.toLowerCase();});

    vis =  new visualization();
    vis.init(byUser.top("Infinity"));


};

var Circle = function(){

    var _x,_y;
    var _data;
    var _processing;
    var _pressed = false;


    var drawCircle =  function()
    {
        _processing.noFill();
        _processing.strokeWeight(1);
        _processing.stroke(0xCC33FF99);
        if(_pressed)
            _processing.fill(255);
        _processing.ellipse(_x,_y,10,10);
    };
    var drawStar =  function()
    {
        _processing.pushMatrix();
        _processing.noFill();
        _processing.strokeWeight(3);
        _processing.stroke(0xCC33FF99);
        if(_pressed)
            _processing.fill(255);
        _processing.translate(_x,_y);
        _processing.scale(.2);
        _processing.beginShape();
        _processing.vertex(0, -50);
        _processing.vertex(14, -20);
        _processing.vertex(47, -15);
        _processing.vertex(23, 7);
        _processing.vertex(29, 40);
        _processing.vertex(0, 25);
        _processing.vertex(-29, 40);
        _processing.vertex(-23, 7);
        _processing.vertex(-47, -15);
        _processing.vertex(-14, -20);
        _processing.endShape(_processing.CLOSE);
        _processing.popMatrix();
    };
    return{

        "init": function (x, y, data, processing) {
            _x = x;
            _y = y;
            _data = data;
            _processing = processing;

        },
        "update": function (touches, _self) {
            //TODO: fix this, there must e a way to really empty a hash and then check if it's empty
            if (touches == undefined) {
                _pressed = false;
                return;
            }
            Object.keys(touches).forEach(function (t) {
                if (touches[t] == undefined) return;
                //check if mouse isn't clicked in item
                var touch = touches[t];
                var mouseDist = _processing.dist(_processing.screenX(_x, _y), _processing.screenY(_x, _y), touch.x, touch.y);
                if (mouseDist < 5) {
                    _pressed = true;
                    __copyHandler.generateCopyFor(touch, _self);
                }
                else
                    _pressed = false;
                //make a copy

            });


        },
        "draw": function () {
            Processing.getInstanceById("canvas1");
            switch (_data.verb) {
                case "rated":
                    drawStar();
                    break;
                default:
                    drawCircle();

            }

        },
        "getCoordinates": function () {
            return {x: _x, y: _y};
        },
        "getPhase": function () {
            return _data.context.phase;
        },
        "getUser": function () {
            return _data.username.toLowerCase();
        },
        "manual_updatePosition": function (x, y) {
            _x = x;
            _y = y;
        },
        "copy": function () {
            var c = new Circle();
            c.init(_x, _y, _data,_processing);
            return c;
        },
        "debug":function(){
            console.log(_data);
        }





    }

};

var visualization = function(){


//PREPROCESS
    var preprocess_nodes = function(data)
    {
        var xf = crossfilter(data);
        var byEvents = xf.dimension(function(f){return f.event_id;});
        var byVerb =  xf.dimension(function(f){return f.verb;});
        byVerb.filter(function(d){
            if(d != "read" && d != "answer_given" && d != "startRun" && d != "like" && d != "delete_like")
                return d;
        });
        return byEvents.bottom(Infinity);
    }

    var preprocess_links = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.object;});
        return dim.top(Infinity);
        //SHOULD WE SORT BY DATE? //MAYBE NOT .. nodes visualized are already sorted
    }

    var preprocess_users = function(data)
    {
        var xf = crossfilter(data);
        var dim = xf.dimension(function(f){return f.username.toLowerCase();});
        return dim.group().reduce(
            function(p,v){
                p.count++;return p;

            },
            function(p,v){
                p.count--;return p;},
            function(){return {count:0};}
        ).top(Infinity);
    }

//GLOBAL VARS
    var rotx = Math.PI / 4;
    var roty = Math.PI / 4;
    var _nodes;
    var _links;
    var _users;

    var _circles = [];
    var _phases = [];
    var _yPerEvent = {};
    var _usersToCircles = {};

    var _touches = {};


    var _offset = {x:0,y:0};
    var _pOffset = {x:0,y:0};
    var zoom = 1;

//METHODS


    var setup = function () {
        var processing = Processing.getInstanceById("canvas1");
        processing.size($(document).width(), $(document).height(), processing.JAVA2D);


    };

    var draw = function () {

        var processing = Processing.getInstanceById("canvas1");
        //updating
        _circles.forEach(function(d)
        {
            d.update(_touches,d);
        });
        __copyHandler.updateTouchedCopies(_touches);




        //drawing
        processing.pushMatrix();

        //scaling/panning stuff
        /*
        processing.scale(zoom);
        processing.translate(_offset.x/zoom, _offset.y/zoom);
        */


        processing.background(0);
        //processing.noStroke();

        _circles.forEach(function(d)
        {
            drawPhase(d.getPhase(), d.getCoordinates().x, processing);
            d.draw();
        });
        processing.stroke(255,255,255);
        processing.strokeWeight(1);
        Object.keys(_usersToCircles).forEach(function(uk){
            var u  = _usersToCircles[uk];
            if(u.length>1)
            {
                for(var i=0;i< u.length-1;i++)
                {
                    processing.line(u[i].getCoordinates().x,
                                     u[i].getCoordinates().y,
                                        u[i+1].getCoordinates().x,
                                          u[i+1].getCoordinates().y);
                    //console.log(i);
                }
            }
        });

        __copyHandler.draw();

        processing.popMatrix();
        drawLegends(processing);
        processing.smooth();
    };



    var initProcessing = function() {

        var sketch = new Processing.Sketch();

        sketch.attachFunction = function (processing) {
            processing.setup = setup;
            processing.draw = draw;
            // mouse event
            processing.mousePressed = function () {
              _pOffset = _offset;
              _touches["mouse"] = {id: "mouse", x: processing.pmouseX, y: processing.pmouseY};

            };
            processing.mouseDragged = function () {

                _offset.x = (processing.mouseX - processing.pmouseX) + _pOffset.x;
                _offset.y = (processing.mouseY - processing.pmouseY) + _pOffset.y;
                _touches["mouse"] = {id: "mouse", x: processing.mouseX, y: processing.mouseY};

            };
            processing.mouseReleased = function () {
                _pOffset = undefined;
                _touches["mouse"] = undefined;
            }
            /*processing.touchStart = function(touchEvent)
            {
                _pOffset = _offset;
                _mouse = {x: touchEvent.touches[0].offsetX, y: touchEvent.touches[0].offsetY};
            }
            processing.touchMove = function(touchEvent)
            {
                _offset.x = (touchEvent.touches[0].offsetX - _mouse.x) + _pOffset.x;
                _offset.y = (touchEvent.touches[0].offsetY - _mouse.y) + _pOffset.y;
            }
            processing.touchEnd = function (touchEvent) {
                _pOffset = undefined;
                _mouse = undefined;
            }*/
        };

        var canvas = document.getElementById("canvas1");
        // attaching the sketch to the canvas
        var p = new Processing(canvas, sketch);
    }


    var phaseColors = [0xCC1c3341, 0xCC244153, 0xCC2c5169,0xCC345e79, 0xCC3e7091,0xCC4781a6]
    var drawPhase = function(phase, x, processing)
    {

        switch(phase)
        {
            case 1:
                processing.fill(phaseColors[0]);
                break;
            case 2:
                processing.fill(phaseColors[1]);
                break;
            case "3":
            case 3:
                processing.fill(phaseColors[2]);
                break;
            case 4:
                processing.fill(phaseColors[3]);
                break;
            case 5:
                processing.fill(phaseColors[4]);
                break;
            case 6:
                processing.fill(phaseColors[5]);
                break;
            default:
                console.log("phase" + phase);
                processing.fill(0);
        }

        processing.rectMode(processing.CORNERS);
        processing.noStroke();
        processing.rect(x-10, 0, x+10, 300);
       //console.log("draw rect");

    }

    var drawLegends = function(processing)
    {
        processing.rectMode(processing.CORNERS);
        processing.noStroke();
        processing.fill(255);
        processing.text("phase", 10,20);

        for(var i = 0;i < 6;i++)
        {
            processing.fill(phaseColors[i])
            processing.rect(50+i*20 , 10, 70+i*20, 20);
            processing.fill(255);
            processing.text(i+1, 50+i*20,20);
        }


    }


    var createCircles = function(processing)
    {
        //make a circle out of every node
        var mostRightY = 0;


        var xSpacing = 20;
        var ySpacing = 20;

        var x = 10;
        var y = 10;
        _nodes.forEach(function(n)
        {
            if(y > mostRightY) mostRightY = y;
            if(_yPerEvent[n.object] == undefined) {
                y = mostRightY;
                y+=ySpacing;
                _yPerEvent[n.object] = y;
                //x = 10;
            }
            else
            {
                y = _yPerEvent[n.object];
            }

            x += xSpacing;

            var c = new Circle();
            c.init(x,y,n,processing);
            _circles.push(c);



        });
    }

    var createPhases = function() {
        _nodes.forEach(function(n) {
            _phases.push(n.context.phase);
        });
    }

    var linkUsersToCircles = function() {

        _circles.forEach(function(n) {
            var user = n.getUser();
            if(_usersToCircles[user] == undefined)
                _usersToCircles[user] = [];
            _usersToCircles[user].push(n);
        });
    }


    return {
        "init" : function(data)
        {

            _nodes = preprocess_nodes(data);
            _links = preprocess_links(data);
            _users = preprocess_users(data);

            initProcessing();
            var processing = Processing.getInstanceById("canvas1");
            createCircles(processing);
            createPhases();
            linkUsersToCircles();



        }
        ,
        "drawCursor": function(x,y)
        {
           /* var _processing = Processing.getInstanceById("canvas1");
            if(_processing == undefined) return;
            _circles[0].manual_updatePosition(x,y);
            */
        }
    };

}