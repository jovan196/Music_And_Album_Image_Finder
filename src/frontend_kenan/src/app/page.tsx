import Image from "next/image";
import React from "react";

export default function Page() {
  return (
    <div 
      style={{
        backgroundImage: 'url(/tubesalgeo2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        height: '100vh', /* Ensures the full height of the viewport */
        margin: 0,
        padding: 0,
      }}
    >
    </div>
  );
}