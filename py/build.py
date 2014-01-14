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


_kiwi_copied = False
def copy_kiwi_tree():
    global _kiwi_copied
    if not _kiwi_copied:
        shutil.rmtree('./kiwi', ignore_errors=True)
        shutil.copytree('../kiwi', './kiwi')
    _kiwi_copied = True


_extras_copied = False
def copy_sdist_extras():
    global _extras_copied
    if not _extras_copied:
        shutil.copyfile('../README.rst', './README.rst')
        shutil.copyfile('../COPYING.txt', './COPYING.txt')
    _extras_copied = True


def develop():
    copy_kiwi_tree()
    copy_sdist_extras()
    os.system('python setup.py develop')


def install():
    copy_kiwi_tree()
    copy_sdist_extras()
    os.system('python setup.py install')


def upload():
    copy_kiwi_tree()
    copy_sdist_extras()
    os.system('python setup.py register sdist upload')


handlers = {
    'develop': develop,
    'install': install,
    'upload': upload,
}


args = sys.argv[1:]
if not args or not all(arg in handlers for arg in args):
    print 'usage: python build.py [develop, [install, [upload]]]'
    sys.exit()
for arg in args:
    handlers[arg]()
