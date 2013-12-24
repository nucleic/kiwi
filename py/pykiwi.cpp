/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#include <Python.h>
#include "pythonhelpers.h"
#include "types.h"


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
    PyModule_AddObject( mod, "UnboundedObjective", newref( UnboundedObjective ) );
}
