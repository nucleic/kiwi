#include <iostream>
#include <sys/time.h>

#include "kiwi.h"


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

	//for( int i=0; i < 100000; ++i )
	{

	kiwi::Solver solver;
	solver.addConstraint( c1 );
	solver.addConstraint( c2 );
	solver.addConstraint( c3 );
	solver.addConstraint( c4 );
	solver.addConstraint( c5 );
	solver.solve();
	solver.dump();
	}

	/*
	std::cout << "x: " << x.value() << std::endl;
	std::cout << "y: " << y.value() << std::endl;
	std::cout << "z: " << z.value() << std::endl;
	*/
	return 0;
}
