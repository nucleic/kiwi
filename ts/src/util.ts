/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
module kiwi
{

    /**
     * Tests whether a value is approximately zero.
     */
    export
    function nearZero( value: number ): boolean
    {
        var eps = 1.0e-8;
        return value < 0.0 ? -value < eps : value < eps;
    }

}
