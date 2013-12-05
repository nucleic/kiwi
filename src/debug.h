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

} // namespace debug

} // namespace kiwi
