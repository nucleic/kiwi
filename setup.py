#------------------------------------------------------------------------------
# Copyright (c) 2013, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
from setuptools import setup, Extension
from setuptools.command.build_ext import build_ext


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
    version='0.1.3',
    author='The Nucleic Development Team',
    author_email='sccolbert@gmail.com',
    url='https://github.com/nucleic/kiwi',
    description='A fast implementation of the Cassowary constraint solver',
    long_description=open('README.rst').read(),
    install_requires=['distribute'],
    ext_modules=ext_modules,
    cmdclass={'build_ext': BuildExt},
)
