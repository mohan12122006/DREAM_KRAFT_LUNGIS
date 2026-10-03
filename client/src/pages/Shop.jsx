import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import EmptyState from '../components/EmptyState.jsx';
import Loading from '../components/Loading.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { api } from '../services/api.js';

export default function Shop({ preset }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read search directly from URL
  const urlSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(urlSearch);

  const debouncedSearch = useDebounce(search, 300);

  // Keep input synchronized with URL search
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Load products
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch.trim()) {
      params.set('search', debouncedSearch.trim());
    } else {
      params.delete('search');
    }

    if (preset === 'new') {
      params.set('newArrival', 'true');
    } else {
      params.delete('newArrival');
    }

    if (preset === 'best') {
      params.set('bestSeller', 'true');
    } else {
      params.delete('bestSeller');
    }

    if (preset === 'offers') {
      params.set('offers', 'true');
    } else {
      params.delete('offers');
    }

    setLoading(true);

    api
      .getProducts(`?${params.toString()}`)
      .then(data => {
        setProducts(data?.items || []);
        setMeta(data?.meta || {});
      })
      .catch(error => {
        console.error('Product search error:', error);
        setProducts([]);
        setMeta({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, debouncedSearch, preset]);

  // Load categories
  useEffect(() => {
    api
      .getCategories()
      .then(data => {
        setCategories(data || []);
      })
      .catch(error => {
        console.error('Category loading error:', error);
      });
  }, []);

  // Update URL filters
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    setSearchParams(params);
  };

  // Search input
  const handleSearchChange = event => {
    const value = event.target.value;

    setSearch(value);

    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }

    setSearchParams(params);
  };

  const heading = useMemo(() => {
    if (preset === 'new') return 'New Arrivals';
    if (preset === 'best') return 'Best Sellers';
    if (preset === 'offers') return 'Special Offers';

    return urlSearch
      ? `Search Results for "${urlSearch}"`
      : 'Shop Cotton Lungis';
  }, [preset, urlSearch]);

  return (
    <section className="shop-page content-section">

      <SectionHeader
        eyebrow="DREAM KRAFT LUNGIS"
        title={heading}
      >
        Search, filter and sort premium cotton lungis by category, colour,
        rating and price.
      </SectionHeader>

      <div className="shop-layout">

        <aside className="filters" aria-label="Product filters">

          <h2>
            <SlidersHorizontal size={18} />
            Filters
          </h2>

          {/* SEARCH */}
          <label>
            Search

            <input
              type="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="Blue cotton lungi"
            />
          </label>

          {/* CATEGORY */}
          <label>
            Category

            <select
              value={searchParams.get('category') || ''}
              onChange={event =>
                updateFilter('category', event.target.value)
              }
            >
              <option value="">All categories</option>

              {categories.map(category => (
                <option
                  key={category.id}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          {/* PRICE */}
          <label>
            Price

            <select
              value={searchParams.get('price') || ''}
              onChange={event =>
                updateFilter('price', event.target.value)
              }
            >
              <option value="">Any price</option>
              <option value="0-450">Under Rs. 450</option>
              <option value="451-550">Rs. 451 - Rs. 550</option>
              <option value="551-700">Above Rs. 550</option>
            </select>
          </label>

          {/* COLOUR */}
          <label>
            Colour

            <select
              value={searchParams.get('colour') || ''}
              onChange={event =>
                updateFilter('colour', event.target.value)
              }
            >
              <option value="">Any colour</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="White">White</option>
              <option value="Maroon">Maroon</option>
            </select>
          </label>

          {/* RATING */}
          <label>
            Rating

            <select
              value={searchParams.get('rating') || ''}
              onChange={event =>
                updateFilter('rating', event.target.value)
              }
            >
              <option value="">Any rating</option>
              <option value="4">4 stars and up</option>
              <option value="4.5">4.5 stars and up</option>
            </select>
          </label>

          {/* SORT */}
          <label>
            Sort

            <select
              value={searchParams.get('sort') || 'newest'}
              onChange={event =>
                updateFilter('sort', event.target.value)
              }
            >
              <option value="newest">Newest</option>
              <option value="price_asc">
                Price low to high
              </option>
              <option value="price_desc">
                Price high to low
              </option>
              <option value="rating">
                Rating
              </option>
            </select>
          </label>

        </aside>

        <div className="product-results">

          <p className="result-count">
            {loading
              ? 'Searching products...'
              : `${meta.total || products.length || 0} products found`}
          </p>

          {loading ? (
            <Loading />
          ) : products.length ? (
            <div className="product-grid">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products found"
              message={
                urlSearch
                  ? `No products found for "${urlSearch}". Try another product name or colour.`
                  : 'Try a different filter or search term.'
              }
            />
          )}

        </div>

      </div>

    </section>
  );
}