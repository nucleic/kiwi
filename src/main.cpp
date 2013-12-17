#include <iostream>
#include "kiwi.h"
#include <sys/time.h>


#define CLOCK_REALTIME 0


int clock_gettime( int, timespec* t )
{
	timeval now;
	int rv = gettimeofday( &now, 0 );
	if( rv )
		return rv;
	t->tv_sec = now.tv_sec;
	t->tv_nsec = now.tv_usec * 1000;
	return 0;
}


int main( int argc, char* argv[] )
{
	kiwi::Variable x( "x" );
	kiwi::Variable y( "y" );
	kiwi::Variable z( "z" );

	kiwi::Constraint c1( 2 * x + 3 * y - 4 * z <= 20 );
	kiwi::Constraint c2( x <= 10 );
	kiwi::Constraint c3( y >= 10 );
	kiwi::Constraint c4( x <= 10 );
	kiwi::Constraint c5( y >= 0 );
	kiwi::Constraint c6( x <= y );
	kiwi::Constraint c7( z <= 500 );
	kiwi::Constraint c8( z >= -500 );

	kiwi::Solver solver;

	solver.addConstraint( c1 );
	solver.addConstraint( c2 );
	solver.addConstraint( c3 );
	solver.addConstraint( c4 );
	solver.addConstraint( c5 );
	solver.addConstraint( c6 );
	solver.addConstraint( c7 );
	solver.addConstraint( c8 );

	solver.addEditVariable( x, kiwi::strength::weak );

	timespec end;
	timespec start;

	clock_gettime( CLOCK_REALTIME, &start );

	solver.suggestValue( x, -30 );
	solver.solve();

	clock_gettime( CLOCK_REALTIME, &end );

	std::cout << "secs: " << end.tv_sec - start.tv_sec << std::endl;
	std::cout << "nano: " << end.tv_nsec - start.tv_nsec << std::endl;


	std::cout << "x: " << x.value() << std::endl;
	std::cout << "y: " << y.value() << std::endl;
	std::cout << "z: " << z.value() << std::endl;

	return 0;
}
