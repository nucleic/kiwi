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

    $ pip install kiwisolver

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
    to higher than 10.9 to force the compiler to use the new C++ stdlib::

        $ export MACOSX_DEPLOYMENT_TARGET=10.10


Supported Platforms
-------------------

Kiwisolver is known to run on Windows, OSX, and Linux; and compiles cleanly
with MSVC, Clang, GCC, and MinGW. If you encounter a bug, please report
it on the `Issue Tracker`_.

.. _Issue Tracker: http://github.com/nucleic/enaml/issues


Checking your install
---------------------

Once you installed kiwisolver you should be able to import it as follows:

.. code:: python

    import kiwisolver

.. note::

    On Windows, the import may fail with `ImportError: DLL load failed`. If it
    does, it means your system is missing the Microsoft Visual C++
    redistributable matching your Python version. To fix the issue download
    and install the package corresponding to your Python version
    (https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads):

    - Python 2.7: Visual C++ Redistributable 2008
    - Python 3.4: Visual C++ Redistributable 2010
    - Python 3.5+: Visual C++ Redistributable 2015 or more recent
