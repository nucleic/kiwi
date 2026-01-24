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

// Test constraints creation and methods
TEST(ConstraintTest, ConstraintCreationEQ) {
    Variable v("foo");
    Constraint c(v + 1, RelationalOperator::OP_EQ);
    
    EXPECT_EQ(c.strength(), strength::required);
    EXPECT_EQ(c.op(), RelationalOperator::OP_EQ);
    
    auto e = c.expression();
    auto t = e.terms();
    EXPECT_EQ(e.constant(), 1);
    EXPECT_EQ(t.size(), 1);
    EXPECT_TRUE(t[0].variable().equals(v));
    EXPECT_EQ(t[0].coefficient(), 1);
}

TEST(ConstraintTest, ConstraintCreationLE) {
    Variable v("foo");
    Constraint c(v + 1, RelationalOperator::OP_LE);
    
    EXPECT_EQ(c.strength(), strength::required);
    EXPECT_EQ(c.op(), RelationalOperator::OP_LE);
}

TEST(ConstraintTest, ConstraintCreationGE) {
    Variable v("foo");
    Constraint c(v + 1, RelationalOperator::OP_GE);
    
    EXPECT_EQ(c.strength(), strength::required);
    EXPECT_EQ(c.op(), RelationalOperator::OP_GE);
}

// Test constraint creation with different strengths
TEST(ConstraintTest, ConstraintCreationWithStrength) {
    Variable v("foo");
    
    Constraint c1(v + 1, RelationalOperator::OP_EQ, strength::weak);
    EXPECT_EQ(c1.strength(), strength::weak);
    
    Constraint c2(v + 1, RelationalOperator::OP_EQ, strength::medium);
    EXPECT_EQ(c2.strength(), strength::medium);
    
    Constraint c3(v + 1, RelationalOperator::OP_EQ, strength::strong);
    EXPECT_EQ(c3.strength(), strength::strong);
    
    Constraint c4(v + 1, RelationalOperator::OP_EQ, strength::required);
    EXPECT_EQ(c4.strength(), strength::required);
}

// Test modifying constraint strength using | operator
TEST(ConstraintTest, ConstraintOrOperator) {
    Variable v("foo");
    Constraint c(v + 1, RelationalOperator::OP_EQ);
    
    Constraint c1 = c | strength::weak;
    EXPECT_EQ(c1.strength(), strength::weak);
    
    Constraint c2 = c | strength::medium;
    EXPECT_EQ(c2.strength(), strength::medium);
    
    Constraint c3 = c | strength::strong;
    EXPECT_EQ(c3.strength(), strength::strong);
    
    Constraint c4 = c | strength::required;
    EXPECT_EQ(c4.strength(), strength::required);
    
    Constraint c5 = c | strength::create(1, 1, 0);
    EXPECT_EQ(c5.strength(), strength::create(1, 1, 0));
}
