/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#include <kiwi/kiwi.h>
#include "pythonhelpers.h"


using namespace PythonHelpers;


typedef struct {
    PyObject_HEAD
    kiwi::Variable variable;
} Variable;


namespace
{

class PyContext : public kiwi::Variable::Context
{
public:
	PyContext( PyObject* obj ) : m_ptr( newref( obj ) ) {}
	~PyContext() {}
	PyObjectPtr m_ptr;
};

} // namespace


static PyObject*
Variable_new( PyTypeObject* type, PyObject* args, PyObject* kwargs )
{
	static char *kwlist[] = { "name", "context", 0 };
	PyObject* name;
	PyObject* context = 0;
	if( !PyArg_ParseTupleAndKeywords(
		args, kwargs, "S|O:__new__", kwlist, &name, &context ) )
		return 0;
    PyObject* pyvar = PyType_GenericNew( type, args, kwargs );
    if( !pyvar )
    	return 0;
    Variable* var = reinterpret_cast<Variable*>( pyvar );
    const char* cname = PyString_AS_STRING( name );
    if( context )
    {
    	PyContext* ctxt = new PyContext( context );
    	new( &var->variable ) kiwi::Variable( cname, ctxt );
    }
    else
    {
    	new( &var->variable ) kiwi::Variable( cname );
    }
    return pyvar;
}


static void
Variable_clear( Variable* self )
{
    self->variable.setContext( 0 );
}


static int
Variable_traverse( Variable* self, visitproc visit, void* arg )
{
	kiwi::Variable::Context* ctxt = self->variable.context();
	if( ctxt )
	{
		PyContext* pyctxt = static_cast<PyContext*>( ctxt );
		PyObject* pyobj = pyctxt->m_ptr.get();
		Py_VISIT( pyobj );
	}
    return 0;
}


static void
Variable_dealloc( Variable* self )
{
    PyObject_GC_UnTrack( self );
    Variable_clear( self );
   	self->variable.~Variable();
    self->ob_type->tp_free( pyobject_cast( self ) );
}


static PyObject*
Variable_name( Variable* self )
{
    return PyString_FromString( self->variable.name().c_str() );
}


static PyObject*
Variable_setName( Variable* self, PyObject* pystr )
{
	if( !PyString_Check( pystr ) )
		return py_expected_type_fail( pystr, "str" );
	self->variable.setName( PyString_AS_STRING( pystr ) );
	Py_RETURN_NONE;
}


static PyObject*
Variable_context( Variable* self )
{
	kiwi::Variable::Context* ctxt = self->variable.context();
	if( ctxt )
	{
		PyContext* pyctxt = static_cast<PyContext*>( ctxt );
		return pyctxt->m_ptr.newref();
	}
	Py_RETURN_NONE;
}


static PyObject*
Variable_setContext( Variable* self, PyObject* value )
{
	kiwi::Variable::Context* ctxt = self->variable.context();
	if( ctxt )
	{
		PyContext* pyctxt = static_cast<PyContext*>( ctxt );
		pyctxt->m_ptr = newref( value );
	}
	else
	{
		self->variable.setContext( new PyContext( value ) );
	}
	Py_RETURN_NONE;
}


static PyObject*
Variable_value( Variable* self )
{
    return PyFloat_FromDouble( self->variable.value() );
}


static PyObject*
Variable_richcompare( Variable* self, PyObject* other, int op )
{
	Py_RETURN_NOTIMPLEMENTED;
}


static PyMethodDef
Variable_methods[] = {
    { "name", ( PyCFunction )Variable_name, METH_NOARGS,
      "Get the name of the variable." },
    { "setName", ( PyCFunction )Variable_setName, METH_O,
      "Set the name of the variable." },
    { "context", ( PyCFunction )Variable_context, METH_NOARGS,
      "Get the context object associated with the variable." },
    { "setContext", ( PyCFunction )Variable_setContext, METH_O,
      "Set the context object associated with the variable." },
    { "value", ( PyCFunction )Variable_value, METH_NOARGS,
      "Get the current value of the variable." },
    { 0 } // sentinel
};


PyTypeObject Variable_Type = {
    PyObject_HEAD_INIT( 0 )
    0,                                      /* ob_size */
    "Variable",                             /* tp_name */
    sizeof( Variable ),                     /* tp_basicsize */
    0,                                      /* tp_itemsize */
    (destructor)Variable_dealloc,           /* tp_dealloc */
    (printfunc)0,                           /* tp_print */
    (getattrfunc)0,                         /* tp_getattr */
    (setattrfunc)0,                         /* tp_setattr */
    (cmpfunc)0,                             /* tp_compare */
    (reprfunc)0,                            /* tp_repr */
    (PyNumberMethods*)0,                    /* tp_as_number */
    (PySequenceMethods*)0,                  /* tp_as_sequence */
    (PyMappingMethods*)0,                   /* tp_as_mapping */
    (hashfunc)0,                            /* tp_hash */
    (ternaryfunc)0,                         /* tp_call */
    (reprfunc)0,                            /* tp_str */
    (getattrofunc)0,                        /* tp_getattro */
    (setattrofunc)0,                        /* tp_setattro */
    (PyBufferProcs*)0,                      /* tp_as_buffer */
    Py_TPFLAGS_DEFAULT|Py_TPFLAGS_HAVE_GC|Py_TPFLAGS_BASETYPE, /* tp_flags */
    0,                                      /* Documentation string */
    (traverseproc)Variable_traverse,        /* tp_traverse */
    (inquiry)Variable_clear,                /* tp_clear */
    (richcmpfunc)Variable_richcompare,      /* tp_richcompare */
    0,                                      /* tp_weaklistoffset */
    (getiterfunc)0,                         /* tp_iter */
    (iternextfunc)0,                        /* tp_iternext */
    (struct PyMethodDef*)Variable_methods,  /* tp_methods */
    (struct PyMemberDef*)0,                 /* tp_members */
    0,                                      /* tp_getset */
    0,                                      /* tp_base */
    0,                                      /* tp_dict */
    (descrgetfunc)0,                        /* tp_descr_get */
    (descrsetfunc)0,                        /* tp_descr_set */
    0,                                      /* tp_dictoffset */
    (initproc)0,                            /* tp_init */
    (allocfunc)PyType_GenericAlloc,         /* tp_alloc */
    (newfunc)Variable_new,                  /* tp_new */
    (freefunc)PyObject_GC_Del,              /* tp_free */
    (inquiry)0,                             /* tp_is_gc */
    0,                                      /* tp_bases */
    0,                                      /* tp_mro */
    0,                                      /* tp_cache */
    0,                                      /* tp_subclasses */
    0,                                      /* tp_weaklist */
    (destructor)0                           /* tp_del */
};


int
import_variable( void )
{
    if( PyType_Ready( &Variable_Type ) < 0 )
        return -1;
    return 0;
}


static PyMethodDef
variable_methods[] = {
    { 0 } // Sentinel
};


PyMODINIT_FUNC
initvariable( void )
{
    PyObject* mod = Py_InitModule( "variable", variable_methods );
    if( !mod )
        return;
    if( import_variable() < 0 )
        return;
    Py_INCREF( &Variable_Type );
    PyModule_AddObject( mod, "Variable", pyobject_cast( &Variable_Type ) );
}
