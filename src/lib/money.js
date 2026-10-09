// Todos los precios se guardan en centavos (USD) para evitar errores de decimales.
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const usd = (cents) => fmt.format(cents / 100);

// Mínimo que debe sumar un pedido de productos sueltos.
export const PRODUCT_ORDER_MIN_CENTS = 300;
      
