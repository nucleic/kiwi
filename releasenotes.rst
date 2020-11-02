Kiwi Release Notes
==================

Wrappers 1.3.1 | Solver 1.3.1 | 11/01/2020
------------------------------------------
- allow to avoid linking against VC2014_1 on windows PR #97
- do not mark move constructor / assignment operator of expression as noexcept PR #97
  This is to circumvent a suspected bug in the GCC compiler in the manylinux1
  image.

Wrappers 1.3.0 | Solver 1.3.0 | 10/21/2020
------------------------------------------
- add c++ benchmarks and run them on CIs PR #91
- modernize the c++ code by using more c++11 features PR #90
- introduce move semantic in some c++ constructors to improve performances PR #89
- add support for Python 3.9 PR #88

Wrappers 1.2.0 | Solver 1.2.0 | 03/26/2020
------------------------------------------
- make the the c++ part of the code c++11 compliant  PR #55
- use cppy for Python/C bindings  PR #55

Wrappers 1.1.0 | Solver 1.1.0 | 04/24/2019
------------------------------------------
- prevent attempting a dual optimize on a dummy row PR #56 closes #15
- add ``dump`` and ``dumps`` methods to inspect the internal state of the
  solver PR #56
- test on Python 3.7 PR #51
- improvements to setup.py and tests PR #46 #50

Wrappers 1.0.1 | Solver 1.0.0 | 10/24/2017
------------------------------------------
- allow unicode strings for variable name in Python 2
- allow unicode strings as strength specifiers in Python 2

Wrappers 1.0.0 | Solver 1.0.0 | 09/06/2017
------------------------------------------
- Allow anonymous variables (solver PR #32, wrappers PR #22)
- Solver: Define binary operators as free functions (PR #23)
- Wrappers: support for Python 3 (PR #13)
- Wrappers: drop distribute dependency in favor of setuptools (PR #22)
- Wrappers: add a comprehensive test suite

Wrappers 0.1.3 | Solver 0.1.1 | 07/12/2013
------------------------------------------
- Update the build script to remove the need for build.py

Wrappers 0.1.2 | Solver 0.1.1 | 01/15/2013
------------------------------------------
- Fix issue #2. Bad handling of zero-size constraints.

Wrappers 0.1.1 | Solver 0.1.0 | 01/13/2013
------------------------------------------
- Initial public release.
