/**
 * Created by svenc on 21/10/14.
 */

var _testData = [];
var _testPhase = 0;
var _testTitle = "";
var AwarenessToken = function()
{

    return{
        "drawRealTable":function(xx,yy, _highlight, _processing, screenWidth, screenHeight, users,all)
        {
            var width = 7, height = 7;

            var sphereWidth = 25;
            var sphereHeight = 16;
            _processing.noFill();
            _processing.stroke(128);
            //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;

            var x = xx * screenWidth;
            var y = yy * screenHeight;
            _processing.strokeWeight(1);
            _processing.fill(255);
            _processing.rect(x+sphereWidth/4, y+sphereHeight/3, sphereWidth/2, 4);


            _testData[_testPhase].users.forEach(function (k) {
                var userX = _testData[_testPhase].userLocations[i][0]* screenWidth;
                var userY = _testData[_testPhase].userLocations[i][1]* screenHeight;
                if(users.indexOf(i) >= 0)
                    _processing.fill(parseInt(_testData[_testPhase].users[i]));
                else {
                    if(users.indexOf(i) < 0 && all == false) {
                        i++;
                        return false;
                    }
                    _processing.fill(128);
                }
                var xDiff = (userX/ screenWidth );
                var yDiff = (userY / screenHeight );
                var v = new _processing.PVector(xDiff, yDiff);
                //v.normalize();
                xDiff = v.x *  sphereWidth;
                yDiff = v.y * sphereHeight;

               // _processing.line(x,y,x+xDiff,y+yDiff);

                _processing.ellipse(x+xDiff,y+yDiff, 4,4)


                i++;
            })
        },
        //drawTable
        "drawTable":function(xx,yy, _highlight, _processing, screenWidth, screenHeight, users,all)
        {
            var width = 7, height = 7;




            var sphereWidth = 10;
            var sphereHeight = 10;
            _processing.noFill();
            _processing.stroke(128);
            //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;

            _processing.strokeWeight(1);
            _processing.fill(128);
            _processing.ellipse(x,y, 8,8)


            var x = xx * screenWidth;
            var y = yy * screenHeight;

            _testData[_testPhase].users.forEach(function (k) {
                var userX = _testData[_testPhase].userLocations[i][0]* screenWidth;
                var userY = _testData[_testPhase].userLocations[i][1]* screenHeight;
                if(users.indexOf(i) >= 0)
                    _processing.fill(parseInt(_testData[_testPhase].users[i]));
                else {
                    if(users.indexOf(i) < 0 && all == false) {
                        i++;
                        return false;
                    }
                    _processing.fill(128);
                }

                var xDiff = (userX-screenWidth/2.0);
                var yDiff = (userY-screenHeight/2.0);
                var v = new _processing.PVector(xDiff,yDiff);
                v.normalize();
                xDiff = v.x * sphereWidth;
                yDiff = v.y * sphereHeight;

                //_processing.line(x,y,x+xDiff,y+yDiff);
                _processing.ellipse(x+xDiff,y+yDiff, 4,4)


                i++;
            })


        },


        "drawStatic":function(xx,yy, _highlight, _processing, screenWidth, screenHeight, users,all)
        {
            var x = xx * screenWidth;
            var y = yy * screenHeight;
            var width = 7, height = 7;

            var sphereWidth = 8;
            var sphereHeight = 8;
            _processing.noFill();
            _processing.stroke(128);
            //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;

            _processing.strokeWeight(1);
            _processing.fill(128);
            _processing.ellipse(x+sphereWidth/2,y+sphereHeight/2, sphereWidth,sphereWidth);

            _testData[_testPhase].users.forEach(function (k) {

                if(users.indexOf(i) >= 0)
                    _processing.fill(parseInt(_testData[_testPhase].users[i]));
                else {
                    if(users.indexOf(i) < 0 && all == false) {
                        i++;
                        return true;
                    }
                    _processing.fill(128);
                }


                //_processing.line(x,y,x+xDiff,y+yDiff);
                _processing.ellipse(x+sphereWidth*2,y+i*5 - sphereHeight/2 , 4,4)


                i++;
            })


        },
        //drawFlake/bars
        "drawFlake":function(xx,yy, _highlight, _processing, screenWidth, screenHeight, users,all)
        {
            var width = 7, height = 7;

            var sphereWidth = 10;
            var sphereHeight = 10;
            _processing.noFill();
            _processing.stroke(128);
            //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;

            _processing.strokeWeight(1);

            var x = xx * screenWidth;
            var y = yy * screenHeight;
            _processing.strokeWeight(1);
            _processing.fill(128);
            _processing.ellipse(x,y, 4,4)

            _testData[_testPhase].users.forEach(function (k) {
                var userX = _testData[_testPhase].userLocations[i][0]* screenWidth;
                var userY = _testData[_testPhase].userLocations[i][1]* screenHeight;

                if(users.indexOf(i) < 0 && all == false) {
                    i++;
                    return false;
                }

                var xDiff = (userX-screenWidth/2.0);
                var yDiff = (userY-screenHeight/2.0);
                var v = new _processing.PVector(xDiff,yDiff);
                v.normalize();
                xDiff = v.x * sphereWidth;
                yDiff = v.y * sphereHeight;
                _processing.stroke(128);
                _processing.line(x,y,x+xDiff,y+yDiff);
                _processing.noStroke();
                if(users.indexOf(i) >= 0)
                    _processing.fill(parseInt(_testData[_testPhase].users[i]));
                else
                    _processing.fill(128);
                _processing.ellipse(x+xDiff,y+yDiff, 4,4)


                i++;
            })


        },
        //drawDirection
        "drawDirection":function(xx,yy, _highlight, _processing, screenWidth, screenHeight, users,all)
        {
            var width = 7, height = 7;

            var sphereWidth = 10;
            var sphereHeight = 10;
            _processing.noFill();
            _processing.stroke(128);
            //_processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;

            _processing.strokeWeight(1);

            var x = xx * screenWidth;
            var y = yy * screenHeight;

            _testData[_testPhase].users.forEach(function (k) {
                var userX = _testData[_testPhase].userLocations[i][0]* screenWidth;
                var userY = _testData[_testPhase].userLocations[i][1]* screenHeight;

                if(users.indexOf(i) < 0 && all == false) {
                    i++;
                    return false;
                }
                var xDiff = (userX-x);
                var yDiff = (userY-y);

                var v = new _processing.PVector(xDiff,yDiff);
                v.normalize();
                xDiff = v.x * sphereWidth;
                yDiff = v.y * sphereHeight;
                _processing.stroke(128);
                _processing.line(x,y,x+xDiff,y+yDiff);
                _processing.noStroke();
                if(users.indexOf(i) >= 0)
                    _processing.fill(parseInt(_testData[_testPhase].users[i]));
                else
                    _processing.fill(128);

                _processing.ellipse(x+xDiff,y+yDiff, 4,4)
                //_processing.ellipse(x+xDiff,y+yDiff, 2,2)


                i++;
            })


        },
        //drawcircle
        "drawCirlce":function(xx,yy, _highlight, _processing, screenWidth, screenHeight, users,all)
        {
            var width = 7, height = 7;

            var x = xx * screenWidth;
            var y = yy * screenHeight;

            var sphereWidth = 15;
            var sphereHeight = (screenHeight/screenWidth)* sphereWidth;
            _processing.noFill();
            _processing.stroke(128);
            _processing.ellipse(x,y,2*sphereWidth,2*sphereHeight)

            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;




            _testData[_testPhase].users.forEach(function (k) {
                var userX = _testData[_testPhase].userLocations[i][0]* screenWidth;
                var userY = _testData[_testPhase].userLocations[i][1]* screenHeight;


                if(users.indexOf(i) < 0 && all == false) {
                    i++;
                    return false;
                }


                var xDiff = (userX-screenWidth/2.0);
                var yDiff = (userY-screenHeight/2.0);
                var v = new _processing.PVector(xDiff,yDiff);
                v.normalize();
                xDiff = v.x * sphereWidth;
                yDiff = v.y * sphereHeight;

                if(users.indexOf(i) >= 0)
                    _processing.fill(parseInt(_testData[_testPhase].users[i]));
                else
                    _processing.fill(128);

                _processing.ellipse(x+xDiff, y +yDiff, width, height);


                i++;
            })


        }
    }
}();


