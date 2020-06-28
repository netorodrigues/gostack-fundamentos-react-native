import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProducts = await AsyncStorage.getItem('Products');
      if (storedProducts) setProducts(JSON.parse(storedProducts));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product): Promise<void> => {
      const alreadyExistsProduct = products.filter(
        existingProduct => existingProduct.id === product.id,
      );

      product.quantity = 1;
      const actualProducts = [product, ...products];
      setProducts(actualProducts);
      await AsyncStorage.setItem('Products', JSON.stringify(actualProducts));
    },
    [setProducts, products],
  );

  const increment = useCallback(
    async id => {
      const productObject = products.filter(
        projectListed => projectListed.id === id,
      )[0];
      productObject.quantity += 1;
      const otherProducts = products.filter(product => product.id !== id);
      const actualProducts = [productObject, ...otherProducts];
      setProducts(actualProducts);
      await AsyncStorage.setItem('Products', JSON.stringify(actualProducts));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productObject = products.filter(
        projectListed => projectListed.id === id,
      )[0];
      productObject.quantity -= 1;
      let actualProducts;
      if (productObject.quantity <= 0) {
        actualProducts = products.filter(
          actualProduct => actualProduct.id !== id,
        );
      } else {
        const otherProducts = products.filter(product => product.id !== id);
        actualProducts = [productObject, ...otherProducts];
      }
      setProducts(actualProducts);
      await AsyncStorage.setItem('Products', JSON.stringify(actualProducts));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
