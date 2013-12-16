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

	/* Add a constraint to the solver.

	An UnsatisfiableConstraint exception will be thrown if the given
	constraint cannot be satisfied. A DuplicateConstraint exception will
	be thrown if the constraint has already been added to the solver.

	*/
	void addConstraint( const Constraint& constraint )
	{
		return m_impl.addConstraint( constraint );
	}

	/* Remove a constraint from the solver.

	An UnknownConstraint exception will be thrown if the constraint has
	not been added to the solver.

	*/
	void removeConstraint( const Constraint& constraint )
	{
		return m_impl.removeConstraint( constraint );
	}

	/* Add an edit variable to the solver.

	This method must be called before the `suggestValue` method is used
	to supply a suggested value for the variable. The given strength must
	be less than strength::required or a BadRequiredStrength exception
	will be thrown. A DuplicateEditVariable exception will be thrown if
	the edit variable has already been added to the solver.

	*/
	void addEditVariable( const Variable& variable, double strength )
	{
		return m_impl.addEditVariable( variable );
	}

	/* Remove an edit variable from the solver.

	An UnknownEditVariable exception will be thrown if the edit variable
	has not been added to the solver.

	*/
	void removeEditVariable( const Variable& variable )
	{
		return m_impl.removeEditVariable( variable );
	}

	/* Suggest a value for the given edit variable.

	An UnknownEditVariable exception will be thrown if the edit variable
	has not been added to the solver.

	*/
	void suggestValue( const Variable& variable, double value )
	{
		return m_impl.suggestValue( variable, value, strength );
	}

	/* Solve the system for the current set of constraints.

	The will resolve the system and update the values of the variables
	according to the current constraints and suggested values. If the
	current constraints result in an unbounded object function, an
	UnboundedObjective exception will be thrown.

	TODO: is it even possible to acheive an unbounded objective?

	*/
	void solve()
	{
		return m_impl.solve();
	}

	/* Reset the solver to the empty starting condition.

	This method resets the internal solver state to the empty starting
	condition, as if no constraints or edit variables have been added.
	This can be faster than deleting the solver and creating a new one
	when the entire system must change, since it can avoid unecessary
	heap (de)allocations.

	*/
	void reset()
	{
		m_impl.reset();
	}

	void dump()
	{
		m_impl.dump();
	}

private:

	Solver( const Solver& );

	Solver& operator=( const Solver& );

	impl::SolverImpl m_impl;
};

} // namespace kiwi
