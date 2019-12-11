.. _developer:

Developer notes
================

These notes are meant to help developers and contributors with regards to some
details of the implementation and coding style of the project.

C++ codebase
------------

The C++ codebase currently targets C++11 compliance. It is header-only since
one of the focus of the library is speed.


Python bindings
---------------

Python bindings targets Python 3.6 and above. The bindings are hand-written and
relies on cppy (https://github.com/nucleic/cppy). Kiwisolver tries to use a
reasonably modern C API and to support sub-interpreter, this has a couple of
consequences:

- all the non exported symbol are enclosed in anonymous namespaces
- kiwisolver does not use static types and only dynamical types (note that the
  type slots and related structures are stored in a static variable)
- modules use the multi-phases initialization mechanism as defined in
  PEP 489 -- Multi-phase extension module initialization
- static variables use is limited to type slots, method def
