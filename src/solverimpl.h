/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <algorithm>
#include <iostream>
#include <limits>
#include <memory>
#include <vector>
#include "constraint.h"
#include "expression.h"
#include "maptype.h"
#include "relation.h"
#include "row.h"
#include "symbol.h"
#include "term.h"
#include "util.h"
#include "variable.h"


namespace kiwi
{

namespace impl
{

class SolverImpl
{

	typedef MapType<Variable, Symbol>::Type VarMap;

	typedef MapType<Symbol, Row*>::Type RowMap;

public:

	SolverImpl() : m_id_tick( 1 ), m_objective( new Row() ) {}

	~SolverImpl()
	{
		typedef RowMap::iterator iter_t;
		iter_t end = m_rows.end();
		for( iter_t it = m_rows.begin(); it != end; ++it )
			delete it->second;
	}

	bool addConstraint( const Constraint& constraint )
	{
		// If the constraint has already been added, it's a no-op.
		//if( m_cns.find( constraint ) != m_cns.end() )
		//	return true;

		std::auto_ptr<Row> rowptr( createRow( constraint ) );

		// An invalid subject means the system would be unsatisfiable.
		Symbol subject( chooseSubject( *rowptr ) );
		if( subject.type() == Symbol::Invalid )
			return false;
			// At this point, the variables which were added to
			// m_vars as a result of the constraint are no longer
		    // needed and should be removed.

		rowptr->solveFor( subject );
		substituteOut( subject, *rowptr );
		subject.setBasic( true );
		m_rows[ subject ] = rowptr.release();

		return true;
	}

	bool removeConstraint( const Constraint& constraint )
	{
		return false;
	}

