.. kiwi documentation master file, created by
   sphinx-quickstart on Mon Oct 29 21:48:45 2018.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Kiwisolver's documentation!
======================================

Kiwisolver is an efficient C++ implementation of the Cassowary constraint
solving algorithm. Kiwi is an implementation of the algorithm based on the
seminal Cassowary paper. It is *not* a refactoring of the original C++ solver.
Kiwisolver has been designed from the ground up to be lightweight and fast.
Kiwisolver range from 10x to 500x faster than the original Cassowary solver
with typical use cases gaining a 40x improvement. Memory savings are
consistently > 5x.

In addition to the C++ solver, Kiwi ships with hand-rolled Python bindings.

.. toctree::
   :maxdepth: 2

   Getting started <basis/index.rst>
   Use cases <use_cases/index.rst>
   Developer notes <developer_notes/index.rst>
   API Documentation <api/index.rst>

Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
