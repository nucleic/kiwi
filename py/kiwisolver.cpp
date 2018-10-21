/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2018, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#include <Python.h>
#include <cppy/cppy.h>
#include <kiwi/kiwi.h>
#include "types.h"

#define PY_KIWI_VERSION "1.2.0.dev"

struct module_state {
    PyObject *error;
};

static PyMethodDef
kiwisolver_methods[] = {
    { 0 } // Sentinel
};

static struct PyModuleDef kiwisolver_moduledef = {
    PyModuleDef_HEAD_INIT,
    "kiwisolver",
    NULL,
    sizeof( struct module_state ),
    kiwisolver_methods,
    NULL
};

PyMODINIT_FUNC
PyInit_kiwisolver( void )
{
    PyObject *mod = PyModule_Create( &kiwisolver_moduledef );
    if( !mod )
        return NULL;
    if( import_variable() < 0 )
        return NULL;
    if( import_term() < 0 )
        return NULL;
    if( import_expression() < 0 )
        return NULL;
    if( import_constraint() < 0 )
        return NULL;
    if( import_solver() < 0 )
        return NULL;
    if( import_strength() < 0 )
        return NULL;
    PyObject* kiwiversion = PyUnicode_FromString( KIWI_VERSION );
    if( !kiwiversion )
        return NULL;
    PyObject* pyversion = PyUnicode_FromString( PY_KIWI_VERSION );
    if( !pyversion )
        return NULL;
    PyObject* pystrength = PyType_GenericNew( &strength_Type, 0, 0 );
    if( !pystrength )
        return NULL;

    PyModule_AddObject( mod, "__version__", pyversion );
    PyModule_AddObject( mod, "__kiwi_version__", kiwiversion );
    PyModule_AddObject( mod, "strength", pystrength );
    PyModule_AddObject( mod, "Variable", cppy::incref( pyobject_cast( &Variable_Type ) ) );
    PyModule_AddObject( mod, "Term", cppy::incref( pyobject_cast( &Term_Type ) ) );
    PyModule_AddObject( mod, "Expression", cppy::incref( pyobject_cast( &Expression_Type ) ) );
    PyModule_AddObject( mod, "Constraint", cppy::incref( pyobject_cast( &Constraint_Type ) ) );
    PyModule_AddObject( mod, "Solver", cppy::incref( pyobject_cast( &Solver_Type ) ) );
    PyModule_AddObject( mod, "DuplicateConstraint", cppy::incref( DuplicateConstraint ) );
    PyModule_AddObject( mod, "UnsatisfiableConstraint", cppy::incref( UnsatisfiableConstraint ) );
    PyModule_AddObject( mod, "UnknownConstraint", cppy::incref( UnknownConstraint ) );
    PyModule_AddObject( mod, "DuplicateEditVariable", cppy::incref( DuplicateEditVariable ) );
    PyModule_AddObject( mod, "UnknownEditVariable", cppy::incref( UnknownEditVariable ) );
    PyModule_AddObject( mod, "BadRequiredStrength", cppy::incref( BadRequiredStrength ) );

    return mod;
}
