/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

#include <gtest/gtest.h>
#include <kiwi/kiwi.h>
#include <vector>

using namespace kiwi;

// Test expression creation
TEST(ExpressionTest, ExpressionCreation) {
    Variable v("foo");
    Variable v2("bar");
    Variable v3("aux");
    
    std::vector<Term> terms1 = {Term(v, 1), Term(v2, 2), Term(v3, 3)};
    Expression e1(terms1);
    
    std::vector<Term> terms2 = {Term(v, 1), Term(v2, 2), Term(v3, 3)};
    Expression e2(terms2, 10);
    
    // Test e1 (constant = 0)
    EXPECT_EQ(e1.constant(), 0);
    EXPECT_EQ(e1.terms().size(), 3);
    EXPECT_TRUE(e1.terms()[0].variable().equals(v));
    EXPECT_EQ(e1.terms()[0].coefficient(), 1);
    EXPECT_TRUE(e1.terms()[1].variable().equals(v2));
    EXPECT_EQ(e1.terms()[1].coefficient(), 2);
    EXPECT_TRUE(e1.terms()[2].variable().equals(v3));
    EXPECT_EQ(e1.terms()[2].coefficient(), 3);
    
    // Test e2 (constant = 10)
    EXPECT_EQ(e2.constant(), 10);
    EXPECT_EQ(e2.terms().size(), 3);
    EXPECT_TRUE(e2.terms()[0].variable().equals(v));
    EXPECT_EQ(e2.terms()[0].coefficient(), 1);
    EXPECT_TRUE(e2.terms()[1].variable().equals(v2));
    EXPECT_EQ(e2.terms()[1].coefficient(), 2);
    EXPECT_TRUE(e2.terms()[2].variable().equals(v3));
    EXPECT_EQ(e2.terms()[2].coefficient(), 3);
}

// Test negation on an expression
TEST(ExpressionTest, ExpressionNeg) {
    Variable v("foo");
    Expression e = Term(v, 10) + 5;
    
    Expression neg = -e;
    EXPECT_EQ(neg.constant(), -5);
    EXPECT_EQ(neg.terms().size(), 1);
    EXPECT_TRUE(neg.terms()[0].variable().equals(v));
    EXPECT_EQ(neg.terms()[0].coefficient(), -10);
}

// Test expression multiplication
TEST(ExpressionTest, ExpressionMul) {
    Variable v("foo");
    Expression e = Term(v, 10) + 5;
    
    // e * 2.0
    Expression mul1 = e * 2.0;
    EXPECT_EQ(mul1.constant(), 10);
    EXPECT_EQ(mul1.terms().size(), 1);
    EXPECT_TRUE(mul1.terms()[0].variable().equals(v));
    EXPECT_EQ(mul1.terms()[0].coefficient(), 20);
    
    // 2.0 * e
    Expression mul2 = 2.0 * e;
    EXPECT_EQ(mul2.constant(), 10);
    EXPECT_EQ(mul2.terms().size(), 1);
    EXPECT_TRUE(mul2.terms()[0].variable().equals(v));
    EXPECT_EQ(mul2.terms()[0].coefficient(), 20);
}

// Test expression division
TEST(ExpressionTest, ExpressionDiv) {
    Variable v("foo");
    Expression e = Term(v, 10) + 5;
    
    Expression div = e / 2;
    EXPECT_EQ(div.constant(), 2.5);
    EXPECT_EQ(div.terms().size(), 1);
    EXPECT_TRUE(div.terms()[0].variable().equals(v));
    EXPECT_EQ(div.terms()[0].coefficient(), 5);
}

// Test expression addition
TEST(ExpressionTest, ExpressionAddition) {
    Variable v("foo");
    Variable v2("bar");
    Term t(v, 10);
    Term t2(v2);
    Expression e = t + 5;
    Expression e2 = v2 - 10;
    
    // e + 2
    Expression add1 = e + 2;
    EXPECT_EQ(add1.constant(), 7);
    EXPECT_EQ(add1.terms().size(), 1);
    EXPECT_TRUE(add1.terms()[0].variable().equals(v));
    EXPECT_EQ(add1.terms()[0].coefficient(), 10);
    
    // 2.0 + e
    Expression add2 = 2.0 + e;
    EXPECT_EQ(add2.constant(), 7);
    EXPECT_EQ(add2.terms().size(), 1);
    EXPECT_TRUE(add2.terms()[0].variable().equals(v));
    EXPECT_EQ(add2.terms()[0].coefficient(), 10);
    
    // e + v2
    Expression add3 = e + v2;
    EXPECT_EQ(add3.constant(), 5);
    EXPECT_EQ(add3.terms().size(), 2);
    EXPECT_TRUE(add3.terms()[0].variable().equals(v));
    EXPECT_EQ(add3.terms()[0].coefficient(), 10);
    EXPECT_TRUE(add3.terms()[1].variable().equals(v2));
    EXPECT_EQ(add3.terms()[1].coefficient(), 1);
    
    // e + t2
    Expression add4 = e + t2;
    EXPECT_EQ(add4.constant(), 5);
    EXPECT_EQ(add4.terms().size(), 2);
    EXPECT_TRUE(add4.terms()[0].variable().equals(v));
    EXPECT_EQ(add4.terms()[0].coefficient(), 10);
    EXPECT_TRUE(add4.terms()[1].variable().equals(v2));
    EXPECT_EQ(add4.terms()[1].coefficient(), 1);
    
    // e + e2
    Expression add5 = e + e2;
    EXPECT_EQ(add5.constant(), -5);
    EXPECT_EQ(add5.terms().size(), 2);
    EXPECT_TRUE(add5.terms()[0].variable().equals(v));
    EXPECT_EQ(add5.terms()[0].coefficient(), 10);
    EXPECT_TRUE(add5.terms()[1].variable().equals(v2));
    EXPECT_EQ(add5.terms()[1].coefficient(), 1);
}

