/**
 * Created by yadirhb on 9/3/2016.
 */
try { // On nodejs
    var System = System || require("vitruvio");
} catch(e){}

var using = System.using,
    Namespace = using('System.Namespace'),
    Class = using('System.Class');

Namespace('com.example',
	/**
	 * Class Animal
	 */
    module.exports = Class('Animal', { // module.exports to publish the class over NodeJS
        'constructor': function (specie) {
            this.specie = specie;
        },
		'getSpecie' : function(){
			return this.specie;
		}
    })
)