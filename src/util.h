/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once


namespace kiwi
{

inline bool approx( double a, double b )
{
 	const double eps = 1.0e-8;
 	return ( a > b ) ? ( a - b ) < eps : ( b - a ) < eps;
}

} // namespace kiwi


namespace kiwi
{

namespace priv
{

struct PtrDelete
{
	template<typename T>
	void operator()( T t )
	{
		delete t;
	}
};

} // namespace priv

} // namespace kiwi
