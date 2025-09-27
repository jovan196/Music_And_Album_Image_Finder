/* eslint-disable @typescript-eslint/no-unused-vars */

import localFont from "next/font/local";
import "./globals.css";
import React from 'react';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music and Album Image Finder",
  description: "This app finds similar music and album images easily using MIR and PCA algorithm.",
};


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const futura = localFont({
  src: "./fonts/Futura Light font.ttf",
  variable: "--font-futura",
  weight: "100 900",
});
const archivoblack = localFont({
  src: "./fonts/ArchivoBlack-Regular.ttf",
  variable: "--font-archivoblack",
  weight: "100 900",
});
const livvic = localFont({
  src: "./fonts/Livvic-ExtraLight.ttf",
  variable: "--font-livvic",
  weight: "100 900",
});
const livvicreg = localFont({
  src: "./fonts/Livvic-Regular.ttf",
  variable: "--font-livvicreg",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${futura.variable} ${archivoblack.variable} ${livvic.variable} ${livvicreg.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}