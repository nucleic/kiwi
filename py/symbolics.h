/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <algorithm>
#include "pythonhelpers.h"
#include "term.h"
#include "variable.h"


template<typename Op, typename T>
struct UnaryOp
{
	PyObject* operator()( PyObject* value )
	{
		return Op()( reinterpret_cast<T*>( value ) );
	}
};


template<typename Op, typename T>
struct BinaryOp
{
	PyObject* operator()( PyObject* first, PyObject* second )
	{
		if( T::TypeCheck( first ) )
		{
			if( Term::TypeCheck( second ) )
				return Op()( reinterpret_cast<T*>( first ), reinterpret_cast<Term*>( second ) );
			if( Variable::TypeCheck( second ) )
				return Op()( reinterpret_cast<T*>( first ), reinterpret_cast<Variable*>( second ) );
			if( PyFloat_Check( second ) )
				return Op()( reinterpret_cast<T*>( first ), PyFloat_AS_DOUBLE( second ) );
			if( PyInt_Check( second ) )
				return Op()( reinterpret_cast<T*>( first ), double( PyInt_AS_LONG( second ) ) );
			if( PyLong_Check( second ) )
			{
				double v = PyLong_AsDouble( second );
				if( v == -1 && PyErr_Occurred() )
					return 0;
				return Op()( reinterpret_cast<T*>( first ), v );
			}
		}
		else
		{
			if( Term::TypeCheck( first ) )
				return Op()( reinterpret_cast<Term*>( first ), reinterpret_cast<T*>( second ) );
			if( Variable::TypeCheck( first ) )
				return Op()( reinterpret_cast<Variable*>( first ), reinterpret_cast<T*>( second ) );
			if( PyFloat_Check( first ) )
				return Op()( PyFloat_AS_DOUBLE( first ), reinterpret_cast<T*>( second ) );
			if( PyInt_Check( first ) )
				return Op()( double( PyInt_AS_LONG( first ) ), reinterpret_cast<T*>( second ) );
			if( PyLong_Check( first ) )
			{
				double v = PyLong_AsDouble( first );
				if( v == -1 && PyErr_Occurred() )
					return 0;
				return Op()( v, reinterpret_cast<T*>( second ) );
			}
		}
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct BinaryAdd
{
	PyObject* operator()( Term* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Term* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Term* first, double second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, double second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( double first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( double first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};



struct BinarySub
{
	PyObject* operator()( Term* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Term* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Term* first, double second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, double second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( double first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( double first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct BinaryMul
{
	PyObject* operator()( Term* first, double second )
	{
		PyObject* pyterm = PyType_GenericNew( &Term_Type, 0, 0 );
		if( !pyterm )
			return 0;
		Term* term = reinterpret_cast<Term*>( pyterm );
		term->variable = PythonHelpers::newref( first->variable );
		term->coefficient = first->coefficient * second;
		return pyterm;
	}

	PyObject* operator()( Variable* first, double second )
	{
		PyObject* pyterm = PyType_GenericNew( &Term_Type, 0, 0 );
		if( !pyterm )
			return 0;
		Term* term = reinterpret_cast<Term*>( pyterm );
		term->variable = PythonHelpers::newref( pyobject_cast( first ) );
		term->coefficient = second;
		return pyterm;
	}

	PyObject* operator()( double first, Term* second )
	{
		return operator()( second, first );
	}

	PyObject* operator()( double first, Variable* second )
	{
		return operator()( second, first );
	}

	PyObject* operator()( Term* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Term* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct BinaryDiv
{
	PyObject* operator()( Term* first, double second )
	{
		if( second == 0.0 )
		{
			PyErr_SetString( PyExc_ZeroDivisionError, "float division by zero" );
			return 0;
		}
		return BinaryMul()( first, 1.0 / second );
	}

	PyObject* operator()( Variable* first, double second )
	{
		if( second == 0.0 )
		{
			PyErr_SetString( PyExc_ZeroDivisionError, "float division by zero" );
			return 0;
		}
		return BinaryMul()( first, 1.0 / second );
	}

	PyObject* operator()( Term* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Term* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( Variable* first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( double first, Term* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}

	PyObject* operator()( double first, Variable* second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct UnaryNeg
{
	PyObject* operator()( Term* value )
	{
		return BinaryMul()( value, -1.0 );
	}

	PyObject* operator()( Variable* value )
	{
		return BinaryMul()( value, -1.0 );
	}
};
