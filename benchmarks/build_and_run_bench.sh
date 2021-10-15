#!/bin/bash

set -o errexit -o nounset  # fail on error or on unset variables

# set default values if variables are unset
: "${CXX_COMPILER:=g++}"
: "${CXX_FLAGS:=-std=c++11}"

"$CXX_COMPILER" ${CXX_FLAGS} -O2 -Wall -pedantic -I.. enaml_like_benchmark.cpp -o run_bench

./run_bench
