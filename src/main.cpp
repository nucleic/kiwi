#include <iostream>
#include "kiwi.h"


int main( int argc, char* argv[] )
{
	kiwi::Variable x( "x" );
	kiwi::Variable y( "y" );
	kiwi::Variable z( "z" );

	kiwi::Constraint c1( 2 * x + 3 * y - 4 * z <= 20 );
	kiwi::Constraint c2( x <= 10 );
	kiwi::Constraint c3( y >= 20 );
	kiwi::Constraint c4( x == 1, kiwi::strength::weak );
	kiwi::Constraint c5( x == 0.5, kiwi::strength::medium );
	kiwi::Constraint c6( x == 0.3, kiwi::strength::strong );

	kiwi::Solver solver;

	for( int i=0; i < 1000; ++i )
	{
		solver.reset();

		solver.addConstraint( c1 );
		solver.addConstraint( c2 );
		solver.addConstraint( c3 );
		solver.addConstraint( c4 );
		solver.addConstraint( c5 );
		solver.addConstraint( c6 );

		solver.removeConstraint( c4 );
		solver.removeConstraint( c5 );

		solver.solve();
	}

	solver.dump();
	std::cout << std::endl;

	std::cout << "x: " << x.value() << std::endl;
	std::cout << "y: " << y.value() << std::endl;
	std::cout << "z: " << z.value() << std::endl;

	return 0;
}
