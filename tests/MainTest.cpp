/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

#include "kiwi/strength.h"
#include "kiwi/variable.h"
#include <gtest/gtest.h>
#include <kiwi/kiwi.h>

using namespace kiwi;

// https://edshare.soton.ac.uk/2458/1/MA230exam98_1.pdf
TEST(MainTest, Test1) {
    const auto x1 = Variable("x1");
    const auto x2 = Variable("x2");
    const auto x3 = Variable("x3");
    const auto z = Variable("z");
    
    Solver solver;
    // put base constraints
    solver.addConstraint(x1 >= 0);
    solver.addConstraint(x2 >= 0);
    solver.addConstraint(x3 >= 0);
    // put in constraints
    solver.addConstraint(2 * x1 - 5 * x2 <= 11);
    solver.addConstraint(-x1 + 3 * x2 + x3 == 7);
    solver.addConstraint(x1 - 8 * x2 + 4 * x3 >= 33);
    // tell solver to maximize
    solver.addConstraint(z == -2 * x1 + 7 * x2 + 4 * x3);
    solver.addEditVariable(z, strength::weak);
    solver.suggestValue(z, 1e+6);
    // Solve
    solver.updateVariables();
    
    EXPECT_NEAR(x1.value(), 13.0, 1e-2);
    EXPECT_NEAR(x2.value(), 3.0, 1e-2);
    EXPECT_NEAR(x3.value(), 11.0, 1e-2);
    EXPECT_NEAR(z.value(), 39.0, 1e-2);
}