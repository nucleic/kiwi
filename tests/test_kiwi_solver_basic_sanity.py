#------------------------------------------------------------------------------
# Copyright (c) 2013, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------

from kiwisolver import Solver, Variable, Constraint
import unittest


class KiwiSolverBasicSanityTests(unittest.TestCase):
    def test_adding_constraints_to_solver(self):
        s = Solver()
        x0 = Variable('x0')
        x1 = Variable('x1')
        s.addConstraint(x0 >= 0)
        s.addConstraint(x1 >= 0)
        s.solve()

        self.assertEqual(x0.value(), 0.0)
        self.assertEqual(x1.value(), 0.0)

if __name__ == '__main__':
    unittest.main()
