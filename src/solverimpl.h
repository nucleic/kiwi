/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include "constraint.h"
#include "solverimpl.h"
#include "strength.h"
#include "variable.h"


namespace kiwi
{

class SolverImpl
{

private:

	enum VarType
	{
		UserVar,
		SlackVar,
		ErrorVar
	};

	struct Cell
	{
		VarType type;
		double coeff;
	};

	struct Row
	{
		std::vector<Cell> cells;
		double constant;
	};

	friend class Solver;

	SolverImpl() {}

	~SolverImpl() {}

	bool addConstraint( const Constraint& constraint )
	{

	}

	bool removeConstraint( const Constraint& constraint )
	{

	}

	bool solve()
	{

	}

	void beginEdit()
	{

	}

	void endEdit()
	{

	}

	bool suggestValue( const Variable& variable, double value, double strength )
	{

	}

};

} // namespace kiwi
