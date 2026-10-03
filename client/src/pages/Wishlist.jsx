import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney } from '../utils/money.js';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addItem } = useCart();

  return (
    <section className="wishlist-page content-section">
      <div className="container">

        {/* HEADER */}
        <div className="wishlist-header">
          <div>
            <p className="eyebrow">DREAM KRAFT LUNGIS</p>
            <h1>My Wishlist</h1>
            <p>
              Your favourite lungis saved in one place.
            </p>
          </div>

          <div className="wishlist-count">
            <Heart size={20} />
            <span>
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
        </div>

        {/* EMPTY WISHLIST */}
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">

            <div className="wishlist-empty-icon">
              <Heart size={42} />
            </div>

            <h2>Your Wishlist is Empty</h2>

            <p>
              You haven't added any lungis to your wishlist yet.
              Browse our collection and tap the ❤️ icon to save
              your favourite products.
            </p>

            <Link
              to="/shop"
              className="btn btn-primary"
            >
              <ShoppingBag size={18} />
              SHOP NOW
            </Link>

          </div>
        ) : (

          /* WISHLIST PRODUCTS */
          <div className="wishlist-grid">

            {wishlist.map((item) => {

              // Logged-in wishlist items may contain product inside item.product
              const product = item.product || item;

              if (!product) return null;

              const image =
                product.images?.[0]?.imageUrl ||
                product.imageUrl ||
                '/images/hero.jpg';

              const alt =
                product.images?.[0]?.altText ||
                product.name ||
                'DREAM KRAFT LUNGI';

              return (
                <article
                  className="wishlist-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}
                  <Link
                    to={`/products/${product.slug}`}
                    className="wishlist-image"
                  >
                    <img
                      src={image}
                      alt={alt}
                      loading="lazy"
                    />
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="wishlist-card-content">

                    <Link
                      to={`/products/${product.slug}`}
                      className="wishlist-product-title"
                    >
                      {product.name}
                    </Link>

                    <div className="wishlist-price">
                      <strong>
                        {formatMoney(product.salePrice)}
                      </strong>

                      {product.originalPrice && (
                        <del>
                          {formatMoney(product.originalPrice)}
                        </del>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="wishlist-actions">

                      <button
                        className="btn btn-primary"
                        type="button"
                        disabled={product.stockQuantity <= 0}
                        onClick={() => addItem(product)}
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>

                      <button
                        className="wishlist-remove"
                        type="button"
                        title="Remove from wishlist"
                        aria-label={`Remove ${product.name} from wishlist`}
                        onClick={() => toggleWishlist(product)}
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </div>
    </section>
  );
}