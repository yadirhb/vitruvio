/**
 * Created by yadirhb on 9/3/2016.
 */
var using = System.using,
    Namespace = using('System.Namespace'),
    Class = using('System.Class');

Namespace('com.appscidentally.helix',
    module.exports = Class('Dog', {
        '$extends': 'com.example.Animal',
        'constructor': function (name) {
            this.$base(name);
        }
    })
)