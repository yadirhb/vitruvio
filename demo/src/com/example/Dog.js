/**
 * Created by yadirhb on 9/3/2016.
 */
Namespace('com.example',
    /**
     * Dog class
     */
    module.exports = Class('Dog', {
        '$extends': 'com.example.Animal',
        'constructor': function (name, race, age) {
            this.$super('canis'); // initialize super class' constructor first
            this.name = name;
            this.race = race;
            this.age = age;
        },
        'getName': function () {
            return this.name;
        },
        'getAge': function () {
            return this.age;
        },
        'getRace': function () {
            return this.race;
        },
        /**
         * @Override getSpecie
         */
        'getSpecie': function () {
            return this.$super.getSpecie() + " - " + this.race;
        }
    })
)