#------------------------------------------------------------------------------
# Copyright (c) 2019, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
"""Time updating an EditVariable in a set of constraints typical of enaml use.

"""
import perf
from kiwisolver import Variable, Solver, strength

solver = Solver()

# Create custom strength
mmedium = strength.create(0, 1, 0, 1.25)
smedium = strength.create(0, 100, 0)

# Create the variable
left = Variable('left')
height = Variable('height')
top = Variable('top')
width = Variable('width')
contents_top = Variable('contents_top')
contents_bottom = Variable('contents_bottom')
contents_left = Variable('contents_left')
contents_right = Variable('contents_right')
midline = Variable('midline')
ctleft = Variable('ctleft')
ctheight = Variable('ctheight')
cttop = Variable('cttop')
ctwidth = Variable('ctwidth')
lb1left = Variable('lb1left')
lb1height = Variable('lb1height')
lb1top = Variable('lb1top')
lb1width = Variable('lb1width')
lb2left = Variable('lb2left')
lb2height = Variable('lb2height')
lb2top = Variable('lb2top')
lb2width = Variable('lb2width')
lb3left = Variable('lb3left')
lb3height = Variable('lb3height')
lb3top = Variable('lb3top')
lb3width = Variable('lb3width')
fl1left = Variable('fl1left')
fl1height = Variable('fl1height')
fl1top = Variable('fl1top')
fl1width = Variable('fl1width')
fl2left = Variable('fl2left')
fl2height = Variable('fl2height')
fl2top = Variable('fl2top')
fl2width = Variable('fl2width')
fl3left = Variable('fl3left')
fl3height = Variable('fl3height')
fl3top = Variable('fl3top')
fl3width = Variable('fl3width')

# Add the edit variables
solver.addEditVariable(width, 'strong')
solver.addEditVariable(height, 'strong')

