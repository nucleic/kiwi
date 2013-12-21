/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#include "pythonhelpers.h"
#include "term.h"
#include "variable.h"


using namespace PythonHelpers;


static PyMethodDef
pykiwi_methods[] = {
    { 0 } // Sentinel
};


PyMODINIT_FUNC
initpykiwi( void )
{
    PyObject* mod = Py_InitModule( "pykiwi", pykiwi_methods );
    if( !mod )
        return;
    if( import_term() < 0 )
        return;
    if( import_variable() < 0 )
        return;
    Py_INCREF( &Term_Type );
    Py_INCREF( &Variable_Type );
    PyModule_AddObject( mod, "Term", pyobject_cast( &Term_Type ) );
    PyModule_AddObject( mod, "Variable", pyobject_cast( &Variable_Type ) );
}
