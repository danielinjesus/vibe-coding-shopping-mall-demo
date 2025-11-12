import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import MainPage from './pages/MainPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/admin/AdminPage'
import ProductCreatePage from './pages/admin/ProductCreatePage'
import ProductEditPage from './pages/admin/ProductEditPage'
import ProductListPage from './pages/admin/ProductListPage'
import OrderListPage from './pages/admin/OrderListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import MyOrdersPage from './pages/MyOrdersPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import OrderFailPage from './pages/OrderFailPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/products" element={<ProductListPage />} />
        <Route path="/admin/product/create" element={<ProductCreatePage />} />
        <Route path="/admin/product/edit/:id" element={<ProductEditPage />} />
        <Route path="/admin/orders" element={<OrderListPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/order-fail" element={<OrderFailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
