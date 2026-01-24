/*-----------------------------------------------------------------------------
| Copyright (c) 2013-2026, Nucleic Development Team.
|
| Distributed under the terms of the Modified BSD License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
#pragma once
#include <functional>
#include <memory>
#include <utility>
#include "AssocVector.h"

namespace kiwi
{

namespace impl
{

template <
    typename K,
    typename V,
    typename C = std::less<K>,
    typename A = std::allocator<std::pair<K, V>>>
using MapType = Loki::AssocVector<K, V, C, A>;

} // namespace impl

} // namespace kiwi
