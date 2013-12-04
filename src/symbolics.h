/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include <vector>
#include "expression.h"
#include "term.h"
#include "variable.h"


namespace kiwi
{

inline
Term operator*( const Variable& variable, double coefficient )
{
	return Term( variable, coefficient );
}


inline
Term operator*( double coefficient, const Variable& variable )
{
	return variable * coefficient;
}


inline
Term operator-( const Variable& variable )
{
	return variable * -1.0;
}


inline
Term operator*( const Term& term, double coefficient )
{
	return Term( term.variable(), term.coefficient() * coefficient );
}


inline
Term operator*( double coefficient, const Term& term )
{
	return term * coefficient;
}


inline
Term operator-( const Term& term )
{
	return term * -1.0;
}


inline
Expression operator*( const Expression& expression, double coefficient )
{
	std::vector<Term> terms;
	typedef std::vector<Term>::const_iterator iter_t;
	iter_t begin = expression.terms().begin();
	iter_t end = expression.terms().end();
	for( iter_t it = begin; it != end; ++it )
		terms.push_back( ( *it ) * coefficient );
	return Expression( terms, expression.constant() * coefficient );
}


inline
Expression operator*( double coefficient, const Expression& expression )
{
	return expression * coefficient;
}


inline
Expression operator-( const Expression& expression )
{
	return expression * -1.0;
}


inline
Expression operator+( const Expression& first, const Expression& second )
{
	std::vector<Term> terms( first.terms() );
	terms.insert( terms.end(), second.terms().begin(), second.terms().end() );
	return Expression( terms, first.constant() + second.constant() );
}


inline
Expression operator+( const Expression& first, const Term& second )
{
	return Expression( first.terms(), second, first.constant() );
}


inline
Expression operator+( const Expression& expression, const Variable& variable )
{
	return expression + Term( variable );
}


inline
Expression operator+( const Expression& expression, double constant )
{
	return Expression( expression.terms(), expression.constant() + constant );
}


inline
Expression operator+( double constant, const Expression& expression )
{
	return expression + constant;
}


inline
Expression operator-( const Expression& first, const Expression& second )
{
	return first + -second;
}


inline
Expression operator-( const Expression& expression, const Term& term )
{
	return expression + -term;
}


inline
Expression operator-( const Expression& expression, const Variable& variable )
{
	return expression + -variable;
}


inline
Expression operator-( const Expression& expression, double constant )
{
	return expression + -constant;
}


inline
Expression operator-( double constant, const Expression& expression )
{
	return -expression + constant;
}


inline
Expression operator/( const Expression& expression, double denominator )
{
	return expression * ( 1.0 / denominator );
}


inline
Expression operator+( const Term& term, const Expression& expression )
{
	return expression + term;
}


inline
Expression operator+( const Term& first, const Term& second )
{
	return Expression( first, second );
}


inline
Expression operator+( const Term& term, const Variable& variable )
{
	return term + Term( variable );
}


inline
Expression operator+( const Term& term, double constant )
{
	return Expression( term, constant );
}


inline
Expression operator+( double constant, const Term& term )
{
	return term + constant;
}


inline
Expression operator-( const Term& term, const Expression& expression )
{
	return -expression + term;
}


inline
Expression operator-( const Term& first, const Term& second )
{
	return first + -second;
}


inline
Expression operator-( const Term& term, const Variable& variable )
{
	return term + -variable;
}


inline
Expression operator-( const Term& term, double constant )
{
	return term + -constant;
}


inline
Expression operator-( double constant, const Term& term )
{
	return -term + constant;
}


inline
Term operator/( const Term& term, double denominator )
{
	return term * ( 1.0 / denominator );
}


inline
Expression operator+( const Variable& variable, const Expression& expression )
{
	return expression + variable;
}


inline
Expression operator+( const Variable& variable, const Term& term )
{
	return term + variable;
}


inline
Expression operator+( const Variable& first, const Variable& second )
{
	return Term( first ) + second;
}


inline
Expression operator+( const Variable& variable, double constant )
{
	return Term( variable ) + constant;
}


inline
Expression operator+( double constant, const Variable& variable )
{
	return variable + constant;
}


inline
Expression operator-( const Variable& variable, const Expression& expression )
{
	return variable + -expression;
}


inline
Expression operator-( const Variable& variable, const Term& term )
{
	return variable + -term;
}


inline
Expression operator-( const Variable& first, const Variable& second )
{
	return first + -second;
}


inline
Expression operator-( const Variable& variable, double constant )
{
	return variable + -constant;
}


inline
Expression operator-( double constant, const Variable& variable )
{
	return -variable + constant;
}


inline
Term operator/( const Variable& variable, double denominator )
{
	return variable * ( 1.0 / denominator );
}

} // namespace kiwi
