import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

import formatValue from '../utils/formatValue';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Pick<Product, 'id' | 'title' | 'image_url' | 'price'>): void;
  increment(id: string): void;
  decrement(id: string): void;
  cartTotal: string;
  totalItensInCart: number;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts([...JSON.parse(storagedProducts)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const incrementProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(incrementProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(incrementProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const decrementProducts = products.map(p => {
        if (p.id === id) {
          if (p.quantity - 1 >= 0) {
            return {
              ...p,
              quantity: p.quantity - 1,
            };
          }
        }
        return p;
      });
      const restProducts = decrementProducts.filter(p => p.quantity > 0);
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      setProducts(restProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(restProducts),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const productsExist = products.find(p => p.id === product.id);

      if (productsExist) {
        increment(productsExist.id);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products, increment],
  );

  const cartTotal = useMemo(() => {
    // TODO RETURN THE SUM OF THE QUANTITY OF THE PRODUCTS IN THE CART
    const total = products.reduce((accumulator, product) => {
      const productSubtotal = product.price * product.quantity;

      return accumulator + productSubtotal;
    }, 0);

    return formatValue(total);
  }, [products]);

  const totalItensInCart = useMemo(() => {
    // TODO RETURN THE SUM OF THE QUANTITY OF THE PRODUCTS IN THE CART
    const productsQuantity = products.reduce((accumulator, product) => {
      const productSubtotal = product.quantity;

      return accumulator + productSubtotal;
    }, 0);

    return productsQuantity;
  }, [products]);

  const value = React.useMemo(
    () => ({
      addToCart,
      increment,
      decrement,
      products,
      cartTotal,
      totalItensInCart,
    }),
    [products, addToCart, increment, decrement, cartTotal, totalItensInCart],
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
