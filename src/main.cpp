#include <iostream>
//#include <sys/time.h>

#include "kiwi.h"

#define NOMINMAX
#include <Windows.h>
#undef NOMINMAX


void doit()
{
}


int main( int argc, char* argv[] )
{
	kiwi::Variable x( "x" );
	kiwi::Variable y( "y" );
	kiwi::Variable z( "z" );

	kiwi::Constraint c1( 2 * x + 3 * y - 4 * z <= 20 );
	kiwi::Constraint c2( x <= 10 );
	kiwi::Constraint c3( y >= 20 );
	kiwi::Constraint c4( x == 1, kiwi::strength::strong );
	kiwi::Constraint c5( x == 0.5, kiwi::strength::strong + 10 );
	kiwi::Constraint c6( x == 0.3 );
	kiwi::Constraint c7( y == 0.3 );

	LARGE_INTEGER pc1;
	LARGE_INTEGER pc2;
	LARGE_INTEGER pf;

	kiwi::Solver solver;
	QueryPerformanceFrequency( &pf );
	QueryPerformanceCounter( &pc1 );

	for( int i=0; i < 100; ++i )
	{
		solver.addConstraint( c1 );
		solver.addConstraint( c2 );
		solver.addConstraint( c3 );
		solver.addConstraint( c4 );
		solver.addConstraint( c5 );
		solver.addConstraint( c6 );
		try
		{
			solver.addConstraint( c7 );
		}
		catch( const kiwi::UnsatisfiableConstraint& e )
		{

		}
	}

	solver.solve();
	QueryPerformanceCounter( &pc2 );

	solver.dump();

	std::cout << std::endl;
	std::cout << double( pc2.QuadPart - pc1.QuadPart ) / double( pf.QuadPart ) << std::endl;
	std::cout << std::endl;


	std::cout << "x: " << x.value() << std::endl;
	std::cout << "y: " << y.value() << std::endl;
	std::cout << "z: " << z.value() << std::endl;


	return 0;
}
