#------------------------------------------------------------------------------
# Copyright (c) 2013, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
from setuptools import setup, find_packages, Extension


ext_modules = [
    Extension(
        'variable',
        ['variable.cpp'],
        language='c++',
        include_dirs=['../'],
    ),
]


setup(
    name='atom',
    version='0.3.2',
    author='The Nucleic Development Team',
    author_email='sccolbert@gmail.com',
    url='https://github.com/nucleic/atom',
    description='Memory efficient Python objects',
    install_requires=['distribute'],
    packages=find_packages(),
    ext_modules=ext_modules,
)
