#------------------------------------------------------------------------------
# Copyright (c) 2014-2018, Nucleic Development Team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file COPYING.txt, distributed with this software.
#------------------------------------------------------------------------------
import pytest

from kiwisolver import strength


def test_accessing_predefined_strength():
    """Test getting the default values for the strength.

    """
    assert strength.weak < strength.medium
    assert strength.medium < strength.strong
    assert strength.strong < strength.required


def test_creating_strength():
    """Test creating strength from constitutent values.

    """
    assert strength.create(0, 0, 1) < strength.create(0, 1, 0)
    assert strength.create(0, 1, 0) < strength.create(1, 0, 0)
    assert strength.create(1, 0, 0, 1) < strength.create(1, 0, 0, 4)

    with pytest.raises(TypeError):
        strength.create('', '', '')
