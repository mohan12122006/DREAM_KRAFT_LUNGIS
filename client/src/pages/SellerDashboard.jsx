import React, { useEffect, useState } from 'react';
import {
PackagePlus,
Store,
ShoppingBag,
IndianRupee,
Boxes,
Trash2,
RefreshCw,
ImagePlus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import '../styles/seller.css';

const emptyForm = {
name: '',
description: '',
categoryId: '',
fabric: '100% Cotton',
originalPrice: '',
salePrice: '',
discountPercentage: '',
stockQuantity: '',
imageUrl: '',
imageName: '',
isNewArrival: false,
isBestSeller: false,
colour: '',
sizeOrLength: '',
sku: ''
};

/*
Converts the selected image file into a smaller data URL.

This means the seller selects:
Product Image → Choose File → image from computer

No image URL needs to be entered.
*/
const compressImage = (file, maxWidth = 1200, quality = 0.82) =>
new Promise((resolve, reject) => {
if (!file.type.startsWith('image/')) {
reject(new Error('Please select a valid image file.'));
return;
}


const reader = new FileReader();

reader.onload = event => {
  const image = new Image();

  image.onload = () => {
    let width = image.width;
    let height = image.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    context.drawImage(
      image,
      0,
      0,
      width,
      height
    );

    /*
      JPEG keeps the database request smaller.
    */
    const dataUrl = canvas.toDataURL(
      'image/jpeg',
      quality
    );

    /*
      Prevent very large images from being sent.
    */
    if (dataUrl.length > 950000) {
      reject(
        new Error(
          'Image is too large. Please choose a smaller image.'
        )
      );
      return;
    }

    resolve(dataUrl);
  };

  image.onerror = () => {
    reject(new Error('Unable to read the selected image.'));
  };

  image.src = event.target.result;
};

reader.onerror = () => {
  reject(new Error('Unable to load the image file.'));
};

reader.readAsDataURL(file);


});

export default function SellerDashboard() {
const { user } = useAuth();
const navigate = useNavigate();

const [profile, setProfile] = useState(null);
const [stats, setStats] = useState(null);
const [products, setProducts] = useState([]);
const [orders, setOrders] = useState([]);
const [categories, setCategories] = useState([]);

const [form, setForm] = useState(emptyForm);

const [message, setMessage] = useState('');
const [error, setError] = useState('');
const [saving, setSaving] = useState(false);
const [imageLoading, setImageLoading] = useState(false);

const load = async () => {
setError('');


try {
  const [
    profileData,
    statsData,
    productsData,
    ordersData,
    categoriesData
  ] = await Promise.all([
    api.getSellerProfile(),
    api.getSellerDashboard(),
    api.getSellerProducts(),
    api.getSellerOrders(),
    api.getCategories()
  ]);

  setProfile(profileData);
  setStats(statsData);
  setProducts(productsData || []);
  setOrders(ordersData || []);
  setCategories(categoriesData || []);
} catch (err) {
  setError(
    err.message ||
    'Unable to load seller dashboard'
  );
}


};

useEffect(() => {
if (!user) {
navigate('/login');
return;
}


if (user.role !== 'seller') {
  navigate('/account');
  return;
}

load();


}, [user]);

const update = event => {
const {
name,
value,
type,
checked
} = event.target;


setForm(previous => ({
  ...previous,
  [name]:
    type === 'checkbox'
      ? checked
      : value
}));


};

/*
Seller selects the image from the computer.
*/
const handleImageChange = async event => {
const file = event.target.files?.[0];


if (!file) {
  return;
}

setError('');
setMessage('');
setImageLoading(true);

try {
  const dataUrl = await compressImage(file);

  setForm(previous => ({
    ...previous,
    imageUrl: dataUrl,
    imageName: file.name
  }));
} catch (err) {
  setForm(previous => ({
    ...previous,
    imageUrl: '',
    imageName: ''
  }));

  setError(
    err.message ||
    'Unable to process image'
  );
} finally {
  setImageLoading(false);
}


};

const addProduct = async event => {
event.preventDefault();


setSaving(true);
setMessage('');
setError('');

try {
  if (!form.imageUrl) {
    throw new Error(
      'Please select a product image.'
    );
  }

  if (!form.colour.trim()) {
    throw new Error(
      'Please enter the product colour.'
    );
  }

  if (!form.sizeOrLength.trim()) {
    throw new Error(
      'Please select the product size or length.'
    );
  }

  if (!form.sku.trim()) {
    throw new Error(
      'Please enter the SKU.'
    );
  }

  await api.createSellerProduct({
    name: form.name.trim(),

    description:
      form.description.trim(),

    categoryId:
      Number(form.categoryId),

    fabric:
      form.fabric.trim(),

    originalPrice:
      Number(form.originalPrice),

    salePrice:
      Number(form.salePrice),

    discountPercentage:
      Number(
        form.discountPercentage || 0
      ),

    stockQuantity:
      Number(
        form.stockQuantity || 0
      ),

    isNewArrival:
      form.isNewArrival,

    isBestSeller:
      form.isBestSeller,

    /*
      Selected computer image.
    */
    images: [
      {
        imageUrl: form.imageUrl,
        altText: form.name.trim()
      }
    ],

    /*
      Product colour + size + SKU.
    */
    variants: [
      {
        colour:
          form.colour.trim(),

        sizeOrLength:
          form.sizeOrLength.trim(),

        stockQuantity:
          Number(
            form.stockQuantity || 0
          ),

        sku:
          form.sku.trim()
      }
    ]
  });

  setForm(emptyForm);

  setMessage(
    'Product added successfully and published to the store.'
  );

  await load();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
} catch (err) {
  setError(
    err.message ||
    'Unable to add product'
  );
} finally {
  setSaving(false);
}


};

const removeProduct = async id => {
if (
!window.confirm(
'Delete this product?'
)
) {
return;
}


try {
  await api.deleteSellerProduct(id);

  setMessage(
    'Product deleted successfully.'
  );

  await load();
} catch (err) {
  setError(
    err.message ||
    'Unable to delete product'
  );
}


};

const updateStatus = async (
orderItemId,
status
) => {
try {
await api.updateSellerOrderItemStatus(
orderItemId,
status
);

  await load();
} catch (err) {
  setError(
    err.message ||
    'Unable to update order'
  );
}


};

if (!user || user.role !== 'seller') {
return null;
}

if (
profile &&
profile.status !== 'approved'
) {
return ( <section className="seller-page"> <div className="seller-status-card">


      <Store size={42} />

      <h1>
        Seller approval pending
      </h1>

      <p>
        Your store{' '}
        <strong>
          {profile.storeName}
        </strong>{' '}
        is currently{' '}
        <strong>
          {profile.status}
        </strong>
        . An administrator must approve
        the seller account before products
        and orders can be managed.
      </p>

      <Link
        to="/account"
        className="seller-secondary-button"
      >
        BACK TO ACCOUNT
      </Link>

    </div>
  </section>
);


}

return ( <section className="seller-page">


  <div className="seller-dashboard">

    {/* HEADER */}

    <div className="seller-dashboard-header">

      <div>

        <p className="seller-eyebrow">
          DREAM KRAFT LUNGIS MARKETPLACE
        </p>

        <h1>
          {profile?.storeName ||
            'Seller Dashboard'}
        </h1>

        <p>
          {profile?.city || ''}
          {profile?.state
            ? `, ${profile.state}`
            : ''}
        </p>

      </div>

      <button
        className="seller-secondary-button"
        onClick={load}
        type="button"
      >
        <RefreshCw size={17} />
        Refresh
      </button>

    </div>

    {error && (
      <div className="seller-error">
        {error}
      </div>
    )}

    {message && (
      <div className="seller-success">
        {message}
      </div>
    )}

    {/* STATS */}

    <div className="seller-stats">

      <div>
        <PackagePlus />
        <span>Products</span>
        <strong>
          {stats?.products ?? 0}
        </strong>
      </div>

      <div>
        <ShoppingBag />
        <span>Orders</span>
        <strong>
          {stats?.orders ?? 0}
        </strong>
      </div>

      <div>
        <IndianRupee />
        <span>Sales</span>
        <strong>
          ₹
          {Number(
            stats?.sales || 0
          ).toLocaleString(
            'en-IN'
          )}
        </strong>
      </div>

      <div>
        <Boxes />
        <span>Pending Items</span>
        <strong>
          {stats?.pendingItems ?? 0}
        </strong>
      </div>

    </div>

    <div className="seller-grid">

      {/* ADD PRODUCT */}

      <form
        className="seller-panel seller-form"
        onSubmit={addProduct}
      >

        <h2>
          Add Product
        </h2>

        <label>
          Product Name

          <input
            name="name"
            value={form.name}
            onChange={update}
            placeholder="Premium Royal Blue Cotton Lungi"
            required
          />

        </label>

        <label>
          Description

          <textarea
            name="description"
            value={form.description}
            onChange={update}
            rows="4"
            placeholder="Describe the product..."
            required
          />

        </label>

        <div className="seller-form-grid">

          <label>
            Category

            <select
              name="categoryId"
              value={form.categoryId}
              onChange={update}
              required
            >
              <option value="">
                Select Category
              </option>

              {categories.map(category => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}

            </select>

          </label>

          <label>
            Fabric

            <input
              name="fabric"
              value={form.fabric}
              onChange={update}
              placeholder="100% Cotton"
            />

          </label>

          <label>
            Colour

            <input
              name="colour"
              value={form.colour}
              onChange={update}
              placeholder="Royal Blue"
              required
            />

          </label>

          <label>
            Size / Length

            <select
              name="sizeOrLength"
              value={form.sizeOrLength}
              onChange={update}
              required
            >

              <option value="">
                Select Size / Length
              </option>

              <option value="Free Size">
                Free Size
              </option>

              <option value="2.00 m">
                2.00 m
              </option>

              <option value="2.10 m">
                2.10 m
              </option>

              <option value="2.20 m">
                2.20 m
              </option>

              <option value="2.30 m">
                2.30 m
              </option>

              <option value="Custom">
                Custom
              </option>

            </select>

          </label>

          <label>
            Original Price

            <input
              type="number"
              min="0"
              name="originalPrice"
              value={form.originalPrice}
              onChange={update}
              placeholder="599"
              required
            />

          </label>

          <label>
            Sale Price

            <input
              type="number"
              min="0"
              name="salePrice"
              value={form.salePrice}
              onChange={update}
              placeholder="499"
              required
            />

          </label>

          <label>
            Discount %

            <input
              type="number"
              min="0"
              max="95"
              name="discountPercentage"
              value={form.discountPercentage}
              onChange={update}
              placeholder="15"
            />

          </label>

          <label>
            Stock

            <input
              type="number"
              min="0"
              name="stockQuantity"
              value={form.stockQuantity}
              onChange={update}
              placeholder="50"
              required
            />

          </label>

          <label>
            SKU

            <input
              name="sku"
              value={form.sku}
              onChange={update}
              placeholder="DKL-RB-210"
              required
            />

          </label>

        </div>

        {/* IMAGE FILE UPLOAD */}

        <div className="seller-image-upload">

          <label>
            Product Image

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleImageChange}
              required={!form.imageUrl}
            />

          </label>

          <p className="seller-form-help">
            Select the product image directly
            from your computer. No image URL
            is required.
          </p>

          {imageLoading && (
            <p className="seller-muted">
              Processing image...
            </p>
          )}

          {form.imageName &&
            form.imageUrl && (
              <div className="seller-image-preview">

                <img
                  src={form.imageUrl}
                  alt={
                    form.name ||
                    'Product preview'
                  }
                />

                <div>
                  <strong>
                    {form.imageName}
                  </strong>

                  <span>
                    Image selected successfully
                  </span>
                </div>

              </div>
            )}

        </div>

        {/* OPTIONS */}

        <div className="seller-checkboxes">

          <label>
            <input
              type="checkbox"
              name="isNewArrival"
              checked={
                form.isNewArrival
              }
              onChange={update}
            />

            New arrival
          </label>

          <label>
            <input
              type="checkbox"
              name="isBestSeller"
              checked={
                form.isBestSeller
              }
              onChange={update}
            />

            Best seller
          </label>

        </div>

        <button
          className="seller-primary-button"
          disabled={
            saving ||
            imageLoading
          }
          type="submit"
        >
          {saving
            ? 'ADDING...'
            : 'ADD PRODUCT'}
        </button>

      </form>

      {/* MY PRODUCTS */}

      <div className="seller-panel">

        <h2>
          My Products
        </h2>

        <div className="seller-product-list">

          {products.length ? (
            products.map(product => (

              <div
                className="seller-product-row"
                key={product.id}
              >

                <div>

                  <strong>
                    {product.name}
                  </strong>

                  <span>
                    {product.categoryName ||
                      'Uncategorised'}
                    {' · '}
                    ₹{product.salePrice}
                  </span>

                  <small>
                    Stock:{' '}
                    {product.stockQuantity}
                  </small>

                </div>

                <button
                  title="Delete product"
                  type="button"
                  onClick={() =>
                    removeProduct(
                      product.id
                    )
                  }
                >
                  <Trash2 size={17} />
                </button>

              </div>

            ))
          ) : (
            <p className="seller-muted">
              No products yet.
            </p>
          )}

        </div>

      </div>

    </div>

    {/* SELLER ORDERS */}

    <div className="seller-panel">

      <h2>
        Seller Orders
      </h2>

      <div className="seller-orders-table">

        {orders.length ? (
          orders.map(order => (

            <div
              className="seller-order-row"
              key={order.orderItemId}
            >

              <div>

                <strong>
                  {order.orderNumber}
                </strong>

                <span>
                  {order.productName}
                  {' × '}
                  {order.quantity}
                </span>

                <small>
                  {order.customerName}
                  {' · '}
                  {order.city},{' '}
                  {order.state}
                </small>

              </div>

              <div>

                <strong>
                  ₹{order.totalPrice}
                </strong>

                <select
                  value={
                    order.sellerStatus
                  }
                  onChange={event =>
                    updateStatus(
                      order.orderItemId,
                      event.target.value
                    )
                  }
                >

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="processing">
                    Processing
                  </option>

                  <option value="shipped">
                    Shipped
                  </option>

                  <option value="delivered">
                    Delivered
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>

          ))
        ) : (
          <p className="seller-muted">
            No seller orders yet.
          </p>
        )}

      </div>

    </div>

  </div>

</section>


);
}
