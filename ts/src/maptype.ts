/*-----------------------------------------------------------------------------
| Copyright (c) 2014, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/

/// <reference path="../thirdparty/tsu.d.ts"/>

module kiwi
{

    export
    interface IMap<T, U> extends tsu.AssociativeArray<T, U> { }


    export
    function createMap<T, U>( compare: tsu.ICompare<T, T> ): IMap<T, U>
    {
        return new tsu.AssociativeArray<T, U>( compare );
    }

}
