export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Smartphone X",
    price: 699,
    image: "https://via.placeholder.com/150",
    rating: 4.5,
    description: "Latest smartphone with high-end features."
  },
  {
    id: "2",
    name: "Laptop Pro",
    price: 1299,
    image: "https://via.placeholder.com/150",
    rating: 4.8,
    description: "Powerful laptop for professionals."
  },
  {
    id: "3",
    name: "Wireless Headphones",
    price: 199,
    image: "https://via.placeholder.com/150",
    rating: 4.2,
    description: "Noise cancelling wireless headphones."
  }
];
