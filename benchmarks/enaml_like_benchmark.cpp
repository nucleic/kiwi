/*-----------------------------------------------------------------------------
| Copyright (c) 2020, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

// Time updating an EditVariable in a set of constraints typical of enaml use.

#include <kiwi/kiwi.h>
#define ANKERL_NANOBENCH_IMPLEMENT
#include "nanobench.h"

using namespace kiwi;

void build_solver(Solver& solver, Variable& width, Variable& height)
{
    // Create custom strength
    double mmedium = strength::create(0.0, 1.0, 0.0, 1.25);
    double smedium = strength::create(0.0, 100, 0.0);

    // Create the variable
    Variable left("left");
    Variable top("top");
    Variable contents_top("contents_top");
    Variable contents_bottom("contents_bottom");
    Variable contents_left("contents_left");
    Variable contents_right("contents_right");
    Variable midline("midline");
    Variable ctleft("ctleft");
    Variable ctheight("ctheight");
    Variable cttop("cttop");
    Variable ctwidth("ctwidth");
    Variable lb1left("lb1left");
    Variable lb1height("lb1height");
    Variable lb1top("lb1top");
    Variable lb1width("lb1width");
    Variable lb2left("lb2left");
    Variable lb2height("lb2height");
    Variable lb2top("lb2top");
    Variable lb2width("lb2width");
    Variable lb3left("lb3left");
    Variable lb3height("lb3height");
    Variable lb3top("lb3top");
    Variable lb3width("lb3width");
    Variable fl1left("fl1left");
    Variable fl1height("fl1height");
    Variable fl1top("fl1top");
    Variable fl1width("fl1width");
    Variable fl2left("fl2left");
    Variable fl2height("fl2height");
    Variable fl2top("fl2top");
    Variable fl2width("fl2width");
    Variable fl3left("fl3left");
    Variable fl3height("fl3height");
    Variable fl3top("fl3top");
    Variable fl3width("fl3width");

    // Add the edit variables
    solver.addEditVariable(width, strength::strong);
    solver.addEditVariable(height, strength::strong);

    // Add the constraints
    Constraint constraints[] = {
        (left + -0 >= 0) | strength::required,
        (height + 0 == 0) | strength::medium,
        (top + -0 >= 0) | strength::required,
        (width + -0 >= 0) | strength::required,
        (height + -0 >= 0) | strength::required,
        (-top + contents_top + -10 == 0) | strength::required,
        (lb3height + -16 == 0) | strength::strong,
        (lb3height + -16 >= 0) | strength::strong,
        (ctleft + -0 >= 0) | strength::required,
        (cttop + -0 >= 0) | strength::required,
        (ctwidth + -0 >= 0) | strength::required,
        (ctheight + -0 >= 0) | strength::required,
        (fl3left + -0 >= 0) | strength::required,
        (ctheight + -24 >= 0) | smedium,
        (ctwidth + -1.67772e+07 <= 0) | smedium,
        (ctheight + -24 <= 0) | smedium,
        (fl3top + -0 >= 0) | strength::required,
        (fl3width + -0 >= 0) | strength::required,
        (fl3height + -0 >= 0) | strength::required,
        (lb1width + -67 == 0) | strength::weak,
        (lb2width + -0 >= 0) | strength::required,
        (lb2height + -0 >= 0) | strength::required,
        (fl2height + -0 >= 0) | strength::required,
        (lb3left + -0 >= 0) | strength::required,
        (fl2width + -125 >= 0) | strength::strong,
        (fl2height + -21 == 0) | strength::strong,
        (fl2height + -21 >= 0) | strength::strong,
        (lb3top + -0 >= 0) | strength::required,
        (lb3width + -0 >= 0) | strength::required,
        (fl1left + -0 >= 0) | strength::required,
        (fl1width + -0 >= 0) | strength::required,
        (lb1width + -67 >= 0) | strength::strong,
        (fl2left + -0 >= 0) | strength::required,
        (lb2width + -66 == 0) | strength::weak,
        (lb2width + -66 >= 0) | strength::strong,
        (lb2height + -16 == 0) | strength::strong,
        (fl1height + -0 >= 0) | strength::required,
        (fl1top + -0 >= 0) | strength::required,
        (lb2top + -0 >= 0) | strength::required,
        (-lb2top + lb3top + -lb2height + -10 == 0) | mmedium,
        (-lb3top + -lb3height + fl3top + -10 >= 0) | strength::required,
        (-lb3top + -lb3height + fl3top + -10 == 0) | mmedium,
        (contents_bottom + -fl3height + -fl3top + -0 == 0) | mmedium,
        (fl1top + -contents_top + 0 >= 0) | strength::required,
        (fl1top + -contents_top + 0 == 0) | mmedium,
        (contents_bottom + -fl3height + -fl3top + -0 >= 0) | strength::required,
        (-left + -width + contents_right + 10 == 0) | strength::required,
        (-top + -height + contents_bottom + 10 == 0) | strength::required,
        (-left + contents_left + -10 == 0) | strength::required,
        (lb3left + -contents_left + 0 == 0) | mmedium,
        (fl1left + -midline + 0 == 0) | strength::strong,
        (fl2left + -midline + 0 == 0) | strength::strong,
        (ctleft + -midline + 0 == 0) | strength::strong,
        (fl1top + 0.5 * fl1height + -lb1top + -0.5 * lb1height + 0 == 0) | strength::strong,
        (lb1left + -contents_left + 0 >= 0) | strength::required,
        (lb1left + -contents_left + 0 == 0) | mmedium,
        (-lb1left + fl1left + -lb1width + -10 >= 0) | strength::required,
        (-lb1left + fl1left + -lb1width + -10 == 0) | mmedium,
        (-fl1left + contents_right + -fl1width + -0 >= 0) | strength::required,
        (width + 0 == 0) | strength::medium,
        (-fl1top + fl2top + -fl1height + -10 >= 0) | strength::required,
        (-fl1top + fl2top + -fl1height + -10 == 0) | mmedium,
        (cttop + -fl2top + -fl2height + -10 >= 0) | strength::required,
        (-ctheight + -cttop + fl3top + -10 >= 0) | strength::required,
        (contents_bottom + -fl3height + -fl3top + -0 >= 0) | strength::required,
        (cttop + -fl2top + -fl2height + -10 == 0) | mmedium,
        (-fl1left + contents_right + -fl1width + -0 == 0) | mmedium,
        (-lb2top + -0.5 * lb2height + fl2top + 0.5 * fl2height + 0 == 0) | strength::strong,
        (-contents_left + lb2left + 0 >= 0) | strength::required,
        (-contents_left + lb2left + 0 == 0) | mmedium,
        (fl2left + -lb2width + -lb2left + -10 >= 0) | strength::required,
        (-ctheight + -cttop + fl3top + -10 == 0) | mmedium,
        (contents_bottom + -fl3height + -fl3top + -0 == 0) | mmedium,
        (lb1top + -0 >= 0) | strength::required,
        (lb1width + -0 >= 0) | strength::required,
        (lb1height + -0 >= 0) | strength::required,
        (fl2left + -lb2width + -lb2left + -10 == 0) | mmedium,
        (-fl2left + -fl2width + contents_right + -0 == 0) | mmedium,
        (-fl2left + -fl2width + contents_right + -0 >= 0) | strength::required,
        (lb3left + -contents_left + 0 >= 0) | strength::required,
        (lb1left + -0 >= 0) | strength::required,
        (0.5 * ctheight + cttop + -lb3top + -0.5 * lb3height + 0 == 0) | strength::strong,
        (ctleft + -lb3left + -lb3width + -10 >= 0) | strength::required,
        (-ctwidth + -ctleft + contents_right + -0 >= 0) | strength::required,
        (ctleft + -lb3left + -lb3width + -10 == 0) | mmedium,
        (fl3left + -contents_left + 0 >= 0) | strength::required,
        (fl3left + -contents_left + 0 == 0) | mmedium,
        (-ctwidth + -ctleft + contents_right + -0 == 0) | mmedium,
        (-fl3left + contents_right + -fl3width + -0 == 0) | mmedium,
        (-contents_top + lb1top + 0 >= 0) | strength::required,
        (-contents_top + lb1top + 0 == 0) | mmedium,
        (-fl3left + contents_right + -fl3width + -0 >= 0) | strength::required,
        (lb2top + -lb1top + -lb1height + -10 >= 0) | strength::required,
        (-lb2top + lb3top + -lb2height + -10 >= 0) | strength::required,
        (lb2top + -lb1top + -lb1height + -10 == 0) | mmedium,
        (fl1height + -21 == 0) | strength::strong,
        (fl1height + -21 >= 0) | strength::strong,
        (lb2left + -0 >= 0) | strength::required,
        (lb2height + -16 >= 0) | strength::strong,
        (fl2top + -0 >= 0) | strength::required,
        (fl2width + -0 >= 0) | strength::required,
        (lb1height + -16 >= 0) | strength::strong,
        (lb1height + -16 == 0) | strength::strong,
        (fl3width + -125 >= 0) | strength::strong,
        (fl3height + -21 == 0) | strength::strong,
        (fl3height + -21 >= 0) | strength::strong,
        (lb3height + -0 >= 0) | strength::required,
        (ctwidth + -119 >= 0) | smedium,
        (lb3width + -24 == 0) | strength::weak,
        (lb3width + -24 >= 0) | strength::strong,
        (fl1width + -125 >= 0) | strength::strong,
    };

    for (const auto& constraint : constraints)
        solver.addConstraint(constraint);
}

int main()
{
    ankerl::nanobench::Bench().run("building solver", [&] {
        Solver solver;
        Variable width("width");
        Variable height("height");
        build_solver(solver, width, height);
        ankerl::nanobench::doNotOptimizeAway(solver); //< prevent the compiler to optimize away the solver
    });

    struct Size
    {
        int width;
        int height;
    };

    Size sizes[] = {
        { 400, 600 },
        { 600, 400 },
        { 800, 1200 },
        { 1200, 800 },
        { 400, 800 },
        { 800, 400 }
    };

    Solver solver;
    Variable widthVar("width");
    Variable heightVar("height");
    build_solver(solver, widthVar, heightVar);

    for (const Size& size : sizes)
    {
        double width = size.width;
        double height = size.height;

        ankerl::nanobench::Bench().minEpochIterations(10).run("suggest value " + std::to_string(size.width) + "x" + std::to_string(size.height), [&] {
            solver.suggestValue(widthVar, width);
            solver.suggestValue(heightVar, height);
            solver.updateVariables();
        });
    }
}
