/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include "constraint.h"
#include "strength.h"
#include "variable.h"


namespace kiwi
{

class Solver
{

public:

	Solver() {}

	~Solver() {}

	bool addConstraint( const Constraint& constraint );

	bool removeConstraint( const Constraint& constraint );

	bool solve();

	void beginEdit();

	void endEdit();

	bool suggestValue( const Variable& variable,
					   double value,
					   double strength=strength::strong() );

private:

};


class SolverEditGuard
{

public:

	SolverEditGuard( Solver& solver ) : m_solver( solver )
	{
		m_solver.beginEdit();
	}

	~SolverEditGuard()
	{
		m_solver.endEdit();
	}

private:

	Solver& m_solver;
};


inline
bool Solver::addConstraint( const Constraint& constraint )
{

}


inline
bool Solver::removeConstraint( const Constraint& constraint )
{

}


inline
bool Solver::solve()
{

}


inline
void Solver::beginEdit()
{

}


inline
void Solver::endEdit()
{

}


inline
bool Solver::suggestValue( const Variable& variable,
						   double value,
						   double strength )
{

}


} // namespace kiwi
