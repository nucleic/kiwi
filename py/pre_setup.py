#------------------------------------------------------------------------------
# Copyright (c) 2013, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import shutil


# Copy the kiwi headers into a local dir
shutil.rmtree('./kiwi', ignore_errors=True)
shutil.copytree('../kiwi', './kiwi')

# Copy the kiwi readme
shutil.copyfile('../README.rst', './README.rst')

# Copy the kiwi license
shutil.copyfile('../COPYING.txt', './COPYING.txt')
