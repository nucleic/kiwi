# Welcome to Kiwi

[![Continuous Integration](https://github.com/nucleic/kiwi/workflows/Continuous%20Integration/badge.svg)](https://github.com/nucleic/kiwi/actions)
[![Documentation building](https://github.com/nucleic/kiwi/workflows/Documentation%20building/badge.svg)](https://github.com/nucleic/kiwi/actions)
[![codecov](https://codecov.io/gh/nucleic/kiwi/branch/main/graph/badge.svg)](https://codecov.io/gh/nucleic/kiwi)
[![Documentation Status](https://readthedocs.org/projects/kiwisolver/badge/?version=latest)](https://kiwisolver.readthedocs.io/en/latest/?badge=latest)

Kiwi is an efficient C++ implementation of the Cassowary constraint solving
algorithm. Kiwi is an implementation of the algorithm based on the
[seminal Cassowary paper](https://constraints.cs.washington.edu/solvers/cassowary-tochi.pdf).
It is *not* a refactoring of the original C++ solver. Kiwi has been designed
from the ground up to be lightweight and fast. Kiwi ranges from 10x to 500x
faster than the original Cassowary solver with typical use cases gaining a 40x
improvement. Memory savings are consistently > 5x.

In addition to the C++ solver, Kiwi ships with hand-rolled Python bindings.

# How to use
## C++ with CMake
Write the following in your CMakeLists.txt to include Kiwi as a dependency:
``` cmake
include(FetchContent)

FetchContent_Declare(
    kiwi
    GIT_REPOSITORY https://github.com/nucleic/kiwi
    GIT_TAG        {release name}
)

FetchContent_MakeAvailable(kiwi)

target_link_libraries(your_target PRIVATE kiwi::kiwi)
```
C++ code example:
``` cpp
#include <kiwi/kiwi.h>
#include <iostream>

int main() {
    // initialize the solver
    kiwi::Solver solver;
    // initialize the variables
    kiwi::Variable x = kiwi::Variable("x");
    kiwi::Variable y = kiwi::Variable("y");
    solver.addConstraint(x + y == 10);
    solver.addConstraint(x - y == 4);
    // solve the system of equations
    solver.updateVariables();
    std::cout << "x: " << x.value() << ", y: " << y.value() << std::endl;
    // Output: x: 7, y: 3
    return 0;
}
```
You can also use tests to see more examples of how to use the solver: [SimlpexTest](https://github.com/nucleic/kiwi/blob/main/tests/SimplexTest.cpp) and [SolverTest](https://github.com/nucleic/kiwi/blob/main/tests/SolverTest.cpp).