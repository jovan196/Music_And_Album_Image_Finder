import type { AppProps } from 'next/app';
import '../styles/globals.css'; // Pastikan path ini sesuai dengan struktur proyek Anda

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
