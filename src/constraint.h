/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include <map>
#include <vector>
#include "expression.h"
#include "shareddata.h"
#include "strength.h"
#include "term.h"
#include "variable.h"


namespace kiwi
{

enum Op { LE, GE, EQ };


class Constraint
{

public:

	template<typename T, typename U>
	Constraint( const T& lhs,
				Op op,
				const U& rhs,
				double strength = strength::required() ) :
		m_data( new ConstraintData( lhs , op, rhs, strength ) ) {}

	~Constraint() {}

	const Expression& lhs() const
	{
		return m_data->m_lhs;
	}

	const Expression& rhs() const
	{
		return m_data->m_rhs;
	}

	double strength() const
	{
		return m_data->m_strength;
	}

	Op op() const
	{
		return m_data->m_op;
	}

	bool operator<( const Constraint& other ) const
	{
		return m_data < other.m_data;
	}

	bool operator==( const Constraint& other ) const
	{
		return m_data == other.m_data;
	}

	bool operator!=( const Constraint& other ) const
	{
		return m_data != other.m_data;
	}

private:

	static Expression reduce( const Expression& expression )
	{
		std::map<Variable, double> vars;
		typedef std::vector<Term>::const_iterator iter_t;
		iter_t begin = expression.terms().begin();
		iter_t end = expression.terms().end();
		for( iter_t it = begin; it != end; ++it )
			vars[ it->variable() ] += it->coefficient();
		std::vector<Term> terms( vars.begin(), vars.end() );
		return Expression( terms, expression.constant() );
	}

	static Expression reduce( const Term& term )
	{
		return Expression( term );
	}

	static Expression reduce( const Variable& variable )
	{
		return Expression( Term( variable ) );
	}

	static Expression reduce( double constant )
	{
		return Expression( constant );
	}

	class ConstraintData : public SharedData
	{

	public:

		template<typename T, typename U>
		ConstraintData( const T& lhs, Op op, const U& rhs, double strength ) :
			SharedData(),
			m_lhs( reduce( lhs ) ),
			m_rhs( reduce( rhs ) ),
			m_strength( strength::clip( strength ) ),
			m_op( op ) {}

		~ConstraintData() {}

		Expression m_lhs;
		Expression m_rhs;
		double m_strength;
		Op m_op;

	private:

		ConstraintData( const ConstraintData& other );

		ConstraintData& operator=( const ConstraintData& other );
	};

	SharedDataPtr<ConstraintData> m_data;
};

} // namespace kiwi
