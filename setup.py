#------------------------------------------------------------------------------
# Copyright (c) 2013, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
from setuptools import setup, Extension


ext_modules = [
    Extension(
        'kiwisolver',
        ['py/kiwisolver.cpp',
         'py/constraint.cpp',
         'py/expression.cpp',
         'py/solver.cpp',
         'py/strength.cpp',
         'py/term.cpp',
         'py/variable.cpp'],
        include_dirs=['.', 'kiwi', 'py'],
        language='c++',
    ),
]


setup(
    name='kiwisolver',
    version='0.1.2',
    author='The Nucleic Development Team',
    author_email='sccolbert@gmail.com',
    url='https://github.com/nucleic/kiwi',
    description='A fast implementation of the Cassowary constraint solver',
    long_description=open('README.rst').read(),
    install_requires=['distribute'],
    ext_modules=ext_modules,
)
