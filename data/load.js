/**
 * Created by svenc on 30/07/14.
 */

var debug = true;
var _dataCallback;
var __data = undefined;
var __users = undefined;

function load(callback)
{
    _dataCallback = callback;
    loadData();

}
function loadData()
{

    try {
        $.getJSON('./data/testData.json', data_loading_done, "json");
    }
    catch(e)
    {
        console.log(e);
    }

}

function data_loading_done(d)
{

    __testData = d;
    _dataCallback();
}
