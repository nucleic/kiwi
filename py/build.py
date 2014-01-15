#------------------------------------------------------------------------------
# Copyright (c) 2013, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import os
import shutil
import sys


def prep_dir():
    shutil.rmtree('./build', ignore_errors=True)
    shutil.rmtree('./kiwi', ignore_errors=True)
    shutil.copytree('../kiwi', './kiwi')
    shutil.copyfile('../README.rst', './README.rst')
    shutil.copyfile('../COPYING.txt', './COPYING.txt')
    shutil.copyfile('../releasenotes.rst', './releasenotes.rst')


def build():
    os.system('python setup.py build')


def develop():
    os.system('python setup.py develop')


def install():
    os.system('python setup.py install')


def upload():
    os.system('python setup.py register sdist upload')


handlers = {
    'build': build,
    'develop': develop,
    'install': install,
    'upload': upload,
}


args = sys.argv[1:]
if not args or not all(arg in handlers for arg in args):
    print 'usage: python build.py [build, [develop, [install, [upload]]]]'
    sys.exit()
prep_dir()
for arg in args:
    handlers[arg]()
