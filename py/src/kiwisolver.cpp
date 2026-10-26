/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
#include <cppy/cppy.h>
#include <mutex>
#include <kiwi/kiwi.h>
#include "types.h"
#include "version.h"

namespace kiwisolver
{

std::recursive_mutex global_lock;

}

namespace
{


bool ready_types()
{
    using namespace kiwisolver;
    if( !Variable::Ready() )
    {
        return false;
    }
    if( !Term::Ready() )
    {
        return false;
    }
    if( !Expression::Ready() )
    {
        return false;
    }
    if( !Constraint::Ready() )
    {
        return false;
    }
    if( !strength::Ready() )
    {
        return false;
    }
    if( !Solver::Ready() )
    {
        return false;
    }
    return true;
}

bool add_objects( PyObject* mod )
{
	using namespace kiwisolver;

    cppy::ptr kiwiversion( PyUnicode_FromString( KIWI_VERSION ) );
    if( !kiwiversion )
    {
        return false;
    }
    cppy::ptr pyversion( PyUnicode_FromString( PY_KIWI_VERSION ) );
    if( !pyversion )
    {
        return false;
    }
    cppy::ptr pystrength( PyType_GenericNew( strength::TypeObject, 0, 0 ) );
    if( !pystrength )
    {
        return false;
    }

    if( PyModule_AddObjectRef( mod, "__version__", pyversion.get() ) < 0 )
    {
		return false;
	}

    if( PyModule_AddObjectRef( mod, "__kiwi_version__", kiwiversion.get() ) < 0 )
    {
		return false;
	}

    if( PyModule_AddObjectRef( mod, "strength", pystrength.get() ) < 0 )
    {
		return false;
	}

    // Variable
    cppy::ptr var( pyobject_cast( Variable::TypeObject ) );
	if( PyModule_AddObjectRef( mod, "Variable", var.get() ) < 0 )
	{
		return false;
	}

    // Term
    cppy::ptr term( pyobject_cast( Term::TypeObject ) );
	if( PyModule_AddObjectRef( mod, "Term", term.get() ) < 0 )
	{
		return false;
	}

    // Expression
    cppy::ptr expr( pyobject_cast( Expression::TypeObject ) );
	if( PyModule_AddObjectRef( mod, "Expression", expr.get() ) < 0 )
	{
		return false;
	}

    // Constraint
    cppy::ptr cons( pyobject_cast( Constraint::TypeObject ) );
	if( PyModule_AddObjectRef( mod, "Constraint", cons.get() ) < 0 )
	{
		return false;
	}

    cppy::ptr solver( pyobject_cast( Solver::TypeObject ) );
	if( PyModule_AddObjectRef( mod, "Solver", solver.get() ) < 0 )
	{
		return false;
	}

    if( PyModule_AddObjectRef( mod, "DuplicateConstraint", DuplicateConstraint ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "UnsatisfiableConstraint", UnsatisfiableConstraint ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "UnknownConstraint", UnknownConstraint ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "DuplicateEditVariable", DuplicateEditVariable ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "UnknownEditVariable", UnknownEditVariable ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "DuplicateStay", DuplicateStay ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "UnknownStay", UnknownStay ) < 0 )
    {
        return false;
    }
    if( PyModule_AddObjectRef( mod, "BadRequiredStrength", BadRequiredStrength ) < 0 )
    {
        return false;
    }

	return true;
}


int
kiwi_modexec( PyObject *mod )
{
    if( !ready_types() )
    {
        return -1;
    }
    if( !kiwisolver::init_exceptions() )
    {
        return -1;
    }
    if( !add_objects( mod ) )
    {
        return -1;
    }


    return 0;
}


static PyMethodDef
kiwisolver_methods[] = {
    { 0 } // Sentinel
};


PyModuleDef_Slot kiwisolver_slots[] = {
    {Py_mod_exec, reinterpret_cast<void*>( kiwi_modexec ) },
#ifdef Py_GIL_DISABLED
    {Py_mod_gil, Py_MOD_GIL_NOT_USED},
#endif
    {0, NULL}
};


struct PyModuleDef moduledef = {
        PyModuleDef_HEAD_INIT,
        "_cext",
        "kiwisolver extension module",
        0,
        kiwisolver_methods,
        kiwisolver_slots,
        NULL,
        NULL,
        NULL
};

}  // namespace


PyMODINIT_FUNC PyInit__cext( void )
{
    return PyModuleDef_Init( &moduledef );
}
