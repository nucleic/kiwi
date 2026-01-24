# --------------------------------------------------------------------------------------
# Copyright (c) 2013-2026, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------

cmake_minimum_required(VERSION 3.15)

# Read version from version.h
file(READ "${CMAKE_CURRENT_SOURCE_DIR}/kiwi/version.h" VERSION_FILE)
string(REGEX MATCH "KIWI_MAJOR_VERSION ([0-9]+)" _ ${VERSION_FILE})
set(KIWI_MAJOR_VERSION ${CMAKE_MATCH_1})
string(REGEX MATCH "KIWI_MINOR_VERSION ([0-9]+)" _ ${VERSION_FILE})
set(KIWI_MINOR_VERSION ${CMAKE_MATCH_1})
string(REGEX MATCH "KIWI_MICRO_VERSION ([0-9]+)" _ ${VERSION_FILE})
set(KIWI_MICRO_VERSION ${CMAKE_MATCH_1})

project(kiwi 
    VERSION ${KIWI_MAJOR_VERSION}.${KIWI_MINOR_VERSION}.${KIWI_MICRO_VERSION}
    LANGUAGES CXX
    DESCRIPTION "A fast implementation of the Cassowary constraint solver"
)

# Options
option(KIWI_BUILD_BENCHMARKS "Build benchmarks" OFF)

# C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Header-only library
add_library(kiwi INTERFACE)
add_library(kiwi::kiwi ALIAS kiwi)

target_include_directories(kiwi
    INTERFACE
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
        $<INSTALL_INTERFACE:include>
)

target_compile_features(kiwi INTERFACE cxx_std_11)

target_compile_options(kiwi INTERFACE
    $<$<CXX_COMPILER_ID:GNU,Clang,AppleClang>:
        -Wall 
        -Wextra
        -Wpedantic
    >
)

# Benchmarks
if(KIWI_BUILD_BENCHMARKS)
    add_subdirectory(benchmarks)
endif()

# Tests
# Only add tests when building the top-level project
if(CMAKE_PROJECT_NAME STREQUAL PROJECT_NAME)
    add_subdirectory(tests)
endif()

# Print configuration summary
message(STATUS "")
message(STATUS "Kiwi Configuration Summary:")
message(STATUS "  Version: ${PROJECT_VERSION}")
message(STATUS "  C++ Standard: C++${CMAKE_CXX_STANDARD}")
message(STATUS "  Build benchmarks: ${KIWI_BUILD_BENCHMARKS}")
message(STATUS "")
