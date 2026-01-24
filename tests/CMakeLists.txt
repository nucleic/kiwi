# --------------------------------------------------------------------------------------
# Copyright (c) 2013-2026, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------


enable_testing()

include(FetchContent)

FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG v1.16.0
)
FetchContent_MakeAvailable(googletest)

set(sources
    SimplexTest.cpp
    VariableTest.cpp
    TermTest.cpp
    ExpressionTest.cpp
    ConstraintTest.cpp
    StrengthTest.cpp
    SolverTest.cpp
)

source_group(TREE "${CMAKE_CURRENT_SOURCE_DIR}" FILES ${sources})

add_executable(kiwi_tests)
target_compile_features(kiwi_tests PRIVATE cxx_std_23)
target_sources(kiwi_tests PRIVATE ${sources})

target_link_libraries(
    kiwi_tests
    kiwi::kiwi
    GTest::gtest_main
)

include(GoogleTest)
gtest_discover_tests(kiwi_tests)