# Add the constraints
for c in [(left + -0 >= 0) | "required",
          (height + 0 == 0) | "medium",
          (top + -0 >= 0) | "required",
          (width + -0 >= 0) | "required",
          (height + -0 >= 0) | "required",
          (- top +  contents_top + -10 == 0) | "required",
          (lb3height + -16 == 0) | "strong",
          (lb3height + -16 >= 0) | "strong",
          (ctleft + -0 >= 0) | "required",
          (cttop + -0 >= 0) | "required",
          (ctwidth + -0 >= 0) | "required",
          (ctheight + -0 >= 0) | "required",
          (fl3left + -0 >= 0) | "required",
          (ctheight + -24 >= 0) | smedium,
          (ctwidth + -1.67772e+07 <= 0) | smedium,
          (ctheight + -24 <= 0) | smedium,
          (fl3top + -0 >= 0) | "required",
          (fl3width + -0 >= 0) | "required",
          (fl3height + -0 >= 0) | "required",
          (lb1width + -67 == 0) | "weak",
          (lb2width + -0 >= 0) | "required",
          (lb2height + -0 >= 0) | "required",
          (fl2height + -0 >= 0) | "required",
          (lb3left + -0 >= 0) | "required",
          (fl2width + -125 >= 0) | "strong",
          (fl2height + -21 == 0) | "strong",
          (fl2height + -21 >= 0) | "strong",
          (lb3top + -0 >= 0) | "required",
          (lb3width + -0 >= 0) | "required",
          (fl1left + -0 >= 0) | "required",
          (fl1width + -0 >= 0) | "required",
          (lb1width + -67 >= 0) | "strong",
          (fl2left + -0 >= 0) | "required",
          (lb2width + -66 == 0) | "weak",
          (lb2width + -66 >= 0) | "strong",
          (lb2height + -16 == 0) | "strong",
          (fl1height + -0 >= 0) | "required",
          (fl1top + -0 >= 0) | "required",
          (lb2top + -0 >= 0) | "required",
          (- lb2top +  lb3top + - lb2height + -10 == 0) | mmedium,
          (- lb3top + - lb3height +  fl3top + -10 >= 0) | "required",
          (- lb3top + - lb3height +  fl3top + -10 == 0) | mmedium,
          (contents_bottom + - fl3height + - fl3top + -0 == 0) | mmedium,
          (fl1top + - contents_top + 0 >= 0) | "required",
          (fl1top + - contents_top + 0 == 0) | mmedium,
          (contents_bottom + - fl3height + - fl3top + -0 >= 0) | "required",
          (- left + - width +  contents_right + 10 == 0) | "required",
          (- top + - height +  contents_bottom + 10 == 0) | "required",
          (- left +  contents_left + -10 == 0) | "required",
          (lb3left + - contents_left + 0 == 0) | mmedium,
          (fl1left + - midline + 0 == 0) | "strong",
          (fl2left + - midline + 0 == 0) | "strong",
          (ctleft + - midline + 0 == 0) | "strong",
          (fl1top + 0.5 * fl1height + - lb1top + -0.5 * lb1height + 0 == 0) | "strong",
          (lb1left + - contents_left + 0 >= 0) | "required",
          (lb1left + - contents_left + 0 == 0) | mmedium,
          (- lb1left +  fl1left + - lb1width + -10 >= 0) | "required",
          (- lb1left +  fl1left + - lb1width + -10 == 0) | mmedium,
          (- fl1left +  contents_right + - fl1width + -0 >= 0) | "required",
          (width + 0 == 0) | "medium",
          (- fl1top +  fl2top + - fl1height + -10 >= 0) | "required",
          (- fl1top +  fl2top + - fl1height + -10 == 0) | mmedium,
          (cttop + - fl2top + - fl2height + -10 >= 0) | "required",
          (- ctheight + - cttop +  fl3top + -10 >= 0) | "required",
          (contents_bottom + - fl3height + - fl3top + -0 >= 0) | "required",
          (cttop + - fl2top + - fl2height + -10 == 0) | mmedium,
          (- fl1left +  contents_right + - fl1width + -0 == 0) | mmedium,
          (- lb2top + -0.5 * lb2height +  fl2top + 0.5 * fl2height + 0 == 0) | "strong",
          (- contents_left +  lb2left + 0 >= 0) | "required",
          (- contents_left +  lb2left + 0 == 0) | mmedium,
          (fl2left + - lb2width + - lb2left + -10 >= 0) | "required",
          (- ctheight + - cttop +  fl3top + -10 == 0) | mmedium,
          (contents_bottom + - fl3height + - fl3top + -0 == 0) | mmedium,
          (lb1top + -0 >= 0) | "required",
          (lb1width + -0 >= 0) | "required",
          (lb1height + -0 >= 0) | "required",
          (fl2left + - lb2width + - lb2left + -10 == 0) | mmedium,
          (- fl2left + - fl2width +  contents_right + -0 == 0) | mmedium,
          (- fl2left + - fl2width +  contents_right + -0 >= 0) | "required",
          (lb3left + - contents_left + 0 >= 0) | "required",
          (lb1left + -0 >= 0) | "required",
          (0.5 * ctheight +  cttop + - lb3top + -0.5 * lb3height + 0 == 0) | "strong",
          (ctleft + - lb3left + - lb3width + -10 >= 0) | "required",
          (- ctwidth + - ctleft +  contents_right + -0 >= 0) | "required",
          (ctleft + - lb3left + - lb3width + -10 == 0) | mmedium,
          (fl3left + - contents_left + 0 >= 0) | "required",
          (fl3left + - contents_left + 0 == 0) | mmedium,
          (- ctwidth + - ctleft +  contents_right + -0 == 0) | mmedium,
          (- fl3left +  contents_right + - fl3width + -0 == 0) | mmedium,
          (- contents_top +  lb1top + 0 >= 0) | "required",
          (- contents_top +  lb1top + 0 == 0) | mmedium,
          (- fl3left +  contents_right + - fl3width + -0 >= 0) | "required",
          (lb2top + - lb1top + - lb1height + -10 >= 0) | "required",
          (- lb2top +  lb3top + - lb2height + -10 >= 0) | "required",
          (lb2top + - lb1top + - lb1height + -10 == 0) | mmedium,
          (fl1height + -21 == 0) | "strong",
          (fl1height + -21 >= 0) | "strong",
          (lb2left + -0 >= 0) | "required",
          (lb2height + -16 >= 0) | "strong",
          (fl2top + -0 >= 0) | "required",
          (fl2width + -0 >= 0) | "required",
          (lb1height + -16 >= 0) | "strong",
          (lb1height + -16 == 0) | "strong",
          (fl3width + -125 >= 0) | "strong",
          (fl3height + -21 == 0) | "strong",
          (fl3height + -21 >= 0) | "strong",
          (lb3height + -0 >= 0) | "required",
          (ctwidth + -119 >= 0) | smedium,
          (lb3width + -24 == 0) | "weak",
          (lb3width + -24 >= 0) | "strong",
          (fl1width + -125 >= 0) | "strong",
          ]:
    solver.addConstraint(c)


def bench_update_variables(loops, solver):
    """Suggest new values and update variables.

    This mimic the use of kiwi in enaml in the case of a resizing.

    """
    t0 = perf.perf_counter()
    for w, h in [(400, 600), (600, 400), (800, 1200), (1200, 800),
                (400, 800), (800, 400)]*loops:
        solver.suggestValue(width, w)
        solver.suggestValue(height, h)
        solver.updateVariables()

    return perf.perf_counter() - t0


runner = perf.Runner()
runner.bench_time_func('kiwi.suggestValue', bench_update_variables,
                       solver, inner_loops=1)
