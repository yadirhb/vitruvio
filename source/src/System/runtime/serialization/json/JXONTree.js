/**
 * Created by yadirhb on 2/19/2016.
 */
Class('runtime.serialization.json.JXONTree', {
    'toString' : function(){
        return "null";
    },
    'valueOf': function(){
        return null;
    },
    'appendJXON' : function (oObjTree) {
        System.runtime.serialization.json.JXONParser.loadObjTree(document, this, oObjTree);
        return this;
    }
})