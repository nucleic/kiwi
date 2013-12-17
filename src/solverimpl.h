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
#include "errors.h"
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
	struct CnTag
	{
		Symbol marker;
		Symbol errplus;
		Symbol errminus;
	};

	struct EditInfo
	{
		CnTag tag;
		Constraint constraint;
		double constant;
	};

	typedef MapType<Variable, Symbol>::Type VarMap;

	typedef MapType<Symbol, Row*>::Type RowMap;

	typedef MapType<Constraint, CnTag>::Type CnMap;

	typedef MapType<Variable, EditInfo>::Type EditMap;

public:

	SolverImpl() : m_id_tick( 1 ), m_objective( new Row() ) {}

	~SolverImpl()
	{
		clearRows();
	}

	/* Add a constraint to the solver.

	Throws
	------
	DuplicateConstraint
		The given constraint has already been added to the solver.

	UnsatisfiableConstraint
		The given constraint is required and cannot be satisfied.

	*/
	double addConstraint( const Constraint& constraint )
	{
		if( m_cns.find( constraint ) != m_cns.end() )
			throw DuplicateConstraint( constraint );

		CnTag tag;
		std::auto_ptr<Row> rowptr( createRow( constraint, tag ) );

		// If the constraint is unsatisfiable, the variables which were
		// added as a result of creating the row for the constraint are
		// not needed and should be removed. Code should not typically
		// add conflicting constraints and its likely that a given var
		// will be used by multiple constraints anyway, so I'm not too
		// concerned about handling this edge-case at the moment.
		const Symbol subject( chooseSubject( *rowptr ) );
		if( subject.type() == Symbol::Invalid )
			throw UnsatisfiableConstraint( constraint );

		rowptr->solveFor( subject );
		substitute( subject, *rowptr );
		double c = rowptr->constant();
		m_rows[ subject ] = rowptr.release();
		m_cns[ constraint ] = tag;
		return c;
	}

	/* Remove a constraint from the solver.

	Throws
	------
	UnknownConstraint
		The given constraint has not been added to the solver.

	*/
	void removeConstraint( const Constraint& constraint )
	{
		CnMap::iterator cn_it = m_cns.find( constraint );
		if( cn_it == m_cns.end() )
			throw UnknownConstraint( constraint );

		CnTag tag( cn_it->second );
		m_cns.erase( cn_it );

		// Remove the error variables from the objective function
		// *before* pivoting, or substitutions into the objective
		// will lead to incorrect solver results.
		if( tag.errplus.type() != Symbol::Invalid )
			m_objective->remove( tag.errplus );
		if( tag.errminus.type() != Symbol::Invalid )
			m_objective->remove( tag.errminus );

		// If the marker is basic, simply drop the row. Otherwise,
		// pivot the marker into the basis and then drop the row.
		const Symbol marker( tag.marker );
		RowMap::iterator row_it = m_rows.find( marker );
		if( row_it != m_rows.end() )
		{
			std::auto_ptr<Row> rowptr( row_it->second );
			m_rows.erase( row_it );
		}
		else
		{
			row_it = getMarkerLeavingRow( marker );
			const Symbol leaving( row_it->first );
			std::auto_ptr<Row> rowptr( row_it->second );
			m_rows.erase( row_it );
			pivot( *rowptr, leaving, marker );
		}
	}

	/* Test whether a constraint has been added to the solver.

	*/
	bool hasConstraint( const Constraint& constraint ) const
	{
		return m_cns.find( constraint ) != m_cns.end();
	}

	/* Add an edit variable to the solver.

	This method should be called before the `suggestValue` method is
	used to supply a suggested value for the given edit variable.

	Throws
	------
	DuplicateEditVariable
		The given edit variable has already been added to the solver.

	BadRequiredStrength
		The given strength is >= required.

	*/
	void addEditVariable( const Variable& variable, double strength )
	{
		if( m_edits.find( variable ) != m_edits.end() )
			throw DuplicateEditVariable( variable );
		strength = strength::clip( strength );
		if( strength == strength::required )
			throw BadRequiredStrength();
		Constraint constraint( Expression( variable ), OP_EQ, strength );
		double c = addConstraint( constraint );
		EditInfo info;
		info.tag = m_cns[ constraint ];
		info.constraint = constraint;
		info.constant = 0.0;
		m_edits[ variable ] = info;
	}

	/* Remove an edit variable from the solver.

	Throws
	------
	UnknownEditVariable
		The given edit variable has not been added to the solver.

	*/
	void removeEditVariable( const Variable& variable )
	{
		EditMap::iterator it = m_edits.find( variable );
		if( it == m_edits.end() )
			throw UnknownEditVariable( variable );
		removeConstraint( it->second.constraint );
		m_edits.erase( it );
	}

	/* Test whether an edit variable has been added to the solver.

	*/
	bool hasEditVariable( const Variable& variable ) const
	{
		return m_edits.find( variable ) != m_edits.end();
	}

	/* Suggest a value for the given edit variable.

	This method should be used after an edit variable as been added to
	the solver in order to suggest the value for that variable. After
	all suggestions have been made, the `solve` method can be used to
	update the values of all variables.

	Throws
	------
	UnknownEditVariable
		The given edit variable has not been added to the solver.

	*/
	void suggestValue( const Variable& variable, double value )
	{
		EditMap::iterator it = m_edits.find( variable );
		if( it == m_edits.end() )
			throw UnknownEditVariable( variable );

		EditInfo& info = it->second;
		double delta = value - info.constant;
		std::cout << "delta: " << delta << std::endl;
		info.constant = value;

		// Check first if the negative error variable is basic.
		RowMap::iterator row_it = m_rows.find( info.tag.errminus );
		if( row_it != m_rows.end() )
		{
			if( row_it->second->add( delta ) < 0.0 )
				m_infeasible_rows.push_back( row_it->first );
			return;
		}

		// Check next if the positive error variable is basic.
		row_it = m_rows.find( info.tag.errplus );
		if( row_it != m_rows.end() )
		{
			if( row_it->second->add( -delta ) < 0.0 )
				m_infeasible_rows.push_back( row_it->first );
			return;
		}

		// Otherwise update each row where the error variables exist.
		RowMap::iterator end = m_rows.end();
		for( row_it = m_rows.begin(); row_it != end; ++row_it )
		{
			double coeff = row_it->second->coefficientFor( info.tag.errminus );
			if( coeff != 0.0 )
			{
				double c = coeff < 0.0 ? -delta * coeff : delta * coeff;
				if( row_it->second->add( c ) < 0.0 &&
					row_it->first.type() != Symbol::External )
					m_infeasible_rows.push_back( row_it->first );
			}
		}
	}

	/* Solve the system for the current set of constraints.

	The will resolve the system and update the values of the variables
	according to the current constraints and suggested values.

	Throws
	------
	UnboundedObjective
		The constraints result in an unbounded object function.

	XXX is it even possible to acheive an unbounded objective?

	*/
	void solve()
	{
		if( m_infeasible_rows.empty() )
			optimize();
		else
			dualOptimize();
		updateExternalVars();
	}

	/* Reset the solver to the empty starting condition.

	This method resets the internal solver state to the empty starting
	condition, as if no constraints or edit variables have been added.
	This can be faster than deleting the solver and creating a new one
	when the entire system must change, since it can avoid unecessary
	heap (de)allocations.

	*/
	void reset()
	{
		clearRows();
		m_cns.clear();
		m_vars.clear();
		m_edits.clear();
		m_infeasible_rows.clear();
		m_objective.reset( new Row() );
		m_id_tick = 1;
	}

	void dump()
	{
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
	}

