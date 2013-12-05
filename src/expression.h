/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <vector>
#include "term.h"


namespace kiwi
{

class Expression
{

public:

	Expression( double constant=0.0 ) : m_constant( constant ) {}

	Expression( const Term& term, double constant=0.0 ) :
		m_terms( 1, term ), m_constant( constant ) {}

	Expression( const std::vector<Term>& terms, double constant=0.0 ) :
		m_terms( terms ), m_constant( constant ) {}

	~Expression() {}

	const std::vector<Term>& terms() const
	{
		return m_terms;
	}

	double constant() const
	{
		return m_constant;
	}

private:

	std::vector<Term> m_terms;
	double m_constant;
};

} // namespace kiwi
