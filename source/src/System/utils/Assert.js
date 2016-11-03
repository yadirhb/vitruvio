/**
 * Created by yadirhb on 3/18/2016.
 */
Static.Class('utils.Assert', {
    'assert' : function(){
        if($global.console && $global.console.assert) {
            $global.console.assert(arguments[0], arguments[1], arguments[2]);
        }
    }
})