private:

	SolverImpl( const SolverImpl& );

	SolverImpl& operator=( const SolverImpl& );

	struct RowDeleter
	{
		template<typename T>
		void operator()( T& pair )
		{
			delete pair.second;
		}
	};

	void clearRows()
	{
		std::for_each( m_rows.begin(), m_rows.end(), RowDeleter() );
		m_rows.clear();
	}

	/* Get the symbol for the given variable.

	If a symbol does not exist for the variable, one will be created.

	*/
	Symbol getVarSymbol( const Variable& variable )
	{
		VarMap::iterator it = m_vars.find( variable );
		if( it != m_vars.end() )
			return it->second;
		const Symbol symbol( Symbol::External, m_id_tick++ );
		m_vars[ variable ] = symbol;
		return symbol;
	}

	/* Create a new row object for the given constraint.

	The terms in the constraint will be converted to cells in the row.
	Any term in the constraint with a coefficient of zero is ignored.
	This method uses the `getVarSymbol` method to get the symbol for
	the variables added to the row. If the symbol for a given cell
	variable is basic, the cell variable will be substituted with the
	basic row.

	The necessary slack and error variables will be added to the row.
	If the constant for the row is negative, the sign for the row
	will be inverted so the constant becomes positive.

	The tag will be updated with the marker and error symbols to use
	for tracking the movement of the constraint in the tableau.

	*/
	Row* createRow( const Constraint& constraint, CnTag& tag )
	{
		typedef std::vector<Term>::const_iterator iter_t;
		const Expression& expr( constraint.expression() );
		Row* row = new Row( expr.constant() );

		iter_t end = expr.terms().end();
		for( iter_t it = expr.terms().begin(); it != end; ++it )
		{
			if( !nearZero( it->coefficient() ) )
			{
				const Symbol symbol( getVarSymbol( it->variable() ) );
				RowMap::const_iterator row_it = m_rows.find( symbol );
				if( row_it != m_rows.end() )
					row->insert( *row_it->second, it->coefficient() );
				else
					row->insert( symbol, it->coefficient() );
			}
		}

		switch( constraint.op() )
		{
			case OP_LE:
			case OP_GE:
			{
				double coeff = constraint.op() == OP_LE ? 1.0 : -1.0;
				const Symbol slack( Symbol::Slack, m_id_tick++ );
				tag.marker = slack;
				row->insert( slack, coeff );
				if( constraint.strength() < strength::required )
				{
					const Symbol error( Symbol::Error, m_id_tick++ );
					tag.errplus = error;
					row->insert( error, -coeff );
					m_objective->insert( error, constraint.strength() );
				}
				break;
			}
			case OP_EQ:
			{
				if( constraint.strength() < strength::required )
				{
					const Symbol errplus( Symbol::Error, m_id_tick++ );
					const Symbol errminus( Symbol::Error, m_id_tick++ );
					tag.marker = errplus; // arbitrary choice
					tag.errplus = errplus;
					tag.errminus = errminus;
					row->insert( errplus, 1.0 );
					row->insert( errminus, -1.0 );
					m_objective->insert( errplus, constraint.strength() );
					m_objective->insert( errminus, constraint.strength() );
				}
				else
				{
					const Symbol dummy( Symbol::Dummy, m_id_tick++ );
					tag.marker = dummy;
					row->insert( dummy );
				}
				break;
			}
		}

		if( row->constant() < 0.0 )
			row->reverseSign();

		return row;
	}

	/* Choose the subject for solving for the row.

	This method will choose the best subject for using as the solve
	target for the row. An invalid symbol will be returned if there
	is no valid target.

	The symbols are chosen according to the following precedence:

	1) The first symbol representing an external variable.
	2) The last negative slack or error variable.

	Rule #2 follows from the fact that variables which are new to the
	solver will always appear at the end of a row due to monotonically
	increasing symbol ids. This reduces the need for substitutions.

	Assuming that the row has already had its basic symbols replaced by
	substitution, the only time that a valid subject will not be found
	is when the constraint is required and cannot be satisfied. In that
	case, this method will return an invalid symbol.

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

	/* Substitute the parametric symbol with the given row.

	This method will substitute all instances of the parametric symbol
	in the tableau and the objective function with the given row.

	*/
	void substitute( const Symbol& symbol, const Row& row )
	{
		typedef RowMap::iterator iter_t;
		iter_t end = m_rows.end();
		for( iter_t it = m_rows.begin(); it != end; ++it )
			it->second->substitute( symbol, row );
		m_objective->substitute( symbol, row );
	}

	/* Perform a pivot of the given row and symbols.

	This method will pivot the tableau with the given row so that the
	leaving symbol will leave the basis, and the entering symbol will
	enter the basis. The entering symbol *must* exist in the row, and
	the row *must not* currently be in the tableau. The caller is
	responsible for adding the row back to the tableau if needed.

	*/
	void pivot( Row& row, const Symbol& leaving, const Symbol& entering )
	{
		row.solveFor( leaving, entering );
		substitute( entering, row );
	}

	/* Optimize the system for the current objective function.

	This method performs iterations of Phase 2 of the simplex method
	until the objective function reaches a minimum.

	Throws
	------
	UnboundedObjective
		The value of the objective function is unbounded.

	*/
	void optimize()
	{
		while( true )
		{
			const Symbol entering( getEnteringSymbol() );
			if( entering.type() == Symbol::Invalid )
				return;

			std::cout << "entering on: ";
			dump( entering );
			std::cout << std::endl;

			RowMap::iterator it = getLeavingRow( entering );
			if( it == m_rows.end() )
				throw UnboundedObjective();

			const Symbol leaving( it->first );

			std::cout << "leaving on: ";
			dump( leaving );
			std::cout << std::endl;

			Row* row = it->second;
			m_rows.erase( it );
			pivot( *row, leaving, entering );
			m_rows[ entering ] = row;
		}
	}

	/* Optimize the system using the dual of the simplex method.

	The current state of the system should be such that the objective
	function is optimal, but not feasible. This method will perform
	iterations of the dual simplex method until no infeasible rows
	remain, thus making the solution optimal and feasible.

	*/
	void dualOptimize()
	{
		std::cout << "dual optimizing" << std::endl;
		while( !m_infeasible_rows.empty() )
		{
			const Symbol leaving( m_infeasible_rows.back() );
			m_infeasible_rows.pop_back();
			RowMap::iterator it = m_rows.find( leaving );
			if( it != m_rows.end() && it->second->constant() < 0.0 )
			{
				const Symbol entering( getDualEnteringSymbol( *it->second ) );
				if( entering.type() == Symbol::Invalid ) // should never happen
					throw InternalSolverError();

				Row* row = it->second;
				m_rows.erase( it );
				pivot( *row, leaving, entering );
				m_rows[ entering ] = row;
			}
		}
	}

	/* Compute the entering variable for a pivot operation.

	This method will return first symbol in the objective function which
	is non-dummy and has a coefficient less than zero. If no symbol meets
	the criteria, it means the objective function is at a minimum, and an
	invalid symbol is returned.

	*/
	Symbol getEnteringSymbol()
	{
		typedef Row::CellMap::const_iterator iter_t;
		iter_t begin = m_objective->cells().begin();
		iter_t end = m_objective->cells().end();
		for( iter_t it = begin; it != end; ++it )
		{
			if( it->first.type() != Symbol::Dummy && it->second < 0.0 )
				return it->first;
		}
		return Symbol();
	}

	/* Compute the entering symbol for the dual solve operation.

	This method will return the symbol in the row which has a positive
	coefficient and yields the minimum ratio for its respective symbol
	in the objective function. The provided row *must* be infeasible.
	If no symbol is found which meats the criteria, an invalid symbol
	is returned.

	*/
	Symbol getDualEnteringSymbol( const Row& row )
	{
		typedef Row::CellMap::const_iterator iter_t;
		Symbol entering;
		double ratio = std::numeric_limits<double>::max();
		iter_t end = row.cells().end();
		for( iter_t it = row.cells().begin(); it != end; ++it )
		{
			if( it->second > 0.0 && it->first.type() != Symbol::Dummy )
			{
				double coeff = m_objective->coefficientFor( it->first );
				double r = coeff / it->second;
				if( r < ratio )
				{
					ratio = r;
					entering = it->first;
				}
			}
		}
		return entering;
	}

	/* Compute the row which holds the exit symbol for a pivot.

	This method will return an iterator to the row in the row map
	which holds the exit symbol. If no appropriate exit symbol is
	found, the end() iterator will be returned. This indicates that
	the objective function is unbounded.

	*/
	RowMap::iterator getLeavingRow( const Symbol& entering )
	{
		typedef RowMap::iterator iter_t;
		double ratio = std::numeric_limits<double>::max();
		iter_t end = m_rows.end();
		iter_t found = m_rows.end();
		for( iter_t it = m_rows.begin(); it != end; ++it )
		{
			if( it->first.type() != Symbol::External )
			{
				double temp = it->second->coefficientFor( entering );
				if( temp < 0.0 )
				{
					double temp_ratio = -it->second->constant() / temp;
					if( temp_ratio < ratio )
					{
						ratio = temp_ratio;
						found = it;
					}
				}
			}
		}
		return found;
	}

	/* Compute the leaving row for a marker variable.

	This method will return an iterator to the row in the row map
	which holds the given marker variable. The row will be chosen
	according to the following precedence:

	1) The row with a restricted basic varible and a negative coefficient
	   for the marker with the smallest ratio of -constant / coefficient.

	2) The row with a restricted basic variable and the smallest ratio
	   of constant / coefficient.

	3) The last unrestricted row which contains the marker.

	The marker *must* exist in at least one row.

	*/
	RowMap::iterator getMarkerLeavingRow( const Symbol& marker )
	{
		const double dmax = std::numeric_limits<double>::max();
		typedef RowMap::iterator iter_t;
		iter_t begin = m_rows.begin();
		iter_t end = m_rows.end();
		iter_t first = m_rows.end();
		iter_t second = m_rows.end();
		iter_t third = m_rows.end();
		double r1 = dmax;
		double r2 = dmax;
		for( iter_t it = begin; it != end; ++it )
		{
			double c = it->second->coefficientFor( marker );
			if( c == 0.0 )
				continue;
			if( it->first.type() == Symbol::External )
			{
				third = it;
			}
			else if( c < 0.0 )
			{
				double r = -it->second->constant() / c;
				if( r < r1 )
				{
					r1 = r;
					first = it;
				}
			}
			else
			{
				double r = it->second->constant() / c;
				if( r < r2 )
				{
					r2 = r;
					second = it;
				}
			}
		}
		if( first != end )
			return first;
		if( second != end )
			return second;
		return third;
	}

	/* Update the external variables with the values from the tableau.

	*/
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

	CnMap m_cns;
	RowMap m_rows;
	VarMap m_vars;
	EditMap m_edits;
	std::vector<Symbol> m_infeasible_rows;
	std::auto_ptr<Row> m_objective;
	Symbol::Id m_id_tick;
};

} // namespace impl

} // namespace kiwi
