/**
 * Created by svenc on 21/10/14.
 */

//quick hack to make these seperate instances. yes yes i know
//this dev has been a quicky in #%@ no time
var DataVisualization = function() {
    var __vis;
    var __docks = [];

    var PhaseToken = function () {
        var _phase;
        var _verb
        var _color;
        var _x, _y, _width, _height;

        var _processing;
        var _pressed = false;
        var _isCopy = false;
        var _docked = false;
        var _type = "PHASE"
        return {
            "init": function (x, y, verb, color, processing) {
                _verb = verb;
                _color = color;
                _x = x;
                _y = y;
                _width = 70;
                _height = 10;
                _processing = processing;
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
                    if (!_isCopy && _pressed) {
                        __copyHandler.generateCopyFor(touch, _self);
                        return;
                    }
                    //it's a copy, move it around
                    _self.manual_updatePosition(touch.x, touch.y);
                }
                else {
                    _pressed = false;
                }
            },
            "touched": function (touches) {
                var found = undefined;

                Object.keys(touches).forEach(function (t) {
                    if (touches[t] == undefined) return;
                    //check if mouse isn't clicked in item
                    var touch = touches[t];
                    if (touch.x > _x &&
                        touch.y > _y - 10 &&
                        touch.x < _x + _width &&
                        touch.y < _y - 10 + _height) {
                        found = touches[t];
                        return true;
                    }
                    return false;
                });
                return found;

            },
            "draw": function () {
                _processing.rectMode(_processing.CORNER);

                _processing.noFill();
                _processing.stroke(_color);
                _processing.rect(_x, _y - 12, _width, _height + 2);

                _processing.fill(255);
                _processing.text( _verb.key, _x, _y - 10, _width, _height + 10);

            },
            "manual_updatePosition": function (x, y) {
                _x = x;
                _y = y;
            },
            "isCopy": function (b) {
                _isCopy = b;
            },
            "copy": function () {
                var c = new PhaseToken();
                c.init(_x, _y, _phase, _color, _processing);
                c.isCopy(true);
                return c;
            },
            "docked": function (b) {
                _docked = b;
            },
            "getCoordinates": function () {
                return {x: _x, y: _y};
            },
            "type": function () {
                return _type;
            },
            "getPhase": function () {
                return _verb;
            }
        }
    }

    var __phaseHandler = function () {
        var _processing;
        var _x;
        var _y;
        var _phases = [];

        var phaseColors = [0xCC1c3341, 0xCC244153, 0xCC2c5169, 0xCC345e79, 0xCC3e7091, 0xCC4781a6];

        return {
            "init": function (processing, x, y) {
                _x = x;
                _y = y;
                _processing = processing;
                var i = 10;
                __verbs.forEach(function(v){
                    var phase = new PhaseToken();
                    phase.init(_x, i * 15 + _y, v, phaseColors[i], processing);
                    _phases.push(phase);
                    i++;

                })
                ;
            },
            "draw": function () {
                _phases.forEach(function (u) {
                    u.draw();
                })

            },
            "update": function (touches) {
                _phases.forEach(function (u) {

                    u.update(touches, u);
                });

            }

        }
    }();

    var Dock = function () {
        var _x, _y, _width, _height;
        var _items = [];
        var _relatedItems = [];
        var _id;
        var _color;
        var _self;
        return{
            "init": function (x, y, widht, height, id, color, self) {
                _id = id;
                _x = x;
                _y = y;
                _width = widht;
                _height = height;
                _color = color;
                _self = self;
            },
            "update": function (touches) {
                var copiesDocked_new = [];

                _items.forEach(function (c) {
                    var touch = c.touched(touches);
                    //if touched, hand item over to the copy handler
                    if (touch == undefined) {
                        copiesDocked_new.push(c);
                    }
                    else {
                        c.docked(false);
                        __copyHandler.handover(touch, c);

                    }


                });
                if (_items.length != copiesDocked_new.length) {
                    __filterHandler.dockChanges(_id, copiesDocked_new, _self);
                    __dataHandler.dockUpdated(_id, copiesDocked_new);
                }
                _items = copiesDocked_new;
            },
            "draw": function (processing) {
                //draw dock
                processing.rectMode(processing.CORNER);
                processing.noStroke();
                processing.fill(parseInt(_color));
                processing.rect(_x, _y, _width, _height);


                _items.forEach(function (c) {
                    c.draw();
                });
                _relatedItems.forEach(function (r) {
                    var color = (parseInt(_color) & 0xffffff) | (24 << 24);
                    processing.stroke(color);
                    processing.line(_x, _y, r.getScreenCoordinates().x, r.getScreenCoordinates().y);
                });
            },
            "dock": function (item) {
                item.docked(true);
                _items.push(item);
                //htmlDockController.addItem({id:"test", data:copiesToTouches[t].getData(),x:copiesToTouches[t].getCoordinates().x});
                __filterHandler.dockChanges(_id, _items, _self);
                __dataHandler.dockUpdated(_id,_items);
            },
            "hit": function (item) {
                if (item.getCoordinates().x > _x &&
                    item.getCoordinates().y > _y &&
                    item.getCoordinates().x < _x + _width &&
                    item.getCoordinates().y < _y + _height)
                    return true;
                return false;


            },
            "id": function () {
                return _id;
            },
            "getColor": function () {
                return _color;
            },
            "relatedItems": function (items) {
                _relatedItems = items;
            }

        }
    }

    var __dataHandler = function(){
        var _dataDock;
        var _items = {};
        return {
            "dockUpdated" : function(id, items){

                if(_dataDock.id() != id) return;
                //set all to delete first
                Object.keys(_items).forEach(function(i){
                    if(_items[i] != undefined)_items[i].remove = true;
                });
                //add new items
                var itemsToAdd = [];
                items.forEach(function(i){
                    if(_items[i.getData().event_id] == undefined)
                    {
                        _items[i.getData().event_id] = {item: i, remove:false};
                        itemsToAdd.push({data:i.getData(),x: i.getCoordinates().x - $("#docking").offset().left});
                    }
                    else
                        _items[i.getData().event_id].remove = false; //it's already there, so we want to keep it
                        //also no need to end them again
                })
                //remove old items
                var itemsToRemove = [];
                Object.keys(_items).forEach(function(i){
                    if(_items[i] == undefined) return;
                    var ii = _items[i].item;
                    if(_items[ii.getData().event_id] != undefined && _items[ii.getData().event_id].remove)
                    {

                        itemsToRemove.push(ii.getData());
                        _items[ii.getData().event_id] = undefined;
                    }
                });
                ___socket_LARA.emit("addObjects", {id: ___browserID,canvas: __canvas, objects:itemsToAdd});
                ___socket_LARA.emit("removeObjects", {id: ___browserID,canvas: __canvas, objects:itemsToRemove});
                console.log("in");
                console.log(items);
                console.log("out");
                console.log(_items);

            },
            "init" : function(dataDock)
            {
                _dataDock = dataDock;
            }
        }
    }();

    var Filter = function () {
        return{
            "dock": {},
            "users": [],
            "phases": [],
            "events": []};
    };

    var __filterHandler = function () {
        var _filtersByDock = [];
        var updateVisualization = function () {

            //update the entire visualization with the filters we have
            var items = __vis.getVisualizationItems();
            //go through each dock, and highlight/filter the items
            Object.keys(_filtersByDock).forEach(function (k) {
                var dock = _filtersByDock[k];
                var xf = crossfilter(items);
                //by users
                var byUser = xf.dimension(function (d) {
                    return d.getData().username.toLowerCase();
                });
                if (dock.users.length > 0) {


                    byUser.filterFunction(function (f) {
                        var found = false;
                        //if the activity is by one of the users, it's part of the filtering!
                        dock.users.forEach(function (u) {
                            if (f == u.getData().id) {
                                found = true;
                                return true;
                            }
                        });
                        return found;
                    })
                }
                //by phases

                var byPhases = xf.dimension(function (d) {
                    return parseInt(d.getData().context.phase);
                });
                if (dock.phases.length > 0) {
                    byPhases.filterFunction(function (f) {
                        var found = false;
                        //if the activity is by one of the users, it's part of the filtering!
                        dock.phases.forEach(function (u) {
                            if (f == u.getPhase()) {
                                found = true;
                                return true;
                            }
                        });
                        return found;
                    })
                }

                //by events

                //undo previous highlighting of this color
                if (dock.users.length > 0 || dock.phases.length > 0) {
                    items.forEach(function (d) {
                        d.highlight(dock.dock.getColor(), 0);
                    })

                }
                else {
                    items.forEach(function (d) {
                        d.highlight(dock.dock.getColor(), 1);
                        dock.dock.relatedItems([]);
                    })
                    return;

                }
                //now highlight the ones we found

                byUser.top(Infinity).forEach(function (d) {
                    d.highlight(dock.dock.getColor(), 2);
                })

                //hand them to the dock, if we wanna do more fancy stuff with them
                dock.dock.relatedItems(byUser.top(Infinity));
            });


        }
        return {
            //when dock changes, it calls the filter handler
            "dockChanges": function (id, items, dock) {
                //if it's not part of the docks we got init'd with, ignore (like data dock)
                if(Object.keys(_filtersByDock).indexOf(id) < 0)
                    return;

                //remove old filter
                delete _filtersByDock[id];
                _filtersByDock[id] = undefined;
                _filtersByDock[id] = new Filter();
                _filtersByDock[id].dock = dock;
                //get users
                items.forEach(function (i) {
                    switch (i.type()) {
                        case "USER":

                            _filtersByDock[id].users.push(i);
                            break;
                        case "PHASE":

                            _filtersByDock[id].phases.push(i);
                            break;
                        default:
                            console.log("we found an odd type to filter");
                    }
                });
                //get phases
                //get events

                updateVisualization();
            },
            "init": function (docks) {
                docks.forEach(function (d) {
                    _filtersByDock[d.id()] = new Filter();
                    _filtersByDock[d.id()].dock = d;
                });
            }

        }
    }();


    var __copyHandler = function () {
        var copiesToTouches = {};

        return {
            "updateTouchedCopies": function (touches) {
                //first go through the ones that are already being touched
                Object.keys(copiesToTouches).forEach(function (t) {
                    var touch = touches[t];
                    //maybe there's no touches we care about
                    if (copiesToTouches[t] == undefined) return;
                    //if touch doesn't exist anymore, we need to do something with this floating object
                    if (touch == undefined) {
                        //2 cases. floating mid air, get rid of it. floating above a dock, dock!
                        var hit = false;
                        __docks.forEach(function (d) {
                            //console.log(d);
                            if (d.hit(copiesToTouches[t])) {
                                d.dock(copiesToTouches[t]);
                                hit = true;
                                return;
                            }
                        });
                        if(!hit && __dataDock.hit(copiesToTouches[t]))
                        {
                            __dataDock.dock(copiesToTouches[t]);
                            hit = true;
                        }
                        if (!hit) delete copiesToTouches[t];
                        copiesToTouches[t] = undefined;

                    }
                    else {
                        //else we have to move it with the finger
                        copiesToTouches[touch.id].manual_updatePosition(touch.x, touch.y);
                        console.log("moving");
                    }
                });


            },
            "handover": function (touch, copy) {

                copiesToTouches[touch.id] = copy;

            },

            "generateCopyFor": function (touch, copy) {
                //we're already touching this copy
                if (copiesToTouches[touch.id] != undefined)
                    return;


                copiesToTouches[touch.id] = copy.copy();
                copiesToTouches[touch.id].manual_updatePosition(touch.x, touch.y);
            },
            "draw": function (processing) {

                Object.keys(copiesToTouches).forEach(function (c) {
                    if (copiesToTouches[c] == undefined)
                        return;
                    copiesToTouches[c].draw();
                });

            }


        }
    }();

    var UserToken = function () {
        var _data;
        var _x, _y, _width, _height;
        var _screenX;
        var _screenY;
        var _rotation;

        var _processing;
        var _pressed = false;
        var _isCopy = false;
        var _docked = false;
        var _type = "USER"
        return {
            "init": function (x, y, data, processing, rotation) {
                _data = data;
                _x = x;
                _y = y;
                _rotation = rotation;

                _width = 100;
                _height = 10;
                _processing = processing;

                _screenX = _processing.screenX(_x, _y);
                _screenY = _processing.screenY(_x, _y)
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
                    if (!_isCopy && _pressed) {
                        __copyHandler.generateCopyFor(touch, _self);
                        return;
                    }
                    //it's a copy, move it around
                    _self.manual_updatePosition(touch.x, touch.y);
                }
                else {
                    _pressed = false;
                }
            },
            "touched": function (touches) {
                var found = undefined;

                var x,y;
                if(_isCopy)
                {
                    x = _x;
                    y = _y;

                }
                else{
                    x = _screenX;
                    y = _screenY;

                }

                Object.keys(touches).forEach(function (t) {
                    if (touches[t] == undefined) return;
                    //check if mouse isn't clicked in item
                    var touch = touches[t];
                    if(_rotation == undefined)
                    {
                        if (touch.x > x &&
                            touch.y > y - 10 &&
                            touch.x < x + _width &&
                            touch.y < y - 10 + _height) {
                            found = touches[t];
                            return true;
                        }
                        return false;
                    }
                    if(_rotation == "left")
                    {
                        if (touch.x > x &&
                            touch.y > y &&
                            touch.x < x  + _height &&
                            touch.y < y  + _width) {
                            found = touches[t];
                            return true;
                        }
                        return false;
                    }
                    if(_rotation == "right")
                    {
                        if (touch.x > x - _height &&
                            touch.y < y &&
                            touch.x < x  &&
                            touch.y > y  - _width) {
                            found = touches[t];
                            return true;
                        }
                        return false;
                    }
                });
                return found;

            },
            "draw": function () {
                _processing.pushMatrix();


                _processing.translate(_x, _y -12);

                _processing.rectMode(_processing.CORNER);
                _processing.noFill();
                _processing.stroke(255);
                _processing.rect(0, 0, _width, _height + 2);

                _processing.fill(255);
                _processing.text(_data.total + " " + _data.user.name, 2, 2, _width, _height + 10);
                _processing.popMatrix();
            },
            "manual_updatePosition": function (x, y) {
                _x = x;
                _y = y;
            },
            "isCopy": function (b) {
                _isCopy = b;
            },
            "copy": function () {
                var c = new UserToken();
                c.init(_x, _y,  _data, _processing);
                c.isCopy(true);
                return c;
            },
            "docked": function (b) {
                _docked = b;
            },
            "getCoordinates": function () {
                return {x: _x, y: _y};
            },
            "type": function () {
                return _type;
            },
            "getData": function () {
                return _data;
            }
        }
    }

    var __userHandler = function () {
        var _users = [];
        var _processing;
        var _x;
        var _y;
        var _offset = 0;
        return {
            //coordinates = {x,y,rotation} as we can have them displayed multiple times
            "init": function (users, processing, coordinates) {

                _processing = processing;
                var i = 0;
                coordinates.forEach(function(c)
                {
                    _users.push([]);
                });
                users.forEach(function (u) {
                    if(i > 22) return false;
                    //the data we get from users actually contains the key (facebook_.. ) + phases
                    //__users contains real user data. so we gotta put those together
                    var userData = __users[u.key] != undefined ? __users[u.key] : undefined;
                    if (userData == undefined) return;

                    var data = {id: u.key, user: userData, phases: u.value.countByPhase, total: u.value.total}
                    //draw them for each side of the table (in normal situation
                    var coordIndex = 0;
                    coordinates.forEach(function(c){
                        _processing.pushMatrix();

                        _processing.translate(c.x, c.y);
                        _processing.rotate(c.r);
                        var user = new UserToken();
                        user.init(parseInt(i /9) * 120, (i % 9) * 15,data, processing, c.rotate);
                        _users[coordIndex].push({user:user, coord: c});
                        coordIndex++;
                        _processing.popMatrix();

                    });

                    i++;

                });

            },
            "draw": function () {


                _users.forEach(function (u) {

                    u.forEach(function(uc){

                            _processing.pushMatrix();

                            _processing.translate(uc.coord.x, uc.coord.y);
                            _processing.rotate(uc.coord.r);
                            uc.user.draw();
                            _processing.popMatrix();
                        }
                    );


                });


            },
            "update": function (touches) {

                _users.forEach(function (u) {

                    u.forEach(function(uc){


                            uc.user.update(touches,uc.user);

                        }
                    );


                });
            }

        }
    }();


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

        var drawTriangle = function () {
            _processing.noFill();
            _processing.strokeWeight(1);
            _processing.stroke(0xCC33FF99);
            if (_pressed)
                _processing.fill(255);
            _processing.triangle(_x - 5, _y + 5, _x + 5, _y + 5, _x, _y - 5);
        }

        var drawCircle = function () {
            _processing.noFill();
            _processing.strokeWeight(1);
            _processing.stroke(0xCC33FF99);
            if (_pressed)
                _processing.fill(255);
            _processing.ellipse(_x, _y, 10, 10);
        };
        var drawStar = function () {
            _processing.pushMatrix();
            _processing.noFill();
            _processing.strokeWeight(3);
            _processing.stroke(0xCC33FF99);
            if (_pressed)
                _processing.fill(255);
            _processing.translate(_x, _y);
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
        var _pulse = 1.0;
        var drawSquare = function () {

            //if dockd, draw some extra background
            if(_docked) {
                _processing.rectMode(_processing.CORNER);
                _processing.noStroke();
                _processing.fill(125);
                _processing.rect(_x, _y-8, 210, 24);
            }
            //let's have a maximum of 4 docks for now
            //draw a square with each quadrant the color of the dock if highlighted
            var width = 8;
            var height = 8;
            var spacing = 2;
            if (_pressed)
                width = 8;
            _processing.rectMode(_processing.CORNER);
            _processing.noStroke();
            var i = 0;

            var positions =[
                {x:_x, y:_y},                                                 {x:_x + 2 * (width + spacing), y:_y},
                {x:_x, y:_y + height + spacing},   {x:_x + 1 * width + spacing, y:_y + height + spacing},   {x:_x + 2 * (width + spacing), y:_y + height + spacing},


            ];

            Object.keys(_highlight).forEach(function (k) {
                if (_highlight[k] == 2) {
                    //will also pulsate
                    var pulseTransformed = Math.sin(_pulse * (Math.PI / 180));
                    var color = (parseInt(k) & 0xffffff) | (parseInt(pulseTransformed * 255 * _twAppear) << 24);
                    _processing.fill(color);
                }
                else if (_highlight[k] == 0) {
                    _processing.fill(128);
                }
                else {
                    _processing.fill(255);
                }
                var x = positions[i].x;
                var y = positions[i].y;
                _processing.rect(x, y - height / 2, width, height);


                i++;
            })

            for (var j = i; j < 5; j++) {
                var color = (parseInt(0xffffff) & 0xffffff) | (parseInt(255 * _twAppear) << 24);
                _processing.fill(color);
                var x = positions[j].x;
                var y = positions[j].y;

                _processing.rect(x, y - height / 2, width, height);
            }


        }

        var drawDocked = function () {
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

            "init": function (x, y, data, processing, order) {
                _x = x;
                _y = y;

                _data = data;
                _processing = processing;
                _order = order;



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
                    if (!_isCopy && _pressed) {
                        __copyHandler.generateCopyFor(touch, _self);
                        return;
                    }
                    //it's a copy, move it around
                    _self.manual_updatePosition(touch.x, touch.y);
                }
                else {
                    _pressed = false;
                }


                //update pulsing
                _pulse = (_pulse + 1) % 180;

                //update appearing
                if(!_isCopy) {
                    if (_order > 0) _order -= 2;
                    else if (_twAppear < 1.0)
                        _twAppear += 0.1 * .1;
                    else _twAppear = 1;
                }
                else
                {
                    _order = 0;
                    _twAppear = 1;
                }
                //update screen coordindates
                _screenX = _processing.screenX(_x, _y);
                _screenY = _processing.screenY(_x, _y)


            },
            "touched": function (touches) {
                var found = undefined;

                Object.keys(touches).forEach(function (t) {
                    if (touches[t] == undefined) return;
                    //check if mouse isn't clicked in item
                    var touch = touches[t];

                    var x,y;
                    if(_docked) {
                        x = _x;
                        y = _y;
                    }
                    else {
                        x = _processing.screenX(_x, _y);
                        y = _processing.screenY(_x, _y);
                    }
                    if (touch.x > x &&
                        touch.y > y  &&
                        touch.x < x + 30 &&
                        touch.y < y + 20) {
                        found = touches[t];
                        return true;
                    }
                    return false;

                });

                return found;

            },
            "draw": function () {
                drawSquare();
                return;


                if (_docked) {
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


//PREPROCESS
        var preprocess_verbs = function (data) {
            var xf = crossfilter(data);
            var byVerb = xf.dimension(function (f) {
                return f.verb;
            });
            return byVerb.group(function (d) {
                if (d != "read" && d != "answer_given" && d != "startRun" && d != "like" && d != "delete_like" &&
                    d != "delete_discussion_topic_reply" && d != "delete_comment" && d != "delete_arlearntask" && d != "delete_mindmeistermap")
                    return d;
            }).top(Infinity);

        }
        var preprocess_nodes = function (data) {
            var xf = crossfilter(data);
            var byEvents = xf.dimension(function (f) {
                return f.event_id;
            });
            var byVerb = xf.dimension(function (f) {
                return f.verb;
            });
            byVerb.filter(function (d) {
                if (d != "read" && d != "answer_given" && d != "startRun" && d != "like" && d != "delete_like" && d != "rating_updated" &&
                    d != "delete_discussion_topic_reply" && d != "delete_comment" && d != "delete_arlearntask" && d != "delete_mindmeistermap")
                    return d;
            });
            return byEvents.bottom(Infinity);
        }

        var preprocess_links = function (data) {
            var xf = crossfilter(data);
            var dim = xf.dimension(function (f) {
                return f.object;
            });
            return dim.top(Infinity);
            //SHOULD WE SORT BY DATE? //MAYBE NOT .. nodes visualized are already sorted
        }

        var preprocess_users = function (data) {
            var xf = crossfilter(data);
            var dim = xf.dimension(function (f) {
                return f.username.toLowerCase();
            });
            return dim.group().reduce(
                function (p, v) {
                    if (p.countByPhase[v.context.phase] == undefined)
                        p.countByPhase[v.context.phase] = 0;
                    p.countByPhase[v.context.phase]++;
                    p.total++;
                    return p;

                },
                function (p, v) {
                    p.total--;
                    p.countByPhase[v.context.phase]--;
                    return p;
                },
                function () {
                    return {countByPhase: {}, total: 0};
                }
            ).order(function (o) {
                    return o.total
                }).top(Infinity);
        }

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



//METHODS


        var setup = function () {
            var processing = Processing.getInstanceById(_canvas);
            processing.size($("#" + __canvas).width(), $("#" + __canvas).height(), processing.JAVA2D);


        };

        var draw = function () {


            var processing = Processing.getInstanceById(_canvas);
            if(_flipped) {
                processing.rotate(Math.PI);
                processing.translate(-$("#" + __canvas).width(),-$("#" + __canvas).height())
            }
            processing.background(0xCC2b2b2b);
            //updating
            _circles.forEach(function (d) {
                d.update(_touches, d);
            });
            __copyHandler.updateTouchedCopies(_touches);
            __docks.forEach(function (d) {
                d.update(_touches);
            })
            __dataDock.update(_touches);
            __userHandler.update(_touches);
            //__phaseHandler.update(_touches);


            //drawing


            processing.pushMatrix();
            if (_offset.x > 300) _offset.x = 300;
            processing.translate(_offset.x / _zoom, _offset.y / _zoom);

            //do updates within matrix transofmrations
            _circles.forEach(function (d) {
                d.update(_touches, d);
            });


            //processing.noStroke();
            var noPhaseButCount = 0;
            Object.keys(_yPerEvent).forEach(function (y) {

                drawPhase((noPhaseButCount%2+1)*3, _yPerEvent[y].subphase, _yPerEvent[y].y, processing);
                noPhaseButCount++;
            });

            _circles.forEach(function (d) {
                d.draw(processing);
            });
            processing.stroke(255, 255, 255);
            processing.strokeWeight(1);
            Object.keys(_usersToCircles).forEach(function (uk) {
                var u = _usersToCircles[uk];
                if (u.length > 1) {
                    for (var i = 0; i < u.length - 1; i++) {
                        processing.line(u[i].getCoordinates().x,
                            u[i].getCoordinates().y,
                            u[i + 1].getCoordinates().x,
                            u[i + 1].getCoordinates().y);
                        //console.log(i);
                    }
                }
            });


            processing.popMatrix();
            processing.pushMatrix();

            processing.translate(0, _offset.y / _zoom);
            var noPhaseButCount = 0;
            Object.keys(_yPerEvent).forEach(function (y) {

                drawPhaseHeader((noPhaseButCount%2+1)*3, _yPerEvent[y].title, _yPerEvent[y].y, processing);
                noPhaseButCount++;
            });
            processing.popMatrix();

            //draw slide area
            processing.rectMode(processing.CORNER);
            processing.noStroke();
            processing.fill(50);
            processing.rect(0,800, $("#" + _canvas).width(), 70);
            processing.fill(150);
            processing.triangle(210,825, 300,810, 300, 860);
            processing.triangle($("#" + _canvas).width()-210,825, $("#" + _canvas).width()-300,810, $("#" + _canvas).width()-300, 860);

            //draw background for ui
            processing.rectMode(processing.CORNER);
            processing.noStroke();
            processing.fill(0);
            processing.rect(0,0, 160, $("#" + _canvas).height());
            processing.rect(0,$("#" + _canvas).height()-160, $("#" + _canvas).width(), 160 );
            processing.rect($("#" + _canvas).width()-160,0, 160, $("#" + _canvas).width());

            __docks.forEach(function (d) {
                d.draw(processing);
            })
            __dataDock.draw(processing);
            __userHandler.draw();
            __copyHandler.draw(processing);

           // __phaseHandler.draw();

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


        var phaseColors = [0xCC1c3341, 0xCC244153, 0xCC2c5169, 0xCC345e79, 0xCC3e7091, 0xCC4781a6];
        var setPhaseColor = function (phase, processing) {
            switch (phase) {
                case 1:
                case "1":
                    processing.fill(phaseColors[0]);
                    break;
                case 2:
                case "2":
                    processing.fill(phaseColors[1]);
                    break;
                case "3":
                case 3:
                    processing.fill(phaseColors[2]);
                    break;
                case 4:
                case "4":
                    processing.fill(phaseColors[3]);
                    break;
                case 5:
                case "5":
                    processing.fill(phaseColors[4]);
                    break;
                case 6:
                case "6":
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
        var drawPhaseHeader = function (phase, title, y, processing) {
            setPhaseColor(phase, processing);
            processing.rectMode(processing.CORNER);
            processing.noStroke();
            processing.rect(200, y - 10, 100, 40);
            processing.fill(255);
            processing.text(title, 200, y+10)
        };
        var drawPhase = function (phase, subphase, y, processing) {

            setPhaseColor(phase, processing);
            processing.rectMode(processing.CORNER);
            processing.noStroke();
            processing.rect(0, y - 10, _highestX + 10, 40);
            processing.fill(255);

            //console.log("draw rect");

        }


        var createCircles = function (processing) {
            //make a circle out of every node


            var xSpacing = 40;
            var ySpacing = 40;

            var x = 10;
            var y = 10;
            var order = 0;
            _nodes.forEach(function (n) {
                if (y > _mostRightY) _mostRightY = y;
                //if(n.verb == "response") y = 5;
                //else
                {
                    //var grouping = n.verb + n.context.phase + n.context.subphase;
                    var grouping = n.context.subphase;
                    //var grouping = n.verb;
                    //var grouping = n.object;
                    //var grouping = parseInt(n.context.phase);
                    if (_yPerEvent[grouping] == undefined) {
                        y = _mostRightY;
                        y += ySpacing;
                        _yPerEvent[grouping] = {};

                        _yPerEvent[grouping].title = grouping;
                        _yPerEvent[grouping].y = y;
                        _yPerEvent[grouping].phase = parseInt(n.context.phase);
                        _yPerEvent[grouping].subphase = n.context.subphase;
                        _yPerEvent[grouping].verb = n.verb;

                        //x = 10;
                    }
                    else {
                        y = _yPerEvent[grouping].y;
                    }
                }
                x += xSpacing;

                var c = new Circle();
                c.init(x, y, n, processing, order);
                //fill the dock colors. k this is a hack, we don't have time for anything else tho
                __docks.forEach(function(d){
                    c.highlight(d.getColor(),1);
                });

                _circles.push(c);
                order++;


            });
            _highestX = x;
        }

        var createPhases = function () {
            _nodes.forEach(function (n) {
                _phases.push(n.context.phase);
            });
        }

        var linkUsersToCircles = function () {

            _circles.forEach(function (n) {
                var user = n.getUser();
                if (_usersToCircles[user] == undefined)
                    _usersToCircles[user] = [];
                _usersToCircles[user].push(n);
            });
        }


        return {
            "init": function (data, canvas,flipped) {
                _canvas = canvas;
                _nodes = preprocess_nodes(data);
                _links = preprocess_links(data);
                _users = preprocess_users(data);
                __verbs = preprocess_verbs(data);
                _flipped = flipped;

                initProcessing();
                var processing = Processing.getInstanceById(_canvas);
                createCircles(processing);
                createPhases();
                //linkUsersToCircles();
                var userCoordinates = [
                    {x:120, y: $("#" + __canvas).height() - 140, r:0},
                    {x:$("#" + __canvas).width()/2 + 60, y: $("#" + __canvas).height() - 140, r:0},
                    {x:140, y: 120, r:Math.PI/2, rotate:"left"},
                    {x:$("#" + __canvas).width() - 140, y: $("#" + __canvas).height() - 120, r:-Math.PI/2, rotate:"right"}
                ];
                __userHandler.init(_users, processing, userCoordinates);
                //__phaseHandler.init(processing, 200, $("#" + __canvas).height() - 300);


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

        "loadVisualization" : function (canvas, flipped, dockColor1, dockColor2) {

            __canvas = canvas;
            //filter it
            var xf = crossfilter(__data);
            var byUser = xf.dimension(function (d) {
                return d.username.toLowerCase();
            });
            var byVerb = xf.dimension(function (d) {
                return d.verb.toLowerCase();
            });

            var dock1 = new Dock();
            dock1.init(0, 0, 100, 100, "dock1", dockColor1, dock1);
            __docks.push(dock1);

            var dock5 = new Dock();
            dock5.init($("#" + __canvas).width()-100,0,100,100,"dock5", "0xCC8CFF6B", dock5);
            __docks.push(dock5);

            var dock2 = new Dock();
            dock2.init(0, $("#" + __canvas).height() - 100, 100, 100, "dock2", dockColor2, dock2);
            __docks.push(dock2);
            var dock3 = new Dock();
            dock3.init($("#" + __canvas).width()/2-50,$("#" + __canvas).height()-100,100,100,"dock3", "0xCCfff3a2", dock3);
            __docks.push(dock3);

            var dock4 = new Dock();
            dock4.init($("#" + __canvas).width()-100,$("#" + __canvas).height()-100,100,100,"dock4", "0xCCff1313", dock4);
            __docks.push(dock4);



            __filterHandler.init(__docks);

            //byVerb.filterFunction(function(f){ return f != "rated"});
            __vis = new visualization();
            __vis.init(byUser.top("Infinity"), canvas, flipped);


            //create a dock for data drops
            __dataDock = new Dock();
            __dataDock.init(200, 300, $("#" + __canvas).width()-400,80, "dataDock", "0xCC545454", __dataDock);
            __dataHandler.init(__dataDock);

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