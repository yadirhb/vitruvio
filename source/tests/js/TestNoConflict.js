/**
 * Created by yadirhb on 11/22/2015.
 */
var Log = System.utils.Log;

if(!System.Class)
    Log.assert(false,  "No conflict failed getting instance.");

var NoConflict = System.noConflict();

if(!NoConflict.Class) Log.assert(false, "No conflict failed getting instance.");

if(System != "System.com") Log.assert(false, "No conflict comparing type with default global value.");