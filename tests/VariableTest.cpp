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

// Test variable creation and methods
TEST(VariableTest, VariableMethods) {
    Variable v;
    EXPECT_EQ(v.name(), "");
    
    v.setName("foo");
    EXPECT_EQ(v.name(), "foo");
    
    EXPECT_EQ(v.value(), 0.0);
    
    // Test context
    EXPECT_EQ(v.context(), nullptr);
    Variable::Context* ctx = new Variable::Context();
    v.setContext(ctx);
    EXPECT_NE(v.context(), nullptr);
}

// Test negation on a variable
TEST(VariableTest, VariableNeg) {
    Variable v("foo");
    
    Term neg = -v;
    EXPECT_TRUE(neg.variable().equals(v));
    EXPECT_EQ(neg.coefficient(), -1);
}

// Test variable multiplications
TEST(VariableTest, VariableMul) {
    Variable v("foo");
    
    // v * 2.0
    Term mul1 = v * 2.0;
    EXPECT_TRUE(mul1.variable().equals(v));
    EXPECT_EQ(mul1.coefficient(), 2);
    
    // 2.0 * v
    Term mul2 = 2.0 * v;
    EXPECT_TRUE(mul2.variable().equals(v));
    EXPECT_EQ(mul2.coefficient(), 2);
}

// Test variable divisions
TEST(VariableTest, VariableDivision) {
    Variable v("foo");
    
    Term div = v / 2.0;
    EXPECT_TRUE(div.variable().equals(v));
    EXPECT_EQ(div.coefficient(), 0.5);
}

// Test variable additions
TEST(VariableTest, VariableAddition) {
    Variable v("foo");
    Variable v2("bar");
    
    // v + 2
    Expression add1 = v + 2;
    EXPECT_EQ(add1.constant(), 2);
    EXPECT_EQ(add1.terms().size(), 1);
    EXPECT_TRUE(add1.terms()[0].variable().equals(v));
    EXPECT_EQ(add1.terms()[0].coefficient(), 1);
    
    // 2.0 + v
    Expression add2 = 2.0 + v;
    EXPECT_EQ(add2.constant(), 2);
    EXPECT_EQ(add2.terms().size(), 1);
    EXPECT_TRUE(add2.terms()[0].variable().equals(v));
    EXPECT_EQ(add2.terms()[0].coefficient(), 1);
    
    // v + v2
    Expression add3 = v + v2;
    EXPECT_EQ(add3.constant(), 0);
    EXPECT_EQ(add3.terms().size(), 2);
    EXPECT_TRUE(add3.terms()[0].variable().equals(v));
    EXPECT_EQ(add3.terms()[0].coefficient(), 1);
    EXPECT_TRUE(add3.terms()[1].variable().equals(v2));
    EXPECT_EQ(add3.terms()[1].coefficient(), 1);
}

// Test variable subtractions
TEST(VariableTest, VariableSubtraction) {
    Variable v("foo");
    Variable v2("bar");
    
    // v - 2
    Expression sub1 = v - 2;
    EXPECT_EQ(sub1.constant(), -2);
    EXPECT_EQ(sub1.terms().size(), 1);
    EXPECT_TRUE(sub1.terms()[0].variable().equals(v));
    EXPECT_EQ(sub1.terms()[0].coefficient(), 1);
    
    // 2 - v
    Expression sub2 = 2 - v;
    EXPECT_EQ(sub2.constant(), 2);
    EXPECT_EQ(sub2.terms().size(), 1);
    EXPECT_TRUE(sub2.terms()[0].variable().equals(v));
    EXPECT_EQ(sub2.terms()[0].coefficient(), -1);
    
    // v - v2
    Expression sub3 = v - v2;
    EXPECT_EQ(sub3.constant(), 0);
    EXPECT_EQ(sub3.terms().size(), 2);
    EXPECT_TRUE(sub3.terms()[0].variable().equals(v));
    EXPECT_EQ(sub3.terms()[0].coefficient(), 1);
    EXPECT_TRUE(sub3.terms()[1].variable().equals(v2));
    EXPECT_EQ(sub3.terms()[1].coefficient(), -1);
}

// Test comparison operations on variables
TEST(VariableTest, VariableRichCompareOperations) {
    Variable v("foo");
    Variable v2("bar");
    
    // Test <=
    Constraint c1 = v2 + 1 <= v;
    EXPECT_EQ(c1.op(), RelationalOperator::OP_LE);
    EXPECT_EQ(c1.strength(), strength::required);
    auto expr1 = c1.expression();
    EXPECT_EQ(expr1.constant(), 1);
    EXPECT_EQ(expr1.terms().size(), 2);
    
    // Test ==
    Constraint c2 = v2 + 1 == v;
    EXPECT_EQ(c2.op(), RelationalOperator::OP_EQ);
    EXPECT_EQ(c2.strength(), strength::required);
    
    // Test >=
    Constraint c3 = v2 + 1 >= v;
    EXPECT_EQ(c3.op(), RelationalOperator::OP_GE);
    EXPECT_EQ(c3.strength(), strength::required);
}
