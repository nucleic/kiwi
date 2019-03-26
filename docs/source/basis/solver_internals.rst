.. _basics-internals:

Solver internals and tips
=========================

.. include:: ../substitutions.sub

Kiwi is not a simple re-writing of Cassowary and because of that Kiwi does not
always perfectly reflects the original implementation. The following sections
points out those "discrepancies" and give some tips on how to work with
Kiwi.


Inspecting the solver state
---------------------------

The state of the solver can be inspected by dumping a text representation of
its state either to stdout using the ``dump`` method of the solver, or to a
string using the ``dumps`` method. Typically at least a basic understanding of
the Cassowary algorithm is necessary to analyse the output.

A typical output is reproduced below:


.. code::

    Objective
    ---------
    -2 + 2 * e2 + 1 * s8 + -2 * s10

    Tableau
    -------
    v1 | 1 + 1 * s10
    e3 | -1 + 1 * e2 + -1 * s10
    v4 | -1 + -1 * d5 + -1 * s10
    s6 | -2 + -1 * s10
    e9 | -1 + 1 * s8 + -1 * s10

    Infeasible
    ----------
    e3
    e9

    Variables
    ---------
    bar = v1
    foo = v4

    Edit Variables
    --------------
    bar

    Constraints
    -----------
    1 * bar + -0 >= 0  | strength = 1
    1 * bar + 1 <= 0  | strength = 1.001e+09
    1 * foo + 1 * bar + 0 == 0  | strength = 1.001e+09
    1 * bar + 0 == 0  | strength = 1

In the dump, the letters have the following meaning:

- v: external variable, corresponds to the variable created by you the user
- s: slack symbol, used to represent inequalities
- e: error symbol, used to represent non-required constraints
- d: dummy variable, always zero, used to keep track of the impact of an
  external variable in the tableau.
- i: invalid symbol, returned when no valid symbol can be found.


Stay contraints emulation
-------------------------

One feature of Cassowary that Kiwi abandonned is the notion of stay
constraints. Stay constraints are typically used in under-constrained
situations (drag and drop) to allow the solver to find a solution by keeping
non-modified variable close to their original position. A typical example is
a rectangle whose one corner is being dragged in a drawing application.

Kiwi does not have stay constraints mostly because in the context of widget
placement the system is usually well constrained and stay constraints are hence
unecessary.

If your application requires them, several workarounds can be considered:

- adding/removing non-required equality constraints to mimic stay constraints
- using edit-variables to mimic stay constraints

The first method will require to remove the old constraints as soon as they
stop making sense, while the second will require to update the suggested value.


Creating strengths and their internal representation
----------------------------------------------------

Kiwi provides three strengths in addition of the required strength by default:
"weak", "medium", "strong". Contrary to Cassowary, which uses lexicographic
ordering to ensure that strength are always respected, Kiwi strives for speed
and use simple floating point numbers.

.. note::

    Using simple floating point, means that is some rare corner case a large
    number of weak constraints may overcome a medium constraint. However in
    practice this rarely happens.

Kiwi allows to create custom strength in the following manner:

.. tabs::

    .. code-tab:: python

        from kiwisolver import strength

        my_strength = strength.create(1, 1, 1)
        my_strength2 = strength.create(1, 1, 1, 2)

    .. code-tab:: c++

        double my_strength = strength::create(1, 1, 1);
        double my_strength = strength::create(1, 1, 1, 2);

The first argument is multiplied by 1 000 000, the second argument by 1 000,
and the third by 1. No strength can be create larger than the required
strength. The default strengths in Kiwi corresponds to:

.. code:: python

    weak = strength.create(0, 0, 1)
    medium = strength.create(0, 1, 0)
    strong = strength.create(1, 0, 0)
    required = strength.create(1000, 1000, 1000)

While Cassowary differentiate between strength and weight, those two concepts
are fused in Kiwi: when creating a strength one can apply a weight (the fourth
argument) that will multiply it.

.. note::

    Because strengths are implemented as floating point number, in order to be
    effective strengths must be different enough from one another. The
    following is unlikely to produce any really useful result.

    .. code:: python

        weak1 = strength.create(0, 0, 1)
        weak2 = strength.create(0, 0, 2)
        weak3 = strength.create(0, 0, 3)


Managing memory
---------------

When removing a constraint, Kiwi does not check whether or not the variables
used in the constraints are still in use in other constraints. This is mostly
because such checks could be quite expensive. However this means the map of
variables can grow over time.

To avoid this causing large memory leaks, it is recommended to reset the solver
state (using the method of the same name) and add back the constraints that
are still valid at this point.


Representation of constraints
-----------------------------

If you browse through the API documentation you may notice a number of classes
that do not appear anywhere in this documentation: Term and Expression.

Those classes are used internally in constraints and are created automatically
by the library. A |Term| represents a variable/symbol and the coefficient that
multiplies it, |Expression| represents a sum of terms and a constant value and
is used as the left hand side of a constraint.


Performance implementation tricks
---------------------------------

Map type
^^^^^^^^

Kiwi uses maps to represent the state of the solver and to manipulate it. As a
consequence the map type should be fast, with a particular emphasis on
iteration. The C++ standard library provides unordered_map and map that could
be used in kiwi, but none of those are very friendly to the CPU cache. For
this reason, Kiwi uses the AssocVector class implemented in Loki (slightly
updated to respect c++11 standards). The use of this class provides a 2x
speedups over std::map.


Symbol representation
^^^^^^^^^^^^^^^^^^^^^

Symbol are used in Kiwi to represent the state of the solver. Since solving the
system requires a large number of manipulation of the symbols the operations
have to compile down to an efficient representation. In Kiwi, symbols compile
down to long long meaning that a vector of them fits in a CPU cache line.
