/**
 * Created by yadirhb on 12/26/2015.
 */
NoConflict.ready(function(System){
    var Class = System.Class;
    var Log = System.utils.Log;

    Class("Square",{
        '$extends':"Shape",
        'constructor': function(){
            this.$super.call(this, true);
        }
    });

    Class("Circle",{
        '$extends':"Shape",
        'constructor': function(){
            this.$super.call(this, false);
        }
    });

    Class("Shape",{
        'constructor':function(isPolygon){
            Log.log("I'm a "+ this.getClass().$name + ", "+ (isPolygon ? "I'm a polygon" : "I'm not a polygon") );
        }
    });

    var c = new Circle();
    var sq = new Square();
});