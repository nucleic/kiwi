/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <iostream>
#include <vector>
#include "constraint.h"
#include "term.h"


namespace kiwi
{

namespace debug
{

void dump( const Constraint& cn )
{
	typedef std::vector<Term>::const_iterator iter_t;
	iter_t begin = cn.lhs().terms().begin();
	iter_t end = cn.lhs().terms().end();
	for( iter_t it = begin; it != end; ++it )
	{
		std::cout << it->coefficient() << " * ";
		std::cout << it->variable().name() << " + ";
	}
	std::cout << cn.lhs().constant();
	switch( cn.op() )
	{
		case LE:
			std::cout << " <= ";
			break;
		case GE:
			std::cout << " >= ";
			break;
		case EQ:
			std::cout << " == ";
			break;
		default:
			break;
	}
	begin = cn.rhs().terms().begin();
	end = cn.rhs().terms().end();
	for( iter_t it = begin; it != end; ++it )
	{
		std::cout << it->coefficient() << " * ";
		std::cout << it->variable().name() << " + ";
	}
	std::cout << cn.rhs().constant();
	std::cout << " | strength = " << cn.strength() << std::endl;
}

} // namespace debug

} // namespace kiwi
