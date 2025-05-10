const ImageSlider = ({ images }) => {

  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src={images}
        alt="Eventify Welcome"
        className="h-full w-full object-cover"
        onError={() => console.error("Image failed to load")}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Welcome to Eventify</h1>
        <p className="text-xl md:text-2xl text-center max-w-md">Discover and book amazing events in your area</p>
      </div>
    </div>
  )
}

export default ImageSlider