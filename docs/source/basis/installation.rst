.. _basis-installation:

Installing Kiwisolver on Python
===============================

.. include:: ../substitutions.sub

Kiwisolver is supported on Python 2.7, and 3.4+. Installing it is a
straight-forward process. There are three approaches to choose from.

The easy way: Pre-compiled packages
-----------------------------------

The easiest way to install atom is through pre-compiled packages. Kiwisolver is
distributed pre-compiled in two-forms.

Conda packages
^^^^^^^^^^^^^^

If you use the `Anaconda`_ Python distribution platform (or `Miniconda`_, its
lighter-weight companion), the latest release of Kiwisolver can be installed
using conda from the default channel or the conda-forge channel::

    $ conda install kiwisolver

    $ conda install kiwisolver -c conda-forge

.. _Anaconda: https://store.continuum.io/cshop/anaconda
.. _Miniconda: https://conda.io/miniconda.html

Wheels
^^^^^^

If you don't use Anaconda, you can install Kiwisolver pre-compiled,
through PIP, for most common platforms::

    $ pip install atom

Compiling it yourself: The Hard Way
-----------------------------------

Building Kiwisolver from scratch requires Python and a C++ compiler. On Unix
platform getting a C++ compiler properly configured is generally
straighforward. On Windows, starting with Python 3.6 the free version of the
Microsoft toolchain should work out of the box. Installing Kiwisolver is then
as simple as::

    $ python setup.py install

.. note::

    For MacOSX users on OSX Mojave, one needs to set MACOSX_DEPLOYMENT_TARGET
    to higher than 10.9 to force teh compiler to use the new C++ stdlib::

        $ export MACOSX_DEPLOYMENT_TARGET=10.10


Supported Platforms
-------------------

Kiwisolver is known to run on Windows, OSX, and Linux; and compiles cleanly
with MSVC, Clang, GCC, and MinGW. If you encounter a bug, please report
it on the `Issue Tracker`_.

.. _Issue Tracker: http://github.com/nucleic/enaml/issues
