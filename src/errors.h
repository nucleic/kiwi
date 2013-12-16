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
#include "variable.h"


namespace kiwi
{

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


class UnknownConstraint : public std::exception
{

public:

	UnknownConstraint( const Constraint& constraint ) :
		m_constraint( constraint ) {}

	~UnknownConstraint() {}

	const char* what() const
	{
		return "The specified constraint has not been added to the solver.";
	}

	const Constraint& constraint() const
	{
		return m_constraint;
	}

private:

	Constraint m_constraint;
};


class DuplicateConstraint : public std::exception
{

public:

	DuplicateConstraint( const Constraint& constraint ) :
		m_constraint( constraint ) {}

	~DuplicateConstraint() {}

	const char* what() const
	{
		return "The specified constraint has already been added to the solver.";
	}

	const Constraint& constraint() const
	{
		return m_constraint;
	}

private:

	Constraint m_constraint;
};


class UnknownEditVariable : public std::exception
{

public:

	UnknownEditVariable( const Variable& variable ) :
		m_variable( variable ) {}

	~UnknownEditVariable() {}

	const char* what() const
	{
		return "The specified variable has not been added to the solver.";
	}

	const Variable& variable() const
	{
		return m_variable;
	}

private:

	Variable m_variable;
};


class DuplicateEditVariable : public std::exception
{

public:

	DuplicateEditVariable( const Variable& variable ) :
		m_variable( variable ) {}

	~DuplicateEditVariable() {}

	const char* what() const
	{
		return "The specified variable has already been added to the solver.";
	}

	const Variable& variable() const
	{
		return m_variable;
	}

private:

	Variable m_variable;
};


class BadRequiredStrength : public std::exception
{

public:

	BadRequiredStrength() {}

	~BadRequiredStrength() {}

	const char* what() const
	{
		return "The 'required' strength cannot be used in this context.";
	}
};

} // namespace kiwi
