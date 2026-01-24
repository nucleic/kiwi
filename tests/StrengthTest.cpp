/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

#include <gtest/gtest.h>
#include <kiwi/kiwi.h>

using namespace kiwi;

// Test accessing predefined strengths
TEST(StrengthTest, AccessingPredefinedStrength) {
    EXPECT_LT(strength::weak, strength::medium);
    EXPECT_LT(strength::medium, strength::strong);
    EXPECT_LT(strength::strong, strength::required);
}

// Test creating strength from constituent values
TEST(StrengthTest, CreatingStrength) {
    EXPECT_LT(strength::create(0, 0, 1), strength::create(0, 1, 0));
    EXPECT_LT(strength::create(0, 1, 0), strength::create(1, 0, 0));
    EXPECT_LT(strength::create(1, 0, 0, 1), strength::create(1, 0, 0, 4));
}
