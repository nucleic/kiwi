/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include "expression.h"


namespace kiwi
{

enum RelationalOperator { OP_LE, OP_GE, OP_EQ };


class Relation
{

public:

	Relation( const Expression& lhs,
			  const Expression& rhs,
			  RelationalOperator op ) :
		m_lhs( lhs ), m_rhs( rhs ), m_op( op ) {}

	~Relation() {}

	const Expression& lhs() const
	{
		return m_lhs;
	}

	const Expression& rhs() const
	{
		return m_rhs;
	}

	RelationalOperator op() const
	{
		return m_op;
	}

private:

	Expression m_lhs;
	Expression m_rhs;
	RelationalOperator m_op;
};

} // namespace kiwi
