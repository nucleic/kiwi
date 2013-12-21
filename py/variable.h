/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <kiwi/kiwi.h>
#include "pythonhelpers.h"


extern PyTypeObject Variable_Type;


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


extern int import_variable();
