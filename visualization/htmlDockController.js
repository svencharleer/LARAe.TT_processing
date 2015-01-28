/**
 * Created by svenc on 23/10/14.
 */
var htmlDockController = function()
{
    //{x: .. , data: ..}
    var items = {};
    return {
        "addItem" : function(item)
        {
            items[item.id] = item;
            var div = $("#docking").append("<div style='position:relative;width:300px' id='" + item.id +"'></div>");
            $("#"+item.id+"").html(item.data.originalrequest.value.description);
            $("#"+item.id+"").css("left", item.x);
        },
        "removeItem" : function(item)
        {
            delete items[item.id]
            items[item.id] = undefined;
        },
        "update" : function(items)
        {
            items.forEach(function(i){
                if(items[i.id] == undefined) return;

                items[i.id].x = i.x;
            })
        }

    }
}();