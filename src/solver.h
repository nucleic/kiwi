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

class Solver
{

public:

	Solver() {}

	~Solver() {}

	bool addConstraint( const Constraint& constraint )
	{
		return m_impl.addConstraint( constraint );
	}

	bool removeConstraint( const Constraint& constraint )
	{
		return m_impl.removeConstraint( constraint );
	}

	bool solve()
	{
		return m_impl.solve();
	}

	void beginEdit()
	{
		m_impl.beginEdit();
	}

	void endEdit()
	{
		m_impl.endEdit();
	}

	bool suggestValue( const Variable& variable,
					   double value,
					   double strength=strength::strong )
	{
		return m_impl.suggestValue( variable, value, strength );
	}

private:

	priv::SolverImpl m_impl;
};

} // namespace kiwi
