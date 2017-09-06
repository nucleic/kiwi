/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2017, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include <iostream>
#include <vector>
#include "constraint.h"
#include "solverimpl.h"
#include "term.h"


namespace kiwi
{

namespace impl
{

class DebugHelper
{

public:

	static void dump( const SolverImpl& solver )
	{
		std::cout << "Objective" << std::endl;
		std::cout << "---------" << std::endl;
		dump( *solver.m_objective );
		std::cout << std::endl;
		std::cout << "Tableau" << std::endl;
		std::cout << "-------" << std::endl;
		dump( solver.m_rows );
		std::cout << std::endl;
		std::cout << "Infeasible" << std::endl;
		std::cout << "----------" << std::endl;
		dump( solver.m_infeasible_rows );
		std::cout << std::endl;
		std::cout << "Variables" << std::endl;
		std::cout << "---------" << std::endl;
		dump( solver.m_vars );
		std::cout << std::endl;
		std::cout << "Edit Variables" << std::endl;
		std::cout << "--------------" << std::endl;
		dump( solver.m_edits );
		std::cout << std::endl;
		std::cout << "Constraints" << std::endl;
		std::cout << "-----------" << std::endl;
		dump( solver.m_cns );
		std::cout << std::endl;
		std::cout << std::endl;
	}

	static void dump( const SolverImpl::RowMap& rows )
	{
		typedef SolverImpl::RowMap::const_iterator iter_t;
		iter_t end = rows.end();
		for( iter_t it = rows.begin(); it != end; ++it )
		{
			dump( it->first );
			std::cout << " | ";
			dump( *it->second );
		}
	}

	static void dump( const std::vector<Symbol>& symbols )
	{
		typedef std::vector<Symbol>::const_iterator iter_t;
		iter_t end = symbols.end();
		for( iter_t it = symbols.begin(); it != end; ++it )
		{
			dump( *it );
			std::cout << std::endl;
		}
	}

	static void dump( const SolverImpl::VarMap& vars )
	{
		typedef SolverImpl::VarMap::const_iterator iter_t;
		iter_t end = vars.end();
		for( iter_t it = vars.begin(); it != end; ++it )
		{
			std::cout << it->first.name() << " = ";
			dump( it->second );
			std::cout << std::endl;
		}
	}

	static void dump( const SolverImpl::CnMap& cns )
	{
		typedef SolverImpl::CnMap::const_iterator iter_t;
		iter_t end = cns.end();
		for( iter_t it = cns.begin(); it != end; ++it )
			dump( it->first );
	}

	static void dump( const SolverImpl::EditMap& edits )
	{
		typedef SolverImpl::EditMap::const_iterator iter_t;
		iter_t end = edits.end();
		for( iter_t it = edits.begin(); it != end; ++it )
			std::cout << it->first.name() << std::endl;
	}

	static void dump( const Row& row )
	{
		typedef Row::CellMap::const_iterator iter_t;
		std::cout << row.constant();
		iter_t end = row.cells().end();
		for( iter_t it = row.cells().begin(); it != end; ++it )
		{
			std::cout << " + " << it->second << " * ";
			dump( it->first );
		}
		std::cout << std::endl;
	}

	static void dump( const Symbol& symbol )
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

	static void dump( const Constraint& cn )
	{
		typedef std::vector<Term>::const_iterator iter_t;
		iter_t begin = cn.expression().terms().begin();
		iter_t end = cn.expression().terms().end();
		for( iter_t it = begin; it != end; ++it )
		{
			std::cout << it->coefficient() << " * ";
			std::cout << it->variable().name() << " + ";
		}
		std::cout << cn.expression().constant();
		switch( cn.op() )
		{
			case OP_LE:
				std::cout << " <= 0 ";
				break;
			case OP_GE:
				std::cout << " >= 0 ";
				break;
			case OP_EQ:
				std::cout << " == 0 ";
				break;
			default:
				break;
		}
		std::cout << " | strength = " << cn.strength() << std::endl;
	}
};

} // namespace impl


namespace debug
{

template<typename T>
void dump( const T& value )
{
	impl::DebugHelper::dump( value );
}

} // namespace debug

} // namespace kiwi
