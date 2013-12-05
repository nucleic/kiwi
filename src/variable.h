/*------------------------------------------------------------------------------
| Copyright (c) 2013, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file COPYING.txt, distributed with this software.
|-----------------------------------------------------------------------------*/
#pragma once
#include <string>
#include "shareddata.h"


namespace kiwi
{

class Variable
{

public:

	class Context
	{
	public:
		Context() {}
		virtual ~Context() {}
	};

	Variable( const std::string& name, Context* context=0 ) :
		m_data( new VariableData( name, context ) ) {}

	Variable( const char* name, Context* context=0 ) :
		m_data( new VariableData( name, context ) ) {}

	~Variable() {}

	const std::string& name() const
	{
		return m_data->m_name;
	}

	Context* context()
	{
		return m_data->m_context;
	}

	const Context* context() const
	{
		return m_data->m_context;
	}

	double value() const
	{
		return m_data->m_value;
	}

	void setValue( double value )
	{
		m_data->m_value = value;
	}

	bool operator<( const Variable& other ) const
	{
		return m_data < other.m_data;
	}

	bool operator==( const Variable& other ) const
	{
		return m_data == other.m_data;
	}

	bool operator!=( const Variable& other ) const
	{
		return m_data != other.m_data;
	}

private:

	class VariableData : public SharedData
	{

	public:

		VariableData( const std::string& name, Context* context ) :
			SharedData(),
			m_name( name ),
			m_context( context ),
			m_value( 0.0 ) {}

		VariableData( const char* name, Context* context ) :
			SharedData(),
			m_name( name ),
			m_context( context ),
			m_value( 0.0 ) {}

		~VariableData()
		{
			delete m_context;
		}

		std::string m_name;
		Context* m_context;
		double m_value;

	private:

		VariableData( const VariableData& other );

		VariableData& operator=( const VariableData& other );
	};

	SharedDataPtr<VariableData> m_data;
};

} // namespace kiwi
