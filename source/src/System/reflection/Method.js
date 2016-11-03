/**
 * Created by yadirhb on 3/23/2016.
 */
Class('reflection.Method', {
    'constructor': function (name, func) {
        Member.call(this, System.reflection.Method);
        this.getName = function () {
            return name;
        }

        this.getSignature = function () {
            return name + "(" + getSignature(func) + ")";
        }
    }
})
define(System.reflection.Method, Member);