//quick hack to make these seperate instances. yes yes i know
//this dev has been a quicky in #%@ no time
var DataVisualization = function() {
    var __vis;
    var __docks = [];






    var Circle = function () {

        var _x, _y;
        var _screenX, _screenY;

        var _data;
        var _processing;
        var _pressed = false;
        var _isCopy = false;
        var _docked = false;
        var _type = "EVENT";
        var _order;
        var _twAppear = 0.0;
        // 0 1 2 (0 dimmed, 1 normal, 2 highlighted)
        var _highlight = {};
        var _size = 1;
        var _users = [];


        var _pulse = 1.0;

        var drawToken = function()
        {
            if(_pressed) {
                _processing.rectMode(_processing.CORNER);
                _processing.fill(30);
                x = _x * $("#" + __canvas).width();
                y = _y * $("#" + __canvas).height();
                _processing.rect(x - 15, y - 15, 60, 50);
            }

            var call;
            switch(_testData[_testPhase].type)
            {
                case "circle":
                    call = AwarenessToken.drawCirlce;
                    break;
                case "direction":
                    call = AwarenessToken.drawDirection;
                    break;
                case "table":
                    call = AwarenessToken.drawRealTable;
                    break;
                case "flake":
                    call = AwarenessToken.drawFlake;
                    break;
                case "static":
                default:
                    call = AwarenessToken.drawStatic;
                    break;
            }
            call(_x,_y, _highlight, _processing, $("#" + __canvas).width(), $("#" + __canvas).height(),_users,_testData[_testPhase].showAll)
        }



        return{

            "init": function (x, y, size, users, processing) {
                _x = x;
                _y = y;


                _processing = processing;
                _size = size;
               _users = users;



            },
            "update": function (touches, _self) {
                //TODO: fix this, there must e a way to really empty a hash and then check if it's empty


                if (touches == undefined) {
                    _pressed = false;
                    return;
                }
                var touch = _self.touched(touches);
                if (touch != undefined) {

                    _pressed = true;

                }
                else
                {
                    _pressed = false;
                }
            },
            "touched": function (touches) {
                var found = undefined;

                Object.keys(touches).forEach(function (t) {
                    if (touches[t] == undefined) return;
                    //check if mouse isn't clicked in item
                    var touch = touches[t];

                    var x,y;
                    x = _x * $("#" + __canvas).width();
                    y = _y * $("#" + __canvas).height();

                    if (touch.x > x-15 &&
                        touch.y > y-15  &&
                        touch.x < x + 60 &&
                        touch.y < y + 50) {
                        found = touches[t];
                        return true;
                    }
                    return false;

                });

                return found;

            },
            "draw": function () {
                drawToken();

            },
            "getCoordinates": function () {
                return {x: _x, y: _y};
            },
            "getScreenCoordinates": function () {
                return {x: _screenX, y: _screenY};
            },
            "getPhase": function () {
                return _data.context.phase;
            },
            "getUser": function () {
                return _data.username.toLowerCase();
            },
            "getData": function () {
                return _data;
            },
            "manual_updatePosition": function (x, y) {
                _x = x;
                _y = y;
            },
            "isCopy": function (b) {
                _isCopy = b;
                if(_isCopy)
                {
                    _order = 0;
                    _twAppear = 1;
                }
            },
            "copy": function () {
                var c = new Circle();
                c.init(_x, _y, _data, _processing,0);
                c.isCopy(true);
                return c;
            },
            "docked": function (b) {
                _docked = b;
            },

            "debug": function () {
                console.log(_data);
            },
            "type": function () {
                return _type;
            },
            "highlight": function (color, setting) {
                _highlight[color] = setting;
            }






        }

    };

    var visualization = function () {



//GLOBAL VARS
        var rotx = Math.PI / 4;

        var roty = Math.PI / 4;
        var _nodes;
        var _links;
        var _users;

        var _flipped;

        var _canvas;

        var _circles = [];
        var _phases = [];
        var _yPerEvent = {};
        var _usersToCircles = {};

        var _touches = {};


        var _offset = {x: 300, y: 350};
        var _pOffset = undefined;
        var _zoom = 1;
        var _mostRightY = 0;
        var _highestX = 0;

        var _debugCursors = [];

        var _testTitle = "";



//METHODS


        var setup = function () {
            var processing = Processing.getInstanceById(_canvas);
            processing.size($("#" + __canvas).width(), $("#" + __canvas).height(), processing.JAVA2D);


        };



        var draw = function () {


            var processing = Processing.getInstanceById(_canvas);

            processing.background(0xCC2b2b2b);


                processing.fill(255);
                processing.text(_testData[_testPhase].title, 20, 20, 1000,300);
            if(_testTitle != "") return;

            //updating


            _circles.forEach(function (d) {
                d.update(_touches, d);
            });





            _circles.forEach(function (d) {
                d.draw(processing);
            });

            if(_testPhase < 1)
                drawUsers(processing);

            //debug draw cursors
            Object.keys(_debugCursors).forEach(function(c)
            {
                if(_debugCursors[c] != undefined)
                {
                    processing.fill(0,255,0);
                    processing.ellipse(_debugCursors[c].x, _debugCursors[c].y, 10, 10);
                }
            });



            processing.smooth();
        };


        var initProcessing = function () {

            var sketch = new Processing.Sketch();

            sketch.attachFunction = function (processing) {
                processing.setup = setup;
                processing.draw = draw;
                // mouse event
                processing.mousePressed = function () {
                    /*if (processing.mouseY < $("#" + __canvas).height() - 400)
                        _pOffset = _offset;*/
                    _touches["mouse"] = {id: "mouse", x: processing.pmouseX, y: processing.pmouseY};

                };
                processing.mouseDragged = function () {

                    /*if (processing.mouseY < $("#" + __canvas).height() - 400) {
                        _offset.x = (processing.mouseX - processing.pmouseX) + _pOffset.x;
                        _offset.y = (processing.mouseY - processing.pmouseY) + _pOffset.y;
                    }*/
                    _touches["mouse"] = {id: "mouse", x: processing.mouseX, y: processing.mouseY};

                };
                processing.mouseReleased = function () {
                   /* _pOffset = undefined;*/
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

            var canvas = document.getElementById(_canvas);
            // attaching the sketch to the canvas
            var p = new Processing(canvas, sketch);
        }





        var createTokens = function (processing) {
            //make a circle out of every node
            _circles = [];
            _testData[_testPhase].polis.forEach(function(p){
                var c = new Circle();
                c.init(p.x, p.y, p.size, p.users, processing);
                _circles.push(c);

            })



        }

        var drawUsers = function(processing){
            _users = [];
            var i = 0;
            _testData[_testPhase].users.forEach(function(u)
            {
                processing.fill(parseInt(u));
                processing.rectMode(processing.CORNER);
                processing.rect(_testData[_testPhase].userLocations[i][0]*$("#" + __canvas).width()-10,_testData[_testPhase].userLocations[i][1]*$("#" + __canvas).height()-20, 40, 40);
                i++;
            });
        }



        var _p = {};
        return {
            "init": function (canvas, testData) {
                _canvas = canvas;
                _testData = testData;
                _testPhase = 0;
                _testTitle = _testData[_testPhase].title;

                initProcessing();
                var processing = Processing.getInstanceById(_canvas);
                createTokens(processing);
                _p = processing;



            },
            "addTouch": function (id, x, y) {

                //if flipped, we need to convert x and y
                if(_flipped)
                {
                    x = $("#" + _canvas).width() - x;
                    y = $("#" + _canvas).height() - y;

                }
                if(_pOffset == undefined) {
                    _pOffset ={x: _offset.x, y:_offset.y};
                    _pOffset.startX = x ;
                    _pOffset.id = id;

                }

                _debugCursors[id] = {id:id,x:x,y:y};
                _touches[id] = {id:id,x:x,y:y, startx:x, starty:y};
                console.log("adding touch");

                if(y < 100){
                    if(_testTitle == "" && _testData[_testPhase+1] == undefined) {
                        _testTitle = "DONE. THANKS";
                        return;
                    }
                    if(_testTitle == "")
                    {
                        _testPhase++;
                        createTokens(_p);
                        _testTitle = _testData[_testPhase].title;

                    }
                    else
                    {
                        _testTitle = "";


                    }
                }

            },
            "updateTouch": function (id, x, y) {

                //if flipped, we need to convert x and y
                if(_flipped)
                {
                    x = $("#" + _canvas).width() - x;
                    y = $("#" + _canvas).height() - y;

                }

                _debugCursors[id] = {id:id,x:x,y:y};
                if(_touches[id] == undefined) return;
                _touches[id].x = x;
                _touches[id].y = y;

                 if(_pOffset != undefined && id == _pOffset.id && y > 700 && y < 900|| (_flipped && y < $("#" + _canvas).height() - 200)) {
                     //console.log("vector(" +_touches[id].x + " "+  _pOffset.startX + ") on x " + _pOffset.x );
                     _offset.x = (_touches[id].x - _pOffset.startX) + _pOffset.x;
                     //_offset.y = (_touches[id].y - _touches[id].starty);// + _pOffset.y;
                 }

            },
            "removeTouch" :function (id, x, y) {

                _debugCursors[id] = undefined;
                _touches[id] = undefined;
                if(_pOffset != undefined && id == _pOffset.id) {

                    _pOffset = undefined
                }


            },
            "getVisualizationItems": function () {
                return _circles;
            }


        };

    }

    var __canvas;
    var __dataDock;
    var __verbs;
    return {

        "loadVisualization" : function (canvas, testData) {

            __canvas = canvas;


            __vis = new visualization();
            __vis.init( canvas, testData);




        },
        "addTouch": function (id, x, y) {


            __vis.addTouch(id,x,y);
        },
        "updateTouch": function (id, x, y) {


            __vis.updateTouch(id,x,y);
        },
        "removeTouch": function (id) {


            __vis.removeTouch(id);
        }
    }

};