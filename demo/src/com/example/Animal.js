/**
 * Created by yadirhb on 9/3/2016.
 */
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
