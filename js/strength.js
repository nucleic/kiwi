/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
var kiwi;
(function (kiwi) {
    (function (Strength) {
        /**
        * Create a new symbolic strength.
        */
        function create(a, b, c, w) {
            if (typeof w === "undefined") { w = 1.0; }
            var result = 0.0;
            result += Math.max(0.0, Math.min(1000.0, a * w)) * 1000000.0;
            result += Math.max(0.0, Math.min(1000.0, b * w)) * 1000.0;
            result += Math.max(0.0, Math.min(1000.0, c * w));
            return result;
        }
        Strength.create = create;

        /**
        * The 'required' symbolic strength.
        */
        Strength.required = create(1000.0, 1000.0, 1000.0);

        /**
        * The 'strong' symbolic strength.
        */
        Strength.strong = create(1.0, 0.0, 0.0);

        /**
        * The 'medium' symbolic strength.
        */
        Strength.medium = create(0.0, 1.0, 0.0);

        /**
        * The 'weak' symbolic strength.
        */
        Strength.weak = create(0.0, 0.0, 1.0);

        /**
        * Clip a symbolic strength to the allowed min and max.
        */
        function clip(value) {
            return Math.max(0.0, Math.min(Strength.required, value));
        }
        Strength.clip = clip;
    })(kiwi.Strength || (kiwi.Strength = {}));
    var Strength = kiwi.Strength;
})(kiwi || (kiwi = {}));
