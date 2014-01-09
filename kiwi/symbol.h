/*-----------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once


namespace kiwi
{

namespace impl
{

class Symbol
{

public:

	typedef unsigned long long Id;

	enum Type
	{
		Invalid,
		External,
		Slack,
		Error,
		Dummy
	};

	Symbol() : m_id( 0 ), m_type( Invalid ) {}

	Symbol( Type type, Id id ) : m_id( id ), m_type( type ) {}

	~Symbol() {}

	Id id() const
	{
		return m_id;
	}

	Type type() const
	{
		return m_type;
	}

	bool operator<( const Symbol& other ) const
	{
		return m_id < other.m_id;
	}

	bool operator==( const Symbol& other ) const
	{
		return m_id == other.m_id;
	}

private:

	Id m_id;
	Type m_type;
};

} // namespace impl

} // namespace kiwi
