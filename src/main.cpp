#include <iostream>
#include "kiwi.h"


int main( int argc, char* argv[] )
{
	kiwi::Variable x( "x" );
	kiwi::Variable y( "y" );
	kiwi::Variable z( "z" );

	kiwi::Constraint c1( 2 * x + 3 * y - 4 * z <= 20 );
	kiwi::Constraint c2( x <= 10 );
	kiwi::Constraint c3( y >= 10 );

	kiwi::Solver solver;

	solver.addConstraint( c1 );
	solver.addConstraint( c2 );
	solver.addConstraint( c3 );

	std::cout << "First-----------------" << std::endl;
	solver.solve();
	solver.dump();
	std::cout << std::endl;

	std::cout << "Second-----------------" << std::endl;
	solver.addEditVariable( x, kiwi::strength::weak );
	solver.solve();
	solver.dump();

	std::cout << std::endl;

	std::cout << "Fourth-----------------" << std::endl;
	solver.suggestValue( x, -25.0 );
	solver.dump();
	std::cout << std::endl;

	std::cout << "Fifth-----------------" << std::endl;
	solver.solve();
	solver.dump();
	std::cout << std::endl;


	std::cout << "x: " << x.value() << std::endl;
	std::cout << "y: " << y.value() << std::endl;
	std::cout << "z: " << z.value() << std::endl;


	return 0;
}
