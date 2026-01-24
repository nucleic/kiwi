# --------------------------------------------------------------------------------------
# Copyright (c) 2013-2026, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------

# Benchmark executable
add_executable(kiwi_benchmark
    enaml_like_benchmark.cpp
)

# Link with kiwi header-only library
target_link_libraries(kiwi_benchmark PRIVATE kiwi::kiwi)

# Include nanobench header from this directory
target_include_directories(kiwi_benchmark PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})

# Add output message
if(CMAKE_BUILD_TYPE MATCHES "Release")
    message(STATUS "Benchmark will be built in Release mode for accurate performance measurements")
endif()

# Optional: enable optimizations for benchmarks
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(kiwi_benchmark PRIVATE -O3 -march=native)
elseif(CMAKE_CXX_COMPILER_ID MATCHES "MSVC")
    target_compile_options(kiwi_benchmark PRIVATE /O2)
endif()