#!/bin/bash

g++ -std=c++11 -O2 -Wall -pedantic -I.. enaml_like_benchmark.cpp -lbenchmark -o run_bench
./run_bench
