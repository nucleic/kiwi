/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2017, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include <vector>
#include "term.h"

namespace kiwi
{

class Expression
{

public:
    Expression(double constant = 0.0) : m_constant(constant) {}

    Expression(const Term &term, double constant = 0.0) : m_terms(1, term), m_constant(constant) {}

    Expression(std::vector<Term> terms, double constant = 0.0) : m_terms(std::move(terms)), m_constant(constant) {}

    Expression(const Expression&) = default;

    Expression(Expression&&) noexcept = default;

    ~Expression() = default;

    const std::vector<Term> &terms() const
    {
        return m_terms;
    }

    double constant() const
    {
        return m_constant;
    }

    double value() const
    {
        double result = m_constant;

        for (const Term &term : m_terms)
            result += term.value();

        return result;
    }

    Expression& operator=(const Expression&) = default;

    Expression& operator=(Expression&&) noexcept = default;

private:
    std::vector<Term> m_terms;
    double m_constant;
};

} // namespace kiwi
