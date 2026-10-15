/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include "constraint.h"
#include "debug.h"
#include "solverimpl.h"
#include "variable.h"


namespace kiwi
{

class Solver
{

public:

	Solver() = default;

	~Solver() = default;

	/* Add a constraint to the solver.

	Throws
	------
	DuplicateConstraint
		The given constraint has already been added to the solver.

	UnsatisfiableConstraint
		The given constraint is required and cannot be satisfied.

	*/
	void addConstraint( const Constraint& constraint )
	{
		m_impl.addConstraint( constraint );
	}

	/* Remove a constraint from the solver.

	Throws
	------
	UnknownConstraint
		The given constraint has not been added to the solver.

	*/
	void removeConstraint( const Constraint& constraint )
	{
		m_impl.removeConstraint( constraint );
	}

	/* Test whether a constraint has been added to the solver.

	*/
	bool hasConstraint( const Constraint& constraint ) const
	{
		return m_impl.hasConstraint( constraint );
	}

	/* Add an edit variable to the solver.

	This method should be called before the `suggestValue` method is
	used to supply a suggested value for the given edit variable.

	Throws
	------
	DuplicateEditVariable
		The given edit variable has already been added to the solver.

	BadRequiredStrength
		The given strength is >= required.

	*/
	void addEditVariable( const Variable& variable, double strength )
	{
		m_impl.addEditVariable( variable, strength );
	}

	/* Remove an edit variable from the solver.

	Throws
	------
	UnknownEditVariable
		The given edit variable has not been added to the solver.

	*/
	void removeEditVariable( const Variable& variable )
	{
		m_impl.removeEditVariable( variable );
	}

	/* Test whether an edit variable has been added to the solver.

	*/
	bool hasEditVariable( const Variable& variable ) const
	{
		return m_impl.hasEditVariable( variable );
	}

	/* Suggest a value for the given edit variable.

	This method should be used after an edit variable as been added to
	the solver in order to suggest the value for that variable. After
	all suggestions have been made, the `solve` method can be used to
	update the values of all variables.

	Throws
	------
	UnknownEditVariable
		The given edit variable has not been added to the solver.

	*/
	void suggestValue( const Variable& variable, double value )
	{
		m_impl.suggestValue( variable, value );
	}

	/* Add a stay to the solver.

	A stay is a non-required constraint which holds a variable at its
	current value. It first holds the variable at its value when the
	stay is added. Before each suggested value and each removal of a
	constraint, every stay is moved to the value its variable has in
	the current solution, so that a variable not pushed elsewhere
	stays where it is.

	Throws
	------
	DuplicateStay
		The given variable already has a stay in the solver.

	BadRequiredStrength
		The given strength is >= required.

	*/
	void addStay( const Variable& variable, double strength )
	{
		m_impl.addStay( variable, strength );
	}

	/* Remove a stay from the solver.

	Throws
	------
	UnknownStay
		The given variable has no stay in the solver.

	*/
	void removeStay( const Variable& variable )
	{
		m_impl.removeStay( variable );
	}

	/* Test whether a variable has a stay in the solver.

	*/
	bool hasStay( const Variable& variable ) const
	{
		return m_impl.hasStay( variable );
	}

	/* Update the values of the external solver variables.

	*/
	void updateVariables()
	{
		m_impl.updateVariables();
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

	/* Dump a representation of the solver internals to stdout.

	*/
	void dump()
	{
		debug::dump( m_impl );
	}

	/* Dump a representation of the solver internals to a stream.

	*/
	void dump( std::ostream& out )
	{
		debug::dump( m_impl, out );
	}

	/* Dump a representation of the solver internals to a string.

	*/
	std::string dumps()
	{
		return debug::dumps( m_impl );
	}

private:

	Solver( const Solver& );

	Solver& operator=( const Solver& );

	impl::SolverImpl m_impl;
};

} // namespace kiwi
