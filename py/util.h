/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <Python.h>


inline bool
convert_to_double( PyObject* obj, double& out )
{
    if( PyFloat_Check( obj ) )
    {
        out = PyFloat_AS_DOUBLE( obj );
        return true;
    }
    if( PyInt_Check( obj ) )
    {
        out = double( PyInt_AsLong( obj ) );
        return true;
    }
    if( PyLong_Check( obj ) )
    {
        out = PyLong_AsDouble( obj );
        if( out == -1.0 && PyErr_Occurred() )
            return false;
        return true;
    }
    return false;
}
