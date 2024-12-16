import type { AppProps } from 'next/app';
import '../styles/globals.css'; // Ensure this path is correct
import Layout from '../components/Layout'; // Ensure this path is correct

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}