// Test expression subtraction
TEST(ExpressionTest, ExpressionSubtraction) {
    Variable v("foo");
    Variable v2("bar");
    Term t(v, 10);
    Term t2(v2);
    Expression e = t + 5;
    Expression e2 = v2 - 10;
    
    // e - 2
    Expression sub1 = e - 2;
    EXPECT_EQ(sub1.constant(), 3);
    EXPECT_EQ(sub1.terms().size(), 1);
    EXPECT_TRUE(sub1.terms()[0].variable().equals(v));
    EXPECT_EQ(sub1.terms()[0].coefficient(), 10);
    
    // 2.0 - e
    Expression sub2 = 2.0 - e;
    EXPECT_EQ(sub2.constant(), -3);
    EXPECT_EQ(sub2.terms().size(), 1);
    EXPECT_TRUE(sub2.terms()[0].variable().equals(v));
    EXPECT_EQ(sub2.terms()[0].coefficient(), -10);
    
    // e - v2
    Expression sub3 = e - v2;
    EXPECT_EQ(sub3.constant(), 5);
    EXPECT_EQ(sub3.terms().size(), 2);
    EXPECT_TRUE(sub3.terms()[0].variable().equals(v));
    EXPECT_EQ(sub3.terms()[0].coefficient(), 10);
    EXPECT_TRUE(sub3.terms()[1].variable().equals(v2));
    EXPECT_EQ(sub3.terms()[1].coefficient(), -1);
    
    // v2 - e
    Expression sub4 = v2 - e;
    EXPECT_EQ(sub4.constant(), -5);
    EXPECT_EQ(sub4.terms().size(), 2);
    EXPECT_TRUE(sub4.terms()[0].variable().equals(v2));
    EXPECT_EQ(sub4.terms()[0].coefficient(), 1);
    EXPECT_TRUE(sub4.terms()[1].variable().equals(v));
    EXPECT_EQ(sub4.terms()[1].coefficient(), -10);
    
    // e - t2
    Expression sub5 = e - t2;
    EXPECT_EQ(sub5.constant(), 5);
    EXPECT_EQ(sub5.terms().size(), 2);
    EXPECT_TRUE(sub5.terms()[0].variable().equals(v));
    EXPECT_EQ(sub5.terms()[0].coefficient(), 10);
    EXPECT_TRUE(sub5.terms()[1].variable().equals(v2));
    EXPECT_EQ(sub5.terms()[1].coefficient(), -1);
    
    // t2 - e
    Expression sub6 = t2 - e;
    EXPECT_EQ(sub6.constant(), -5);
    EXPECT_EQ(sub6.terms().size(), 2);
    
    // e - e2
    Expression sub7 = e - e2;
    EXPECT_EQ(sub7.constant(), 15);
    EXPECT_EQ(sub7.terms().size(), 2);
    EXPECT_TRUE(sub7.terms()[0].variable().equals(v));
    EXPECT_EQ(sub7.terms()[0].coefficient(), 10);
    EXPECT_TRUE(sub7.terms()[1].variable().equals(v2));
    EXPECT_EQ(sub7.terms()[1].coefficient(), -1);
}

// Test comparison operations on expressions
TEST(ExpressionTest, ExpressionRichCompareOperations) {
    Variable v1("foo");
    Variable v2("bar");
    Term t1(v1, 10);
    Expression e1 = t1 + 5;
    Expression e2 = v2 - 10;
    
    // Test <=
    Constraint c1 = e1 <= e2;
    EXPECT_EQ(c1.op(), RelationalOperator::OP_LE);
    EXPECT_EQ(c1.strength(), strength::required);
    auto expr1 = c1.expression();
    EXPECT_EQ(expr1.constant(), 15);
    EXPECT_EQ(expr1.terms().size(), 2);
    
    // Test ==
    Constraint c2 = e1 == e2;
    EXPECT_EQ(c2.op(), RelationalOperator::OP_EQ);
    EXPECT_EQ(c2.strength(), strength::required);
    
    // Test >=
    Constraint c3 = e1 >= e2;
    EXPECT_EQ(c3.op(), RelationalOperator::OP_GE);
    EXPECT_EQ(c3.strength(), strength::required);
}
