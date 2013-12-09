/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <algorithm>
#include <map>
#include <vector>
#include "constraint.h"
#include "expression.h"
#include "relation.h"
#include "term.h"
#include "util.h"
#include "variable.h"


namespace kiwi
{

namespace priv
{

struct Symbol
{
	typedef unsigned long long Id;

	enum Type
	{
		Invalid,
		External,
		Slack,
		Artificial,
		Dummy
	};

	Symbol() : id( 0 ), type( Invalid ) {}

	Symbol( Type t, Id i ) : id( i ), type( t ) {}

	bool operator<( const Symbol& other ) const
	{
		return id < other.id;
	}

	Id id;
	Type type;
};


typedef std::map<Symbol, double> CellMap;


typedef std::map<Variable, Symbol> VarMap;


struct RowExpr
{
	RowExpr() : constant( 0.0 ) {}
	CellMap cells;
	double constant;
};


typedef std::map<Symbol, RowExpr> RowMap;


class SolverImpl
{

public:

	SolverImpl() : m_id_tick( 0 ) {}

	~SolverImpl() {}

	bool addConstraint( const Constraint& constraint )
	{
		if( constraint.op() == OP_EQ )
			return false;
		if( constraint.expression().terms().size() == 0 )
			return false;

		RowExpr expr;
		initializeRow( expr, constraint );
		Symbol slack( Symbol::Slack, m_id_tick++ );
		expr.cells[ slack ] = constraint.op() == OP_LE ? 1.0 : -1.0;

		Symbol subject( chooseSubject( expr ) );
		if( subject.type == Symbol::Invalid )
			return false;

		solveFor( expr, subject );
		substituteOut( subject, expr );
		m_rows[ subject ] = expr;

		return true;
	}

	bool removeConstraint( const Constraint& constraint )
	{
		return false;
	}

	bool solve()
	{
		updateExternalVars();
		return true;
	}

	void beginEdit()
	{
	}

	void endEdit()
	{
	}

	bool suggestValue( const Variable& variable, double value, double strength )
	{
		return false;
	}

private:

	static
	void merge( RowExpr& target, const RowExpr& row, double coefficient )
	{
		typedef CellMap::const_iterator iter_t;
		target.constant += row.constant * coefficient;
		iter_t begin = row.cells.begin();
		iter_t end = row.cells.end();
		for( iter_t it = begin; it != end; ++it )
		{
			double coeff = it->second * coefficient;
			if( approx( target.cells[ it->first ] += coeff, 0.0 ) )
				target.cells.erase( it->first );
		}
	}

	static
	void solveFor( RowExpr& row, const Symbol& symbol )
	{
		typedef CellMap::iterator iter_t;
		double coeff = -1.0 / row.cells[ symbol ];
		row.cells.erase( symbol );
		row.constant *= coeff;
		iter_t begin = row.cells.begin();
		iter_t end = row.cells.end();
		for( iter_t it = begin; it != end; ++it )
			it->second *= coeff;
	}

	void substituteOut( const Symbol& symbol, const RowExpr& row )
	{
		typedef RowMap::iterator iter_t;
		typedef CellMap::iterator cell_iter_t;
		iter_t begin = m_rows.begin();
		iter_t end = m_rows.end();
		for( iter_t it = begin; it != end; ++it )
		{
			cell_iter_t c_it = it->second.cells.find( symbol );
			if( c_it != it->second.cells.end() )
			{
				double coefficient = c_it->second;
				it->second.cells.erase( c_it );
				merge( it->second, row, coefficient );
			}
		}
	}

	Symbol chooseSubject( RowExpr& row )
	{
		typedef CellMap::iterator iter_t;
		Symbol result;
		iter_t begin = row.cells.begin();
		iter_t end = row.cells.end();
		for( iter_t it = begin; it != end; ++it )
		{
			if( it->first.type == Symbol::External )
				return it->first;
			if( it->first.type == Symbol::Slack )
				result = it->first;
		}
		return result;
	}

	Symbol symbolForVariable( const Variable& variable )
	{
		VarMap::iterator it = m_external_vars.find( variable );
		if( it != m_external_vars.end() )
			return it->second;
		Symbol symbol( Symbol::External, m_id_tick++ );
		m_external_vars[ variable ] = symbol;
		return symbol;
	}

	void initializeRow( RowExpr& row, const Constraint& constraint )
	{
		typedef std::vector<Term>::const_iterator iter_t;
		const Expression& expr( constraint.expression() );
		row.constant = expr.constant();
		iter_t begin = expr.terms().begin();
		iter_t end = expr.terms().end();
		for( iter_t it = begin; it != end; ++it )
		{
			if( approx( it->coefficient(), 0.0 ) )
				continue;
			Symbol symbol( symbolForVariable( it->variable() ) );
			RowMap::const_iterator row_it = m_rows.find( symbol );
			if( row_it != m_rows.end() )
				merge( row, row_it->second, it->coefficient() );
			else
				row.cells[ symbol ] += it->coefficient();
		}
	}

	void updateExternalVars()
	{
		typedef VarMap::iterator var_iter_t;
		typedef RowMap::iterator row_iter_t;
		var_iter_t var_begin = m_external_vars.begin();
		var_iter_t var_end = m_external_vars.end();
		row_iter_t row_end = m_rows.end();
		for( var_iter_t var_it = var_begin; var_it != var_end; ++var_it )
		{
			Variable& var( const_cast<Variable&>( var_it->first ) );
			row_iter_t row_it = m_rows.find( var_it->second );
			if( row_it == row_end )
				var.setValue( 0.0 );
			else
				var.setValue( row_it->second.constant );
		}
	}

	VarMap m_external_vars;
	RowMap m_rows;
	Symbol::Id m_id_tick;
};

} // namespace priv

} // namespace kiwi







































