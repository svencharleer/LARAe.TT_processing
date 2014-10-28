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
            //first go through the ones that are already being touched
            Object.keys(copiesToTouches).forEach(function(t){
                var touch = touches[t];
                //maybe there's no touches we care about
                if(copiesToTouches[t] == undefined) return;
                //if touch doesn't exist anymore, we need to do something with this floating object
                if(touch == undefined)
                {
                    //2 cases. floating mid air, get rid of it. floating above a dock, dock!
                    if(copiesToTouches[t].getCoordinates().y > $(document).height() - 270) {
                        //docked!
                        copiesToTouches[t].docked(true);
                        copiesDocked.push(copiesToTouches[t]);
                        htmlDockController.addItem({id:"test", data:copiesToTouches[t].getData(),x:copiesToTouches[t].getCoordinates().x});

                    }
                    else
                        delete copiesToTouches[t];
                    copiesToTouches[t] = undefined;

                }
                else
                //else we have to move it with the finger
                    copiesToTouches[touch.id].manual_updatePosition(touch.x, touch.y);
            });




        },
        "updateDockedCopies": function(touches)
        {
            var copiesDocked_new = [];

            copiesDocked.forEach(function(c){
                var touch = c.touched(touches);
                if(touch == undefined)
                {
                    copiesDocked_new.push(c);
                }
                else
                {
                    c.docked(false);
                    copiesToTouches[touch] = c;
                }


            });
            copiesDocked = copiesDocked_new;
        },
        "generateCopyFor": function(touch, copy) {
            //we're already touching this copy
            if(copiesToTouches[touch.id] != undefined)
                return;


            copiesToTouches[touch.id] = copy.copy();
            copiesToTouches[touch.id].manual_updatePosition(touch.x, touch.y);
        },
        "draw": function(processing)
        {
            //draw dock
            processing.rectMode(processing.CORNERS);
            processing.noStroke();
            processing.fill(0xCC323232);
            processing.rect(0, $(document).height()-270, $(document).width(), $(document).height());

            Object.keys(copiesToTouches).forEach(function(c){
                if( copiesToTouches[c] == undefined)
                 return;
               copiesToTouches[c].draw();
            });
            copiesDocked.forEach(function(c){
                c.draw();
            });
        }

    }
}();

var UserToken = function(){
    var _data;
    var _x, _y;
    var _detached;
    var _processing;
    return {
        "init" : function(x,y,data,processing)
        {
          _data = data;
            _x = x;
            _y = y;
            _processing = processing;
        },
        "detach" : function(b)
        {

        },
        "update" : function()
        {

        },
        "draw"  :function()
        {
            _processing.text(_data.user.name, _x, _y);
        }
    }
}

var __userHandler = function() {
    var _users = [];
    var _processing;
   return {
       "init" : function(users,processing)
       {
           _processing = processing;
           var i = 10;
            users.forEach(function(u){
                var user = new UserToken();
                //the data we get from users actually contains the key (facebook_.. ) + phases
                //__users contains real user data. so we gotta put those together
                var userData = __users[u.key] != undefined ? __users[u.key] : u.key;
                var data = {user: userData, phases: u.value}
                user.init($(document).width()-200,i,data,processing);
                _users.push(user);
                i+=20;
            });
       },
       "draw" : function(){
            _users.forEach(function(u){
                u.draw();
            })
       }
   }
}();


var Circle = function(){

    var _x,_y;

    var _data;
    var _processing;
    var _pressed = false;
    var _isCopy = false;
    var _docked = false;

    var drawTriangle = function()
    {
        _processing.noFill();
        _processing.strokeWeight(1);
        _processing.stroke(0xCC33FF99);
        if(_pressed)
            _processing.fill(255);
        _processing.triangle(_x-5,_y+5,_x+5,_y+5,_x,_y-5);
    }

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
    var drawDocked = function()
    {
        drawCircle();
        /*_processing.pushMatrix();
        _processing.translate(_x,_y);
        _processing.fill(0xCC33FF99);
        if(_data.originalrequest.value != undefined && _data.originalrequest.value.description)
            _processing.text(_data.originalrequest.value.description, 10, 10, 200, 100);
        else
            _processing.text(_data.object, 10, 10, 70, 80);
        _processing.popMatrix();*/
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
                var mouseDist = _processing.dist(_processing.screenX(_x,_y), _processing.screenY(_x,_y), touch.x, touch.y);
                if (mouseDist < 5) {
                    _pressed = true;

                }
                else {
                    _pressed = false;
                    return;
                }
                //make a copy
                if(!_isCopy && _pressed) {
                    __copyHandler.generateCopyFor(touch, _self);
                    return;
                }
                //it's a copy, move it around
                _self.manual_updatePosition(touch.x, touch.y);
            });


        },
        "touched": function(touches){
            var found = undefined;

            Object.keys(touches).forEach(function (t) {
                if (touches[t] == undefined) return;
                //check if mouse isn't clicked in item
                var touch = touches[t];
                var mouseDist = _processing.dist(_processing.screenX(_x,_y), _processing.screenY(_x,_y), touch.x, touch.y);
                if (mouseDist < 5) {
                    found = t;
                    return false; //break out of foreach
                }
            });
            return found;

        },
        "draw": function () {
            if(_docked)
            {
                drawDocked();
                return;
            }
            switch (_data.verb) {
                case "rated":
                    drawStar();
                    break;
                case "response":
                    drawTriangle();
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
        "getData": function(){
            return _data;
        },
        "manual_updatePosition": function (x, y) {
            _x = x;
            _y = y;
        },
        "isCopy": function(b){
            _isCopy = b;
        },
        "copy": function () {
            var c = new Circle();
            c.init(_x, _y, _data,_processing);
            c.isCopy(true);
            return c;
        },
        "docked":function(b)
        {
            _docked = b;
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
                if(p.countByPhase[v.context.phase] == undefined)
                    p.countByPhase[v.context.phase] = 0;
                p.countByPhase[v.context.phase]++;return p;

            },
            function(p,v){
                p.countByPhase[v.context.phase]--;return p;},
            function(){return {countByPhase:{}};}
        ).top(Infinity);
    }

