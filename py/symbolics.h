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
#include "expression.h"
#include "term.h"
#include "variable.h"


template<typename Op, typename T>
struct UnaryInvoke
{
	PyObject* operator()( PyObject* value )
	{
		return Op()( reinterpret_cast<T*>( value ) );
	}
};


template<typename Op, typename T>
struct BinaryInvoke
{
	PyObject* operator()( PyObject* first, PyObject* second )
	{
		if( T::TypeCheck( first ) )
			return invoke<Normal>( reinterpret_cast<T*>( first ), second );
		return invoke<Reverse>( reinterpret_cast<T*>( second ), first );
	}

	struct Normal
	{
		template<typename U>
		PyObject* operator()( T* primary, U secondary )
		{
			return Op()( primary, secondary );
		}
	};

	struct Reverse
	{
		template<typename U>
		PyObject* operator()( T* primary, U secondary )
		{
			return Op()( secondary, primary );
		}
	};

	template<typename Invk>
	PyObject* invoke( T* primary, PyObject* secondary )
	{
		if( Expression::TypeCheck( secondary ) )
			return Invk()( primary, reinterpret_cast<Expression*>( secondary ) );
		if( Term::TypeCheck( secondary ) )
			return Invk()( primary, reinterpret_cast<Term*>( secondary ) );
		if( Variable::TypeCheck( secondary ) )
			return Invk()( primary, reinterpret_cast<Variable*>( secondary ) );
		if( PyFloat_Check( secondary ) )
			return Invk()( primary, PyFloat_AS_DOUBLE( secondary ) );
		if( PyInt_Check( secondary ) )
			return Invk()( primary, double( PyInt_AS_LONG( secondary ) ) );
		if( PyLong_Check( secondary ) )
		{
			double v = PyLong_AsDouble( secondary );
			if( v == -1 && PyErr_Occurred() )
				return 0;
			return Invk()( primary, v );
		}
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct BinaryAdd
{
	template<typename T, typename U>
	PyObject* operator()( T first, U second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct BinarySub
{
	template<typename T, typename U>
	PyObject* operator()( T first, U second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


struct BinaryMul
{
	template<typename T, typename U>
	PyObject* operator()( T first, U second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


template<> inline
PyObject* BinaryMul::operator()( Variable* first, double second )
{
	PyObject* pyterm = PyType_GenericNew( &Term_Type, 0, 0 );
	if( !pyterm )
		return 0;
	Term* term = reinterpret_cast<Term*>( pyterm );
	term->variable = PythonHelpers::newref( pyobject_cast( first ) );
	term->coefficient = second;
	return pyterm;
}


template<> inline
PyObject* BinaryMul::operator()( Term* first, double second )
{
	PyObject* pyterm = PyType_GenericNew( &Term_Type, 0, 0 );
	if( !pyterm )
		return 0;
	Term* term = reinterpret_cast<Term*>( pyterm );
	term->variable = PythonHelpers::newref( first->variable );
	term->coefficient = first->coefficient * second;
	return pyterm;
}


template<> inline
PyObject* BinaryMul::operator()( Expression* first, double second )
{
	using namespace PythonHelpers;
	PyObjectPtr pyexpr( PyType_GenericNew( &Expression_Type, 0, 0 ) );
	if( !pyexpr )
		return 0;
	Expression* expr = reinterpret_cast<Expression*>( pyexpr.get() );
	PyObjectPtr terms( PyTuple_New( PyTuple_GET_SIZE( first->terms ) ) );
	if( !terms )
		return 0;
	Py_ssize_t end = PyTuple_GET_SIZE( first->terms );
	for( Py_ssize_t i = 0; i < end; ++i )  // memset 0 for safe error return
		PyTuple_SET_ITEM( terms.get(), i, 0 );
	for( Py_ssize_t i = 0; i < end; ++i )
	{
		PyObject* item = PyTuple_GET_ITEM( first->terms, i );
		PyObject* term = BinaryMul()( reinterpret_cast<Term*>( item ), second );
		if( !term )
			return 0;
		PyTuple_SET_ITEM( terms.get(), i, term );
	}
	expr->terms = terms.release();
	expr->constant = first->constant * second;
	return pyexpr.release();
}


template<> inline
PyObject* BinaryMul::operator()( double first, Variable* second )
{
	return operator()( second, first );
}


template<> inline
PyObject* BinaryMul::operator()( double first, Term* second )
{
	return operator()( second, first );
}


template<> inline
PyObject* BinaryMul::operator()( double first, Expression* second )
{
	return operator()( second, first );
}


struct BinaryDiv
{
	template<typename T, typename U>
	PyObject* operator()( T first, U second )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


template<> inline
PyObject* BinaryDiv::operator()( Variable* first, double second )
{
	if( second == 0.0 )
	{
		PyErr_SetString( PyExc_ZeroDivisionError, "float division by zero" );
		return 0;
	}
	return BinaryMul()( first, 1.0 / second );
}


template<> inline
PyObject* BinaryDiv::operator()( Term* first, double second )
{
	if( second == 0.0 )
	{
		PyErr_SetString( PyExc_ZeroDivisionError, "float division by zero" );
		return 0;
	}
	return BinaryMul()( first, 1.0 / second );
}


template<> inline
PyObject* BinaryDiv::operator()( Expression* first, double second )
{
	if( second == 0.0 )
	{
		PyErr_SetString( PyExc_ZeroDivisionError, "float division by zero" );
		return 0;
	}
	return BinaryMul()( first, 1.0 / second );
}


struct UnaryNeg
{
	template<typename T>
	PyObject* operator()( T value )
	{
		Py_RETURN_NOTIMPLEMENTED;
	}
};


template<> inline
PyObject* UnaryNeg::operator()( Variable* value )
{
	return BinaryMul()( value, -1.0 );
}


template<> inline
PyObject* UnaryNeg::operator()( Term* value )
{
	return BinaryMul()( value, -1.0 );
}


template<> inline
PyObject* UnaryNeg::operator()( Expression* value )
{
	return BinaryMul()( value, -1.0 );
}
