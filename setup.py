# --------------------------------------------------------------------------------------
# Copyright (c) 2013-2024, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE, distributed with this software.
# --------------------------------------------------------------------------------------
import os

from setuptools import Extension, setup

try:
    from cppy import CppyBuildExt
except ImportError as e:
    raise RuntimeError(
        "Missing setup required dependencies: cppy. "
        "Installing through pip as recommended ensure one never hits this issue."
    ) from e

# Before releasing the version needs to be updated in kiwi/version.h, if the changes
# are not limited to the solver.

ext_modules = [
    Extension(
        "kiwisolver._cext",
        [
            "py/src/kiwisolver.cpp",
            "py/src/constraint.cpp",
            "py/src/expression.cpp",
            "py/src/solver.cpp",
            "py/src/strength.cpp",
            "py/src/term.cpp",
            "py/src/variable.cpp",
        ],
        include_dirs=["."],
        language="c++",
    ),
]


setup(
    ext_modules=ext_modules,
    cmdclass={"build_ext": CppyBuildExt},
)
