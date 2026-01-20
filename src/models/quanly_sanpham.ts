// src/models/quanly_sanpham.ts
import { useState } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default () => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Laptop Dell XPS 13', price: 25000000, quantity: 10 },
    { id: 2, name: 'iPhone 15 Pro Max', price: 30000000, quantity: 15 },
    { id: 3, name: 'Samsung Galaxy S24', price: 22000000, quantity: 20 },
    { id: 4, name: 'iPad Air M2', price: 18000000, quantity: 12 },
    { id: 5, name: 'MacBook Air M3', price: 28000000, quantity: 8 },
  ]);

  const [searchText, setSearchText] = useState('');

  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    // Tạo ID mới (tăng dần từ ID lớn nhất hiện có)
    const newId = products.length > 0 
      ? Math.max(...products.map(p => p.id)) + 1 
      : 1;
    
    const productWithId: Product = {
      id: newId,
      ...newProduct
    };
    
    // Cập nhật state
    setProducts(prev => [...prev, productWithId]);
    
    // Trả về sản phẩm đã thêm
    return productWithId;
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getFilteredProducts = () => {
    if (!searchText.trim()) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
  };
  return {
    products,
    searchText,
    setSearchText,
    addProduct,
    deleteProduct,
    getFilteredProducts
  };
};