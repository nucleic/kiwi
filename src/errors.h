/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <exception>
#include "constraint.h"


namespace kiwi
{

class UnsatisfiableConstraint : public std::exception
{

public:

	UnsatisfiableConstraint( const Constraint& constraint ) :
		m_constraint( constraint ) {}

	~UnsatisfiableConstraint() {}

	const char* what() const
	{
		return "The required constraint can not be satisfied.";
	}

	const Constraint& constraint() const
	{
		return m_constraint;
	}

private:

	Constraint m_constraint;
};


class UnboundedObjective : public std::exception
{

public:

	UnboundedObjective() {}

	~UnboundedObjective() {}

	const char* what() const
	{
		return "The objective function is unbounded.";
	}
};

} // namespace kiwi
