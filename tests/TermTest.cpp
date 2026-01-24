/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

#include "kiwi/expression.h"
#include <gtest/gtest.h>
#include <kiwi/kiwi.h>

using namespace kiwi;

// Test term creation
TEST(TermTest, TermCreation) {
    Variable v("foo");
    
    Term t1(v);
    EXPECT_TRUE(t1.variable().equals(v));
    EXPECT_EQ(t1.coefficient(), 1);
    
    Term t2(v, 100);
    EXPECT_TRUE(t2.variable().equals(v));
    EXPECT_EQ(t2.coefficient(), 100);
}

// Test negation on a term
TEST(TermTest, TermNeg) {
    Variable v("foo");
    Term t(v, 10);
    
    Term neg = -t;
    EXPECT_TRUE(neg.variable().equals(v));
    EXPECT_EQ(neg.coefficient(), -10);
}

// Test term multiplications
TEST(TermTest, TermMul) {
    Variable v("foo");
    Term t(v, 10);
    
    // t * 2
    Term mul1 = t * 2;
    EXPECT_TRUE(mul1.variable().equals(v));
    EXPECT_EQ(mul1.coefficient(), 20);
    
    // 2.0 * t
    Term mul2 = 2.0 * t;
    EXPECT_TRUE(mul2.variable().equals(v));
    EXPECT_EQ(mul2.coefficient(), 20);
}

// Test term divisions
TEST(TermTest, TermDiv) {
    Variable v("foo");
    Term t(v, 10);
    
    Term div = t / 2;
    EXPECT_TRUE(div.variable().equals(v));
    EXPECT_EQ(div.coefficient(), 5);
}

// Test term additions
TEST(TermTest, TermAdd) {
    Variable v("foo");
    Variable v2("bar");
    Term t(v, 10);
    Term t2(v2);
    
    // t + 2
    Expression add1 = t + 2;
    EXPECT_EQ(add1.constant(), 2);
    EXPECT_EQ(add1.terms().size(), 1);
    EXPECT_TRUE(add1.terms()[0].variable().equals(v));
    EXPECT_EQ(add1.terms()[0].coefficient(), 10);
    
    // 2.0 + t
    Expression add2 = 2.0 + t;
    EXPECT_EQ(add2.constant(), 2);
    EXPECT_EQ(add2.terms().size(), 1);
    EXPECT_TRUE(add2.terms()[0].variable().equals(v));
    EXPECT_EQ(add2.terms()[0].coefficient(), 10);
    
    // t + v2
    Expression add3 = t + v2;
    EXPECT_EQ(add3.constant(), 0);
    EXPECT_EQ(add3.terms().size(), 2);
    EXPECT_TRUE(add3.terms()[0].variable().equals(v));
    EXPECT_EQ(add3.terms()[0].coefficient(), 10);
    EXPECT_TRUE(add3.terms()[1].variable().equals(v2));
    EXPECT_EQ(add3.terms()[1].coefficient(), 1);
    
    // v2 + t
    Expression add4 = v2 + t;
    EXPECT_EQ(add4.constant(), 0);
    EXPECT_EQ(add4.terms().size(), 2);
    
    // t + t2
    Expression add5 = t + t2;
    EXPECT_EQ(add5.constant(), 0);
    EXPECT_EQ(add5.terms().size(), 2);
    EXPECT_TRUE(add5.terms()[0].variable().equals(v));
    EXPECT_EQ(add5.terms()[0].coefficient(), 10);
    EXPECT_TRUE(add5.terms()[1].variable().equals(v2));
    EXPECT_EQ(add5.terms()[1].coefficient(), 1);
}

// Test term subtractions
TEST(TermTest, TermSub) {
    Variable v("foo");
    Variable v2("bar");
    Term t(v, 10);
    Term t2(v2);
    
    // t - 2
    Expression sub1 = t - 2;
    EXPECT_EQ(sub1.constant(), -2);
    EXPECT_EQ(sub1.terms().size(), 1);
    EXPECT_TRUE(sub1.terms()[0].variable().equals(v));
    EXPECT_EQ(sub1.terms()[0].coefficient(), 10);
    
    // 2.0 - t
    Expression sub2 = 2.0 - t;
    EXPECT_EQ(sub2.constant(), 2);
    EXPECT_EQ(sub2.terms().size(), 1);
    EXPECT_TRUE(sub2.terms()[0].variable().equals(v));
    EXPECT_EQ(sub2.terms()[0].coefficient(), -10);
    
    // t - v2
    Expression sub3 = t - v2;
    EXPECT_EQ(sub3.constant(), 0);
    EXPECT_EQ(sub3.terms().size(), 2);
    EXPECT_TRUE(sub3.terms()[0].variable().equals(v));
    EXPECT_EQ(sub3.terms()[0].coefficient(), 10);
    EXPECT_TRUE(sub3.terms()[1].variable().equals(v2));
    EXPECT_EQ(sub3.terms()[1].coefficient(), -1);
    
    // v2 - t
    Expression sub4 = v2 - t;
    EXPECT_EQ(sub4.constant(), 0);
    EXPECT_EQ(sub4.terms().size(), 2);
    EXPECT_TRUE(sub4.terms()[0].variable().equals(v2));
    EXPECT_EQ(sub4.terms()[0].coefficient(), 1);
    EXPECT_TRUE(sub4.terms()[1].variable().equals(v));
    EXPECT_EQ(sub4.terms()[1].coefficient(), -10);
    
    // t - t2
    Expression sub5 = t - t2;
    EXPECT_EQ(sub5.constant(), 0);
    EXPECT_EQ(sub5.terms().size(), 2);
    EXPECT_TRUE(sub5.terms()[0].variable().equals(v));
    EXPECT_EQ(sub5.terms()[0].coefficient(), 10);
    EXPECT_TRUE(sub5.terms()[1].variable().equals(v2));
    EXPECT_EQ(sub5.terms()[1].coefficient(), -1);
}

// Test comparison operations on terms
TEST(TermTest, TermRichCompareOperations) {
    Variable v("foo");
    Variable v2("bar");
    Term t1(v, 10);
    Term t2(v2, 20);
    
    // Test <=
    Constraint c1 = t1 <= t2 + 1; 
    EXPECT_EQ(c1.op(), RelationalOperator::OP_LE);
    EXPECT_EQ(c1.strength(), strength::required);
    auto expr1 = c1.expression();
    EXPECT_EQ(expr1.constant(), -1);
    EXPECT_EQ(expr1.terms().size(), 2);
    
    // Test ==
    Constraint c2 = t1 == t2 + 1;
    EXPECT_EQ(c2.op(), RelationalOperator::OP_EQ);
    EXPECT_EQ(c2.strength(), strength::required);
    expr1 = c1.expression();
    EXPECT_EQ(expr1.constant(), -1);
    EXPECT_EQ(expr1.terms().size(), 2);
    
    // Test >=
    Constraint c3 = t1 >= t2 + 1;
    EXPECT_EQ(c3.op(), RelationalOperator::OP_GE);
    EXPECT_EQ(c3.strength(), strength::required);
    expr1 = c1.expression();
    EXPECT_EQ(expr1.constant(), -1);
    EXPECT_EQ(expr1.terms().size(), 2);
}
