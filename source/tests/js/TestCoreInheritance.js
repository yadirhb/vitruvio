/**
 * Created by yadirhb on 11/22/2015.
 */
NoConflict.ready(function (System) {
    var using = System.using;
    var Log = using('System.utils.Log');
    var Class = using('System.Class');
    var Member = using('System.reflection.Member');
    var Type = using('System.reflection.Type');
    var Namespace = using('System.Namespace');

    if (!((new Member) instanceof Type))
        Log.assert(false, "Member does not inherit from Type");

    // if (!(( new Class) instanceof Member))
    //     Log.assert(false, "Class does not inherit from Member");
    //
    // if (!(( new Class) instanceof Type))
    //     Log.assert(false, "Class does not inherit from Type");

    if (!(( new Namespace) instanceof Member))
        Log.assert(false, "Namespace does not inherit from Member");

    if (!(( new Namespace) instanceof Type))
        Log.assert(false, "Namespace does not inherit from Type");
});
