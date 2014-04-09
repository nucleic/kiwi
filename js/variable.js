/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var kiwi;
(function (kiwi) {
    /**
    * The primary user constraint variable.
    *
    * @class
    */
    var Variable = (function () {
        /**
        * Construct a new Variable
        *
        * @param [name] The name to associated with the variable.
        */
        function Variable(name) {
            this._value = 0.0;
            this._context = null;
            this._name = name || "";
            this._id = VarId++;
        }
        /**
        * Returns the unique id number of the variable.
        */
        Variable.prototype.id = function () {
            return this._id;
        };

        /**
        * Returns the name of the variable.
        */
        Variable.prototype.name = function () {
            return this._name;
        };

        /**
        * Set the name of the variable.
        */
        Variable.prototype.setName = function (name) {
            this._name = name;
        };

        /**
        * Returns the user context object of the variable.
        */
        Variable.prototype.context = function () {
            return this._context;
        };

        /**
        * Set the user context object of the variable.
        */
        Variable.prototype.setContext = function (context) {
            this._context = context;
        };

        /**
        * Returns the value of the variable.
        */
        Variable.prototype.value = function () {
            return this._value;
        };

        /**
        * Set the value of the variable.
        */
        Variable.prototype.setValue = function (value) {
            this._value = value;
        };
        return Variable;
    })();
    kiwi.Variable = Variable;

    /**
    * The internal variable id counter.
    */
    var VarId = 0;
})(kiwi || (kiwi = {}));
