export default function ImageCard({ image, distance }) {
    return (
      <div className="relative group cursor-pointer bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={image}
          alt="Similar image"
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white text-sm text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Distance: {distance.toFixed(2)}
        </div>
      </div>
    );
  }
  