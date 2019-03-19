.. _basis-basic-systems:

Constraints definition and system solving
=========================================

.. include:: ../substitutions.sub

A system in Kiwi is defined by a set of contraints that can be either
equalities or inequalities (>= and <= only, strict inequalities are not
accepted), each of which can have an associated strength making more or less
important to respect when solving the problem. The next sections will cover how
to define those constraints and extract the result from the solver.

Defining variables and constraints
----------------------------------

The first things that need to be defined are variables. Variables represent
the values which the solver will be trying to determine. Variables are
represented by |Variable| objects which can be created as follow:

.. tabs::

    .. code-tab:: python

        from kiwisolver import Variable

        x1 = Variable('x1')
        x2 = Variable('x2')
        xm = Variable('xm')

    .. code-tab:: c++

        #include <kiwi/kiwi.h>

        using namespace kiwi

        Variable x1("x1");
        Variable x2("x2");
        Variable xm("xm");

.. note::

    Naming your variables is not mandatory but it is recommended since it will
    help the solver in providing more meaningful error messages.

Now that we have some variables we can define our constraints.

.. tabs::

    .. code-tab:: python

        constraints = [x1 >= 0, x2 <= 100, x2 >= x1 + 10, xm == (x1 + x2) / 2]

    .. code-tab:: c++

        Constraint constraints[] = { Constraint {x1 >= 0},
                                     Constraint {x2 <= 100},
                                     Constraint {x2 >= x1 + 20},
                                     Constraint {xm == (x1 + x2) / 2}
                                    };

The next step is to add them to our solver, which is an instance of |Solver|:

.. tabs::

    .. code-tab:: python

        from kiwisolver import Solver

        solver = Solver()

        for cn in constraints:
            solver.addConstraint(cn)

    .. code-tab:: c++

        Solver solver;

        for(auto& constraint : constraints)
        {
            solver.addConstraint(constraint);
        }

.. note::

    You do not have to create all your variables before starting adding
    constraints to the solver.

So far we have defined a system representing three points on the segment
[0, 100], with one of them being the middle of the others which cannot get
closer than 10. All those constraints have to be satisfied, in the context
of cassowary they are "required" constraints.

.. note::

    Cassowary (and Kiwi) supports to have redundant constraints, meaning that
    even if having two constraints (x == 10, x+y == 30) is equivalent to a
    third one (y == 20), all three can be added to the solver without issue.

    However, one should not add multiple times the same constraint (in the same
    form) to the solver.


Managing constraints strength
-----------------------------

Cassowary also supports constraints that are not required. Those are only
respected on a best effort basis. To express that a constraint is not required
we need to assign it a *strength*. Kiwi defines three standard strengths in
addition of the "required" strength: strong, medium, weak. A strong constraint
will always win over a medium constraints which will always win over a weak
constraint [#f1]_ .

Lets assume than in our example x1 would like to be at 40, but it does not have
to. This is translated as follow:

.. tabs::

    .. code-tab:: python

        solver.addConstraint((x1 == 40) | "weak")

    .. code-tab:: c++

        solver.addConstraint(x1 == 40, strength::weak);


Adding edit variables
---------------------

So far our system is pretty static, we have no way of trying to find solutions
for a particular value of `xm` lets say. This is a problem. In a real
application (for a GUI layout), we would like to find the size of the widgets
based on the top window but also react to the window resizing so actually
adding and removing constraints all the time wouldn't be optimal. And there is
a better way: edit variables.

Edit variables are variables for which you can suggest values. Edit variable
have a strength whcih can be at most strong (the value of a edit variable can
never be required).

For the sake of our example we will make "xm" editable:

.. tabs::

    .. code-tab:: python

        solver.addEditVariable(xm, 'strong')

    .. code-tab:: c++

        solver.addEditVariable(xm, strength::strong);

Once a variable has been added as an edit variable, you can suggest a value for
it and the solver will try to solve the system with it.

.. tabs::

    .. code-tab:: python

        solver.suggestValue(xm, 60)

    .. code-tab:: c++

        solver.suggestValue(xm, 60);

This gives the following solution: ``xm == 60, x1 == 40, x2 == 80``.


Solving and updating variables
------------------------------

Kiwi solves the system each time a constraint is added or removed, or a new
value is suggested for an edit variable. Solving the system each time make for
faster updates and allow to keep the solver in a consinstent state. However,
the variable values are not updated automatically and you need to ask
the solver to perform this operation before reading the values as illustrated
below:

.. tabs::

    .. code-tab:: python

        solver.suggestValue(xm, 90)
        solver.updateVariables()
        print(xm.value(), x1.value(), x2.value())

    .. code-tab:: c++

        solver.suggestValue(xm, 90);
        solver.updateVariables();
        std::cout << xm.value() << ", " << x1.value() << ", " << x2.value();

This last update creates an infeasible situation by pushing x2 further than
100 if we keep x1 where it would like to be and as a consequence we get the
following solution: ``xm == 90, x1 == 80, x2 == 100``


Footnotes
---------

.. [#f1] Actually there are some corner cases in which this can be violated.
         See :ref:`basics-internals`
