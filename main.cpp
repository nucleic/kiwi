#include <iostream>
#include "kiwi/kiwi.h"
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
	// main widget
	kiwi::Variable x0( "x0" );
	kiwi::Variable y0( "y0" );
	kiwi::Variable w0( "w0" );
	kiwi::Variable h0( "h0" );

	// widget 1
	kiwi::Variable x1( "x1" );
	kiwi::Variable y1( "y1" );
	kiwi::Variable w1( "w1" );
	kiwi::Variable h1( "h1" );

	// widget 2
	kiwi::Variable x2( "x2" );
	kiwi::Variable y2( "y2" );
	kiwi::Variable w2( "w2" );
	kiwi::Variable h2( "h2" );

	// widget 3
	kiwi::Variable x3( "x3" );
	kiwi::Variable y3( "y3" );
	kiwi::Variable w3( "w3" );
	kiwi::Variable h3( "h3" );

	// widget 4
	kiwi::Variable x4( "x4" );
	kiwi::Variable y4( "y4" );
	kiwi::Variable w4( "w4" );
	kiwi::Variable h4( "h4" );

	// widget 1
	kiwi::Variable x5( "x5" );
	kiwi::Variable y5( "y5" );
	kiwi::Variable w5( "w5" );
	kiwi::Variable h5( "h5" );

	// widget 2
	kiwi::Variable x6( "x6" );
	kiwi::Variable y6( "y6" );
	kiwi::Variable w6( "w6" );
	kiwi::Variable h6( "h6" );

	// widget 3
	kiwi::Variable x7( "x7" );
	kiwi::Variable y7( "y7" );
	kiwi::Variable w7( "w7" );
	kiwi::Variable h7( "h7" );

	// widget 4
	kiwi::Variable x8( "x8" );
	kiwi::Variable y8( "y8" );
	kiwi::Variable w8( "w8" );
	kiwi::Variable h8( "h8" );

	// widget 1
	kiwi::Variable x9( "x9" );
	kiwi::Variable y9( "y9" );
	kiwi::Variable w9( "w9" );
	kiwi::Variable h9( "h9" );

	// widget 2
	kiwi::Variable x10( "x10" );
	kiwi::Variable y10( "y10" );
	kiwi::Variable w10( "w10" );
	kiwi::Variable h10( "h10" );

	// widget 3
	kiwi::Variable x11( "x11" );
	kiwi::Variable y11( "y11" );
	kiwi::Variable w11( "w11" );
	kiwi::Variable h11( "h11" );

	// widget 4
	kiwi::Variable x12( "x12" );
	kiwi::Variable y12( "y12" );
	kiwi::Variable w12( "w12" );
	kiwi::Variable h12( "h12" );

	kiwi::Constraint cns[] = {
		x0 >= 0,
		y0 >= 0,
		h0 >= 0,
		w0 >= 0,

		x1 >= 0,
		y1 >= 0,
		h1 >= 0,
		w1 >= 0,

		x2 >= 0,
		y2 >= 0,
		h2 >= 0,
		w2 >= 0,

		x3 >= 0,
		y3 >= 0,
		h3 >= 0,
		w3 >= 0,

		x4 >= 0,
		y4 >= 0,
		h4 >= 0,
		w4 >= 0,

		x5 >= 0,
		y5 >= 0,
		h5 >= 0,
		w5 >= 0,

		x6 >= 0,
		y6 >= 0,
		h6 >= 0,
		w6 >= 0,

		x7 >= 0,
		y7 >= 0,
		h7 >= 0,
		w7 >= 0,

		x8 >= 0,
		y8 >= 0,
		h8 >= 0,
		w8 >= 0,

		x9 >= 0,
		y9 >= 0,
		h9 >= 0,
		w9 >= 0,

		x10 >= 0,
		y10 >= 0,
		h10 >= 0,
		w10 >= 0,

		x11 >= 0,
		y11 >= 0,
		h11 >= 0,
		w11 >= 0,

		x12 >= 0,
		y12 >= 0,
		h12 >= 0,
		w12 >= 0,

		x0 + 10 == x1,
		x1 + w1 + 10 == x0 + w0,

		x1 == 1.0 * x2,
		x2 == 1.0 * x3,
		x3 == 1.0 * x4,
		x4 == 1.0 * x5,
		x5 == 1.0 * x6,
		x6 == 1.0 * x7,
		x7 == 1.0 * x8,
		x8 == 1.0 * x9,
		x9 == 1.0 * x10,
		x10 == 1.0 * x11,
		x11 == 1.0 * x12,

		w1 == 1.0 * w2,
		w2 == 1.0 * w3,
		w3 == 1.0 * w4,
		w4 == 1.0 * w5,
		w5 == 1.0 * w6,
		w6 == 1.0 * w7,
		w7 == 1.0 * w8,
		w8 == 1.0 * w9,
		w9 == 1.0 * w10,
		w10 == 1.0 * w11,
		w11 == 1.0 * w12,

		y0 + 10 == y1,
		y1 + h1 + 10 == y2,
		y2 + h2 + 10 == y3,
		y3 + h3 + 10 == y4,
		y4 + h4 + 10 == y5,
		y5 + h5 + 10 == y6,
		y6 + h6 + 10 == y7,
		y7 + h7 + 10 == y8,
		y8 + h8 + 10 == y9,
		y9 + h9 + 10 == y10,
		y10 + h10 + 10 == y11,
		y11 + h11+ 10 == y12,
		y12 + h12 + 10 == y0 + h0,

		h1 == 1.0 * h2,
		h2 == 1.0 * h3,
		h3 == 1.0 * h4,
		h4 == 1.0 * h5,
		h5 == 1.0 * h6,
		h6 == 1.0 * h7,
		h7 == 1.0 * h8,
		h8 == 1.0 * h9,
		h9 == 1.0 * h10,
		h10 == 1.0 * h11,
		h11 == 1.0 * h12
	};

	timespec end;
	timespec start;


	kiwi::Solver solver;

	for( const kiwi::Constraint& cn : cns )
		solver.addConstraint( cn );

	solver.addEditVariable( w0, kiwi::strength::weak );
	solver.addEditVariable( h0, kiwi::strength::weak );

	for(int i = 100; i < 600; ++i )
	{

		clock_gettime( CLOCK_REALTIME, &start );
		solver.suggestValue( w0, i );
		solver.suggestValue( h0, i );
		solver.solve();
		clock_gettime( CLOCK_REALTIME, &end );
		std::cout << "nano: " << end.tv_nsec - start.tv_nsec << std::endl;
	}



	kiwi::Variable vars[] = {
		x0, y0, w0, h0,
		x1, y1, w1, h1,
		x2, y2, w2, h2,
		x3, y3, w3, h3,
		x4, y4, w4, h4,
		x5, y5, w5, h5,
		x6, y6, w6, h6,
		x7, y7, w7, h7,
		x8, y8, w8, h8,
		x9, y9, w9, h9,
		x10, y10, w10, h10,
		x11, y11, w11, h11,
		x12, y12, w12, h12
	};

	for( const kiwi::Variable& v : vars )
		std::cout << v.name() << ": " << v.value() << std::endl;

	return 0;
}
