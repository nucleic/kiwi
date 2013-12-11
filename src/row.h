/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include "maptype.h"
#include "symbol.h"
#include "util.h"


namespace kiwi
{

namespace impl
{

class Row
{

public:

	typedef MapType<Symbol, double>::Type CellMap;

	Row() : m_constant( 0.0 ) {}

	Row( double constant ) : m_constant( constant ) {}

	~Row() {}

	const CellMap& cells() const
	{
		return m_cells;
	}

	double constant() const
	{
		return m_constant;
	}

	void insert( const Symbol& symbol, double coefficient = 1.0 )
	{
		if( approx( m_cells[ symbol ] += coefficient, 0.0 ) )
			m_cells.erase( symbol );
	}

	void insert( const Row& other, double coefficient = 1.0 )
	{
		typedef CellMap::const_iterator iter_t;
		m_constant += other.m_constant * coefficient;
		iter_t end = other.m_cells.end();
		for( iter_t it = other.m_cells.begin(); it != end; ++it )
		{
			double coeff = it->second * coefficient;
			if( approx( m_cells[ it->first ] += coeff, 0.0 ) )
				m_cells.erase( it->first );
		}
	}

	void reverseSign()
	{
		typedef CellMap::iterator iter_t;
		m_constant = -m_constant;
		iter_t end = m_cells.end();
		for( iter_t it = m_cells.begin(); it != end; ++it )
			it->second = -it->second;
	}

	void solveFor( const Symbol& symbol )
	{
		typedef CellMap::iterator iter_t;
		double coeff = -1.0 / m_cells[ symbol ];
		m_cells.erase( symbol );
		m_constant *= coeff;
		iter_t end = m_cells.end();
		for( iter_t it = m_cells.begin(); it != end; ++it )
			it->second *= coeff;
	}

	bool coefficientFor( const Symbol& symbol, double& out )
	{
		typedef CellMap::const_iterator iter_t;
		iter_t it = m_cells.find( symbol );
		if( it == m_cells.end() )
			return false;
		out = it->second;
		return true;
	}

	void substitute( const Symbol& symbol, const Row& row )
	{
		typedef CellMap::iterator iter_t;
		iter_t it = m_cells.find( symbol );
		if( it != m_cells.end() )
		{
			double coefficient = it->second;
			m_cells.erase( it );
			insert( row, coefficient );
		}
	}

private:

	CellMap m_cells;

	double m_constant;
};

} // namespace impl

} // namespace
