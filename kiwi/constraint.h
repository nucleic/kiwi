/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <map>
#include <vector>
#include "expression.h"
#include "relation.h"
#include "shareddata.h"
#include "strength.h"
#include "term.h"
#include "variable.h"


namespace kiwi
{

class Constraint
{

public:

	Constraint() : m_data( 0 ) {}

	Constraint( const Relation& relation,
				double strength = strength::required ) :
		m_data( new ConstraintData( relation, strength ) ) {}

	Constraint( const Expression& expression,
				RelationalOperator op,
				double strength = strength::required ) :
		m_data( new ConstraintData( expression, op, strength ) ) {}

	~Constraint() {}

	const Expression& expression() const
	{
		return m_data->m_expression;
	}

	RelationalOperator op() const
	{
		return m_data->m_op;
	}

	double strength() const
	{
		return m_data->m_strength;
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

	bool operator!() const
	{
		return !m_data;
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

	static Expression reduce( const Relation& relation )
	{
		std::map<Variable, double> vars;
		typedef std::vector<Term>::const_iterator iter_t;
		iter_t begin = relation.lhs().terms().begin();
		iter_t end = relation.lhs().terms().end();
		for( iter_t it = begin; it != end; ++it )
			vars[ it->variable() ] += it->coefficient();
		begin = relation.rhs().terms().begin();
		end = relation.rhs().terms().end();
		for( iter_t it = begin; it != end; ++it )
			vars[ it->variable() ] -= it->coefficient();
		std::vector<Term> terms( vars.begin(), vars.end() );
		double c = relation.lhs().constant() - relation.rhs().constant();
		return Expression( terms, c );
	}

	class ConstraintData : public SharedData
	{

	public:

		ConstraintData( const Relation& relation, double strength ) :
			SharedData(),
			m_expression( reduce( relation ) ),
			m_strength( strength::clip( strength ) ),
			m_op( relation.op() ) {}

		ConstraintData( const Expression& expression,
					    RelationalOperator op,
					    double strength ) :
			SharedData(),
			m_expression( reduce( expression ) ),
			m_strength( strength::clip( strength ) ),
			m_op( op ) {}

		~ConstraintData() {}

		Expression m_expression;
		double m_strength;
		RelationalOperator m_op;

	private:

		ConstraintData( const ConstraintData& other );

		ConstraintData& operator=( const ConstraintData& other );
	};

	SharedDataPtr<ConstraintData> m_data;
};

} // namespace kiwi
