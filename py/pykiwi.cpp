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

#if PY_MAJOR_VERSION >= 3
#define GETSTATE(m) ((struct module_state*)PyModule_GetState(m))
#else
#define GETSTATE(m) (&_pykiwistate)
static struct module_state _pykiwistate;
#endif

static PyMethodDef
pykiwi_methods[] = {
    { 0 } // Sentinel
};

#if PY_MAJOR_VERSION >= 3
static struct PyModuleDef pykiwi_moduledef = {
    PyModuleDef_HEAD_INIT,
    "pykiwi",
    NULL,
    sizeof( struct module_state ),
    pykiwi_methods,
    NULL
};

#define INITERROR return NULL

PyMODINIT_FUNC
PyInit_pykiwi( void )
#else
#define INITERROR return
PyMODINIT_FUNC
initpykiwi( void )
#endif
{
    #if PY_MAJOR_VERSION >= 3
        PyObject *mod = PyModule_Create( &pykiwi_moduledef );
        if( !mod )
            return mod;
        if( import_variable() < 0 )
            return mod;
        if( import_term() < 0 )
            return mod;
        if( import_expression() < 0 )
            return mod;
        if( import_constraint() < 0 )
            return mod;
        if( import_solver() < 0 )
            return mod;
    #else
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
    #endif

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

    #if PY_MAJOR_VERSION >= 3
        return mod;
    #endif
}
