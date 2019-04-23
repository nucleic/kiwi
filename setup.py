#------------------------------------------------------------------------------
# Copyright (c) 2013-2017, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
from setuptools import setup, Extension
from setuptools.command.build_ext import build_ext

# Before releasing the version needs to be updated in:
# - setup.py
# - py/kiwisolver.cpp
# - kiwi/version.h
# - docs/source/conf.py

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
        include_dirs=['.'],
        language='c++',
    ),
]


class BuildExt(build_ext):
    """ A custom build extension for adding compiler-specific options.

    """
    c_opts = {
        'msvc': ['/EHsc']
    }

    def build_extensions(self):
        ct = self.compiler.compiler_type
        opts = self.c_opts.get(ct, [])
        for ext in self.extensions:
            ext.extra_compile_args = opts
        build_ext.build_extensions(self)


setup(
    name='kiwisolver',
    version='1.1.0',
    author='The Nucleic Development Team',
    author_email='sccolbert@gmail.com',
    url='https://github.com/nucleic/kiwi',
    description='A fast implementation of the Cassowary constraint solver',
    long_description=open('README.rst').read(),
    license='BSD',
    classifiers=[
          # https://pypi.org/pypi?%3Aaction=list_classifiers
          'Programming Language :: Python',
          'Programming Language :: Python :: 2',
          'Programming Language :: Python :: 2.7',
          'Programming Language :: Python :: 3',
          'Programming Language :: Python :: 3.4',
          'Programming Language :: Python :: 3.5',
          'Programming Language :: Python :: 3.6',
          'Programming Language :: Python :: 3.7',
          'Programming Language :: Python :: Implementation :: CPython',
      ],
    python_requires='>=2.7, !=3.0.*, !=3.1.*, !=3.2.*, !=3.3.*',
    install_requires=['setuptools'],
    ext_modules=ext_modules,
    cmdclass={'build_ext': BuildExt},
)