	bool solve()
	{
		optimize();
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

	void dump()
	{
		typedef RowMap::const_iterator row_iter_t;

		std::cout << "F: ";
		dump( *m_objective );
		std::cout << std::endl;
		dump( m_rows );
		std::cout << std::endl;
		dump( m_vars );
	}

	void dump( const RowMap& rows )
	{
		typedef RowMap::const_iterator iter_t;
		iter_t end = rows.end();
		for( iter_t it = m_rows.begin(); it != end; ++it )
		{
			dump( it->first );
			std::cout << " | ";
			dump( *it->second );
			std::cout << std::endl;
		}
	}

	void dump( const VarMap& vars )
	{
		typedef VarMap::const_iterator iter_t;
		iter_t end = m_vars.end();
		for( iter_t it = m_vars.begin(); it != end; ++it )
		{
			std::cout << it->first.name() << " = ";
			dump( it->second );
			std::cout << std::endl;
		}
	}

	void dump( const Row& row )
	{
		typedef Row::CellMap::const_iterator iter_t;
		std::cout << row.constant();
		iter_t end = row.cells().end();
		for( iter_t it = row.cells().begin(); it != end; ++it )
		{
			std::cout << " + " << it->second << " * ";
			dump( it->first );
		}
	}

	void dump( const Symbol& symbol )
	{
		switch( symbol.type() )
		{
			case Symbol::Invalid:
				std::cout << "i";
				break;
			case Symbol::External:
				std::cout << "v";
				break;
			case Symbol::Slack:
				std::cout << "s";
				break;
			case Symbol::Error:
				std::cout << "e";
				break;
			case Symbol::Dummy:
				std::cout << "d";
				break;
			default:
				break;
		}
		std::cout << symbol.id();
		std::cout << "$" << symbol.isBasic();
	}

private:

	SolverImpl( const SolverImpl& );

	SolverImpl& operator=( const SolverImpl& );

	/* Choose the subject for solving for the row.

	This method will choose the best subject for using as the solve
	target for the row. An invalid symbol will be returned if there
	is no valid target.

	The symbols are chosen according to the following precedence:

	1) The first symbol representing an external variable.
	2) The last negative slack or error variable.

	Rule #2 follows from the fact that variables which are new to the
	solver will always appear at the end of a row due to monotonically
	increasing symbol ids. This reduces the need for substitution.

	If a valid subject is not found, an invalid symbol will be returned.
	Provided that all basic variables have been subtituted into the row,
	this indicates that the row is a required constraint which cannot be
	satisfied by the current system.

	*/
	Symbol chooseSubject( const Row& row )
	{
		typedef Row::CellMap::const_iterator iter_t;
		Symbol result;
		iter_t end = row.cells().end();
		for( iter_t it = row.cells().begin(); it != end; ++it )
		{
			switch( it->first.type() )
			{
				case Symbol::External:
					return it->first;
				case Symbol::Slack:
				case Symbol::Error:
				{
					if( it->second < 0.0 )
						result = it->first;
					break;
				}
				default:
					break;
			}
		}
		return result;
	}

	/* Substitute all occurence of the symbol with the given row.

	This should be performed when a new row is being added to the
	system. The symbol represent the basic var for the new row.

	*/
	void substituteOut( const Symbol& symbol, const Row& row )
	{
		typedef RowMap::iterator iter_t;
		iter_t end = m_rows.end();
		for( iter_t it = m_rows.begin(); it != end; ++it )
			it->second->substitute( symbol, row );
		m_objective->substitute( symbol, row );
	}

	/* Get the symbol for the given variable.

	If the variable has not already been seen by the solver, a new
	symbol will be created for it.

	*/
	Symbol getSymbol( const Variable& variable )
	{
		VarMap::iterator it = m_vars.find( variable );
		if( it != m_vars.end() )
			return it->second;
		Symbol symbol( Symbol::External, m_id_tick++ );
		m_vars[ variable ] = symbol;
		return symbol;
	}

	/* Create a new row object for the given constraint.

	The terms in the constraint will be converted to cells in the row.
	Any term in the constraint with a coefficient of zero is ignored.
	This method uses the `getSymbol` method to get the symbol for the
	variables added to the row. If the symbol for a given variable is
	currently basic, it will be substituted with the basic row.

	The necessary slack and error variables will be added to the row.
	If the constant for the row is negative, the entire row will be
	multiplied by -1 so that the constant becomes positive.

	*/
	Row* createRow( const Constraint& constraint )
	{
		typedef std::vector<Term>::const_iterator iter_t;
		const Expression& expr( constraint.expression() );
		Row* row = new Row( expr.constant() );

		// Copy the terms from the contraint into cells in the row.
		// Any term which references a basic symbol is substituted
		// with the row for that symbol.
		iter_t end = expr.terms().end();
		for( iter_t it = expr.terms().begin(); it != end; ++it )
		{
			if( approx( it->coefficient(), 0.0 ) )
				continue;
			Symbol symbol( getSymbol( it->variable() ) );
			RowMap::const_iterator row_it = m_rows.find( symbol );
			if( row_it != m_rows.end() )
				row->insert( *row_it->second, it->coefficient() );
			else
				row->insert( symbol, it->coefficient() );
		}

		// Add the slack and error variables to the row.
		switch( constraint.op() )
		{
			case OP_LE:
			{
				Symbol slack( Symbol::Slack, m_id_tick++ );
				row->insert( slack );
				if( constraint.strength() < strength::required )
				{
					Symbol error( Symbol::Error, m_id_tick++ );
					row->insert( error, -1.0 );
					m_objective->insert( error, constraint.strength() );
				}
				break;
			}
			case OP_GE:
			{
				Symbol slack( Symbol::Slack, m_id_tick++ );
				row->insert( slack, -1.0 );
				if( constraint.strength() < strength::required )
				{
					Symbol error( Symbol::Error, m_id_tick++ );
					row->insert( error );
					m_objective->insert( error, constraint.strength() );
				}
				break;
			}
			case OP_EQ:
			{
				if( constraint.strength() < strength::required )
				{
					Symbol eplus( Symbol::Error, m_id_tick++ );
					Symbol eminus( Symbol::Error, m_id_tick++ );
					row->insert( eplus, -1.0 );  // reverse sign to solve lhs
					row->insert( eminus, 1.0 );  // reverse sign to solve lhs
					m_objective->insert( eplus, constraint.strength() );
					m_objective->insert( eminus, constraint.strength() );
				}
				break;
			}
		}

		// Invert the row if the constant is negative.
		if( row->constant() < 0.0 )
			row->reverseSign();

		return row;
	}

	void optimize()
	{
		const double max_double = std::numeric_limits<double>::max();
		typedef RowMap::iterator iter_t;
		while( true )
		{
			Symbol sym( getEntrySymbol() );
			if( sym.type() == Symbol::Invalid )
				return;

			double c = max_double;
			double temp = 0.0;
			iter_t begin = m_rows.begin();
			iter_t end = m_rows.end();
			iter_t target = end;
			for( iter_t it = begin; it != end; ++it )
			{
				if( it->second->coefficientFor( sym, temp ) && temp < 0.0 )
				{
					double r = -it->second->constant() / temp;
					if( r < c )
					{
						c = r;
						target = it;
					}
				}
			}
			if( target == end )
				return;


			Row* row = target->second;
			Symbol m(target->first);
			m.setBasic( false );

			m_rows.erase( target );
			row->solveFor( sym );
			row->insert( m, -1.0 );

			substituteOut( sym, *row );
			sym.setBasic( true );
			m_rows[ sym ] = row;
		}
	}

	Symbol getEntrySymbol()
	{
		typedef Row::CellMap::const_iterator iter_t;
		iter_t begin = m_objective->cells().begin();
		iter_t end = m_objective->cells().end();
		for( iter_t it = begin; it != end; ++it )
		{
			if( !it->first.isBasic() && it->second < 0.0 )
				return it->first;
		}
		return Symbol();
	}

	void updateExternalVars()
	{
		typedef VarMap::iterator var_iter_t;
		typedef RowMap::iterator row_iter_t;
		var_iter_t var_begin = m_vars.begin();
		var_iter_t var_end = m_vars.end();
		row_iter_t row_end = m_rows.end();
		for( var_iter_t var_it = var_begin; var_it != var_end; ++var_it )
		{
			Variable& var( const_cast<Variable&>( var_it->first ) );
			row_iter_t row_it = m_rows.find( var_it->second );
			if( row_it == row_end )
				var.setValue( 0.0 );
			else
				var.setValue( row_it->second->constant() );
		}
	}

	VarMap m_vars;
	RowMap m_rows;
	std::auto_ptr<Row> m_objective;
	Symbol::Id m_id_tick;
};

} // namespace impl

} // namespace kiwi







































