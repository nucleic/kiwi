# --------------------------------------------------------------------------------------
# Copyright (c) 2013-2022, Nucleic Development Team.
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

# Use the env var KIWI_DISABLE_FH4 to disable linking against VCRUNTIME140_1.dll

if "KIWI_DISABLE_FH4" in os.environ:
    os.environ.setdefault("CPPY_DISABLE_FH4", "1")

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
    # FIXME remove once setuptool supports PEP 621
    name="kiwisolver",
    author="The Nucleic Development Team",
    author_email="sccolbert@gmail.com",
    url="https://github.com/nucleic/kiwi",
    description="A fast implementation of the Cassowary constraint solver",
    long_description=open("README.rst").read(),
    license="BSD",
    classifiers=[
        # https://pypi.org/pypi?%3Aaction=list_classifiers
        "License :: OSI Approved :: BSD License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: Implementation :: CPython",
        "Programming Language :: Python :: Implementation :: PyPy",
    ],
    python_requires=">=3.7",
    # FIXME end of remove once setuptool supports PEP 621
    setup_requires=[
        "setuptools>=42",
        "wheel",
        "setuptools_scm[toml]>=3.4.3",
        "cppy>=1.2.0",
    ],
    package_dir={"": "py"},
    packages=["kiwisolver"],
    install_requires=["typing_extensions;python_version<'3.8'"],
    ext_modules=ext_modules,
    cmdclass={"build_ext": CppyBuildExt},
    include_package_data=False,
    package_data={"kiwisolver": ["py.typed", "*.pyi"]},
)
