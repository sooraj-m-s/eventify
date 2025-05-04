import { useState, useEffect, useRef } from "react"


const ImageSlider = ({ images, interval = 2000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const timeoutRef = useRef(null)

  const slidesData = images

  // Reset the timer when the slide changes
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    resetTimeout()
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex === slidesData.length - 1 ? 0 : prevIndex + 1))
    }, interval)

    return () => {
      resetTimeout()
    }
  }, [currentIndex, interval, slidesData.length])

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800">
      {/* Slides */}
      {slidesData.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100" : "opacity-20"
          }`}
        >
          <img src={image || "/placeholder.svg"} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-40"></div>
        </div>
      ))}

      {/* Overlay text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Welcome to Eventify</h1>
        <p className="text-xl md:text-2xl text-center max-w-md">Discover and book amazing events in your area</p>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {slidesData.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageSlider