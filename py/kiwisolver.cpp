/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#include <Python.h>
#include <kiwi/kiwi.h>
#include "pythonhelpers.h"
#include "types.h"

#define PY_KIWI_VERSION "0.1.3"


using namespace PythonHelpers;


static PyMethodDef
kiwisolver_methods[] = {
    { 0 } // Sentinel
};


PyMODINIT_FUNC
initkiwisolver( void )
{
    PyObject* mod = Py_InitModule( "kiwisolver", kiwisolver_methods );
    if( !mod )
        return;
    if( import_variable() < 0 )
        return;
    if( import_term() < 0 )
        return;
    if( import_expression() < 0 )
        return;
    if( import_constraint() < 0 )
        return;
    if( import_solver() < 0 )
        return;
    if( import_strength() < 0 )
        return;
    PyObject* kiwiversion = PyString_FromString( KIWI_VERSION );
    if( !kiwiversion )
        return;
    PyObject* pyversion = PyString_FromString( PY_KIWI_VERSION );
    if( !pyversion )
        return;
    PyObject* pystrength = PyType_GenericNew( &strength_Type, 0, 0 );
    if( !pystrength )
        return;
    PyModule_AddObject( mod, "__version__", pyversion );
    PyModule_AddObject( mod, "__kiwi_version__", kiwiversion );
    PyModule_AddObject( mod, "strength", pystrength );
    PyModule_AddObject( mod, "Variable", newref( pyobject_cast( &Variable_Type ) ) );
    PyModule_AddObject( mod, "Term", newref( pyobject_cast( &Term_Type ) ) );
    PyModule_AddObject( mod, "Expression", newref( pyobject_cast( &Expression_Type ) ) );
    PyModule_AddObject( mod, "Constraint", newref( pyobject_cast( &Constraint_Type ) ) );
    PyModule_AddObject( mod, "Solver", newref( pyobject_cast( &Solver_Type ) ) );
    PyModule_AddObject( mod, "DuplicateConstraint", newref( DuplicateConstraint ) );
    PyModule_AddObject( mod, "UnsatisfiableConstraint", newref( UnsatisfiableConstraint ) );
    PyModule_AddObject( mod, "UnknownConstraint", newref( UnknownConstraint ) );
    PyModule_AddObject( mod, "DuplicateEditVariable", newref( DuplicateEditVariable ) );
    PyModule_AddObject( mod, "UnknownEditVariable", newref( UnknownEditVariable ) );
    PyModule_AddObject( mod, "BadRequiredStrength", newref( BadRequiredStrength ) );
}
