/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include <map>
#include <utility>
#include <vector>
#include "shareddata.h"
#include "strength.h"


namespace constraint
{

enum Op
{
	LE,
	GE,
	EQ
};


class Variable
{

public:

	class Context
	{
	public:
		Context() {}
		virtual ~Context() {}
	};

	Variable( Context* context=0 ) : m_data( new VariableData( context ) ) {}

	~Variable() {}

	Context* context()
	{
		return m_data->m_context;
	}

	const Context* context() const
	{
		return m_data->m_context;
	}

	double value() const
	{
		return m_data->m_value;
	}

	void setValue( double value )
	{
		m_data->m_value = value;
	}

	bool operator<( const Variable& other ) const
	{
		return m_data < other.m_data;
	}

	bool operator==( const Variable& other ) const
	{
		return m_data == other.m_data;
	}

	bool operator!=( const Variable& other ) const
	{
		return m_data != other.m_data;
	}

private:

	class VariableData : public SharedData
	{

	public:

		VariableData( Context* context ) : SharedData(),
			m_context( context ), m_value( 0 ) {}

		~VariableData()
		{
			delete m_context;
		}

		Context* m_context;
		double m_value;

	private:

		VariableData( const VariableData& other );

		VariableData& operator=( const VariableData& other );
	};

	SharedDataPtr<VariableData> m_data;
};


class Term
{

public:

	Term( const Variable& variable, double coefficient=1.0 ) :
		m_variable( variable ), m_coefficient( coefficient ) {}

	// For efficient map -> vector copies
	Term( const std::pair<const Variable, double>& pair ) :
		m_variable( pair.first ), m_coefficient( pair.second ) {}

	~Term() {}

	const Variable& variable() const
	{
		return m_variable;
	}

	double coefficient() const
	{
		return m_coefficient;
	}

private:

	Variable m_variable;
	double m_coefficient;
};


class Expression
{

public:

	Expression( double constant=0.0 ) : m_constant( constant ) {}

	Expression( const Term& term, double constant=0.0 ) :
		m_terms( 1, term ), m_constant( constant ) {}

	Expression( const Term& first, const Term& second, double constant=0.0 ) :
		m_constant( constant )
	{
		m_terms.push_back( first );
		m_terms.push_back( second );
	}

	Expression( const std::vector<Term>& terms, double constant=0.0 ) :
		m_terms( terms ), m_constant( constant ) {}

	Expression( const std::vector<Term>& terms, const Term& term,
		double constant=0.0 ) : m_terms( terms ), m_constant( constant )
	{
		m_terms.push_back( term );
	}

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


class Constraint
{

public:

	template<typename T, typename U>
	Constraint( const T& lhs, Op op, const U& rhs,
				double strength = ::strength::required() ) :
		m_data( new SharedData( lhs , op, rhs, strength ) ) {}

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

	bool operator<( const Variable& other ) const
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

	Expression reduce( const Expression& expression )
	{
		std::map<Variable, double> vars;
		std::vector<Term>::const_iterator iter_t;
		iter_t begin = expression.terms().begin();
		iter_t end = expression.terms().end();
		for( iter_t it = begin; it != end; ++it )
			vars[ it->variable() ] += it->coefficient();
		std::vector<Term> terms( vars.begin(), vars.end() );
		return Expression( terms, expression.constant() );
	}

	Expression reduce( const Term& term )
	{
		return Expression( term );
	}

	Expression reduce( const Variable& variable )
	{
		return Expression( Term( variable ) );
	}

	Expression reduce( double constant )
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
			m_strength( strength ),
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


// Symbolic operators

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


inline operator-( const Expression& first, const Expression& second )
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
	return expressioin + term;
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

} // namespace constraint
