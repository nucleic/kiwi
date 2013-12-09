/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <algorithm>
#include <memory>
#include <vector>
#include "constraint.h"
#include "expression.h"
#include "maptype.h"
#include "relation.h"
#include "term.h"
#include "variable.h"


namespace kiwi
{

namespace impl
{

class SolverImpl
{

public:

	SolverImpl() : m_id_tick( 0 ) {}

	~SolverImpl()
	{
		typedef RowMap::iterator iter_t;
		iter_t end = m_rows.end();
		for( iter_t it = m_rows.begin(); it != end; ++it )
			delete it->second;
	}

	bool addConstraint( const Constraint& constraint )
	{
		if( constraint.op() == OP_EQ )
			return false;
		if( constraint.expression().terms().size() == 0 )
			return false;

		std::auto_ptr<Row> rowptr( new Row() );
		initializeRow( *rowptr, constraint );
		Symbol slack( Symbol::Slack, m_id_tick++ );
		rowptr->cells[ slack ] = constraint.op() == OP_LE ? 1.0 : -1.0;

		Symbol subject( chooseSubject( *rowptr ) );
		if( subject.type == Symbol::Invalid )
			return false;

		solveRowFor( *rowptr, subject );
		substituteOut( subject, *rowptr );
		m_rows[ subject ] = rowptr.release();

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

	bool beginEdit()
	{
		return false;
	}

	bool endEdit()
	{
		return false;
	}

	bool suggestValue( const Variable& var, double value, double strength )
	{
		return false;
	}

private:

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

	typedef MapType<Symbol, double>::Type CellMap;

	typedef MapType<Variable, Symbol>::Type VarMap;

	struct Row
	{
		Row() : constant( 0.0 ) {}
		CellMap cells;
		double constant;
	};

	typedef MapType<Symbol, Row*>::Type RowMap;

	static bool approx( double a, double b )
	{
		const double eps = 1.0e-8;
		return ( a > b ) ? ( a - b ) < eps : ( b - a ) < eps;
	}

	static void addToRow( Row& target, const Row& row, double coefficient )
	{
		typedef CellMap::const_iterator iter_t;
		target.constant += row.constant * coefficient;
		iter_t end = row.cells.end();
		for( iter_t it = row.cells.begin(); it != end; ++it )
		{
			double coeff = it->second * coefficient;
			if( approx( target.cells[ it->first ] += coeff, 0.0 ) )
				target.cells.erase( it->first );
		}
	}

	static void solveRowFor( Row& row, const Symbol& symbol )
	{
		typedef CellMap::iterator iter_t;
		double coeff = -1.0 / row.cells[ symbol ];
		row.cells.erase( symbol );
		row.constant *= coeff;
		iter_t end = row.cells.end();
		for( iter_t it = row.cells.begin(); it != end; ++it )
			it->second *= coeff;
	}

	void substituteOut( const Symbol& symbol, const Row& row )
	{
		typedef RowMap::iterator row_iter_t;
		typedef CellMap::iterator cell_iter_t;
		row_iter_t end = m_rows.end();
		for( row_iter_t it = m_rows.begin(); it != end; ++it )
		{
			Row& target( *it->second );
			cell_iter_t c_it = target.cells.find( symbol );
			if( c_it != target.cells.end() )
			{
				double coefficient = c_it->second;
				target.cells.erase( c_it );
				addToRow( target, row, coefficient );
			}
		}
	}

	Symbol chooseSubject( const Row& row )
	{
		typedef CellMap::const_iterator iter_t;
		Symbol result;
		iter_t end = row.cells.end();
		for( iter_t it = row.cells.begin(); it != end; ++it )
		{
			switch( it->first.type )
			{
				case Symbol::External:
					return it->first;
				case Symbol::Slack:
					result = it->first;
					break;
				default:
					break;
			}
		}
		return result;
	}

	Symbol getSymbol( const Variable& variable )
	{
		VarMap::iterator it = m_external_vars.find( variable );
		if( it != m_external_vars.end() )
			return it->second;
		Symbol symbol( Symbol::External, m_id_tick++ );
		m_external_vars[ variable ] = symbol;
		return symbol;
	}

	void initializeRow( Row& row, const Constraint& constraint )
	{
		typedef std::vector<Term>::const_iterator iter_t;
		const Expression& expr( constraint.expression() );
		row.constant = expr.constant();
		iter_t end = expr.terms().end();
		for( iter_t it = expr.terms().begin(); it != end; ++it )
		{
			if( approx( it->coefficient(), 0.0 ) )
				continue;
			Symbol symbol( getSymbol( it->variable() ) );
			RowMap::const_iterator row_it = m_rows.find( symbol );
			if( row_it != m_rows.end() )
				addToRow( row, *row_it->second, it->coefficient() );
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
				var.setValue( row_it->second->constant );
		}
	}

	VarMap m_external_vars;
	RowMap m_rows;
	Symbol::Id m_id_tick;
};

} // namespace impl

} // namespace kiwi







