//GLOBAL VARS
    var rotx = Math.PI / 4;
    var roty = Math.PI / 4;
    var _nodes;
    var _links;
    var _users;

    var _canvas;

    var _circles = [];
    var _phases = [];
    var _yPerEvent = {};
    var _usersToCircles = {};

    var _touches = {};


    var _offset = {x:50,y:50};
    var _pOffset = {x:0,y:0};
    var _zoom = 1;
    var _mostRightY = 0;
    var _highestX = 0;

//METHODS


    var setup = function () {
        var processing = Processing.getInstanceById(_canvas);
        processing.size($(document).width(), $(document).height()-200, processing.JAVA2D);


    };

    var draw = function () {

        var processing = Processing.getInstanceById(_canvas);
        processing.background(0);
        //updating
        _circles.forEach(function(d)
        {
            d.update(_touches,d);
        });
        __copyHandler.updateTouchedCopies(_touches);
        __copyHandler.updateDockedCopies(_touches);



        //drawing




        processing.pushMatrix();

        processing.translate(_offset.x/_zoom, _offset.y/_zoom);

        //do updates within matrix transofmrations
        _circles.forEach(function(d)
        {
            d.update(_touches,d);
        });


        //processing.noStroke();

        Object.keys(_yPerEvent).forEach(function(y){

            drawPhase(_yPerEvent[y].phase, _yPerEvent[y].subphase, _yPerEvent[y].y, processing);
        });

        _circles.forEach(function(d)
        {
            d.draw(processing);
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




        processing.popMatrix();
        processing.pushMatrix();

        processing.translate(0, _offset.y/_zoom);
        Object.keys(_yPerEvent).forEach(function(y){

            drawPhaseHeader(_yPerEvent[y].phase, _yPerEvent[y].subphase, _yPerEvent[y].y, processing);
        });
        processing.popMatrix();
        __userHandler.draw();
        __copyHandler.draw(processing);
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

        var canvas = document.getElementById(_canvas);
        // attaching the sketch to the canvas
        var p = new Processing(canvas, sketch);
    }


    var phaseColors = [0xCC1c3341, 0xCC244153, 0xCC2c5169,0xCC345e79, 0xCC3e7091,0xCC4781a6];
    var setPhaseColor = function(phase, processing)
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
    };
    /*
        draw the header. this one does not translate over x axis it'll be a steady part of the UI
    */
    var drawPhaseHeader = function(phase, subphase, y, processing)
    {
        setPhaseColor(phase,processing);
        processing.rectMode(processing.CORNERS);
        processing.noStroke();
        processing.rect(0, y-10, 10, y+10);
        processing.fill(255);
        processing.text(subphase, 0, y)
    };
    var drawPhase = function(phase, subphase, y, processing)
    {
        setPhaseColor(phase,processing);
        processing.rectMode(processing.CORNERS);
        processing.noStroke();
        processing.rect(0, y-10, _highestX+10, y+10);
        processing.fill(255);

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



        var xSpacing = 20;
        var ySpacing = 20;

        var x = 10;
        var y = 10;
        _nodes.forEach(function(n)
        {
            if(y > _mostRightY) _mostRightY = y;
            if(n.verb == "response") y = 5;
            else {
                if (_yPerEvent[n.object] == undefined) {
                    y = _mostRightY;
                    y += ySpacing;
                    _yPerEvent[n.object] = {};
                    _yPerEvent[n.object].y = y;
                    _yPerEvent[n.object].phase = n.context.phase;
                    _yPerEvent[n.object].subphase = n.context.subphase;

                    //x = 10;
                }
                else {
                    y = _yPerEvent[n.object].y;
                }
            }
            x += xSpacing;

            var c = new Circle();
            c.init(x,y,n,processing);
            _circles.push(c);



        });
        _highestX = x;
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
        "init" : function(data, canvas)
        {
            _canvas = canvas;
            _nodes = preprocess_nodes(data);
            _links = preprocess_links(data);
            _users = preprocess_users(data);

            initProcessing();
            var processing = Processing.getInstanceById(_canvas);
            createCircles(processing);
            createPhases();
            //linkUsersToCircles();
            __userHandler.init(_users,processing);



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


var loadVisualization = function() {

    //filter it
    var xf = crossfilter(__data);
    var byUser = xf.dimension(function(d){return d.username.toLowerCase();});

    vis =  new visualization();
    vis.init(byUser.top("Infinity"),"canvas1");
   


};