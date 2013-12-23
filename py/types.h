/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <Python.h>
#include <kiwi/kiwi.h>


int import_variable();

int import_term();

int import_expression();

int import_constraint();


extern PyTypeObject Variable_Type;

extern PyTypeObject Term_Type;

extern PyTypeObject Expression_Type;

extern PyTypeObject Constraint_Type;


struct Variable
{
	PyObject_HEAD
	PyObject* context;
	kiwi::Variable variable;

	static bool TypeCheck( PyObject* obj )
	{
		return PyObject_TypeCheck( obj, &Variable_Type ) != 0;
	}
};


struct Term
{
	PyObject_HEAD
	PyObject* variable;
	double coefficient;

	static bool TypeCheck( PyObject* obj )
	{
		return PyObject_TypeCheck( obj, &Term_Type ) != 0;
	}
};


struct Expression
{
	PyObject_HEAD
	PyObject* terms;
	double constant;

	static bool TypeCheck( PyObject* obj )
	{
		return PyObject_TypeCheck( obj, &Expression_Type ) != 0;
	}
};


struct Constraint
{
	PyObject_HEAD
	PyObject* lhs;
	PyObject* rhs;
	kiwi::Constraint constraint;

	static bool TypeCheck( PyObject* obj )
	{
		return PyObject_TypeCheck( obj, &Constraint_Type ) != 0;
	}
};
