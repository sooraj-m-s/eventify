import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"


const HeroSection = () => {
  const navigate = useNavigate()

  const handleExploreEvents = () => {
    navigate("/events")
  }

  return (
    <div className="relative h-screen overflow-hidden">
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
        <source src="https://res.cloudinary.com/dogt3mael/video/upload/v1/4907-360_ypkgtn.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/95"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 animate-fade-in transform translate-y-0 opacity-100 transition-all duration-1000 ease-out">
          <span className="inline-block animate-pulse">Love</span>
          <span className="inline-block mx-2">in</span>
          <span className="inline-block animate-pulse animation-delay-200">Every</span>
          <span className="inline-block mx-2">Detail,</span>
          <span className="inline-block animate-pulse animation-delay-400">Planned</span>
          <span className="inline-block mx-2">for</span>
          <span className="inline-block animate-pulse animation-delay-600">You</span>
        </h1>

        <button
          onClick={handleExploreEvents}
          className="mt-8 px-8 py-4 bg-white text-black font-semibold text-lg rounded-full hover:bg-gray-100 transition-all duration-300 hover:scale-105 transform animate-fade-in-delayed"
        >
          Explore Events
        </button>
      </div>

      {/* Animated Down Arrows */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">
        <ChevronDown className="w-6 h-6 text-white animate-bounce-arrow" />
        <ChevronDown className="w-6 h-6 text-white animate-bounce-arrow animation-delay-300" />
        <ChevronDown className="w-6 h-6 text-white animate-bounce-arrow animation-delay-600" />
        <ChevronDown className="w-6 h-6 text-white animate-bounce-arrow animation-delay-900" />
      </div>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDelayed {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceArrow {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          40% {
            transform: translateY(8px);
            opacity: 1;
          }
          60% {
            transform: translateY(4px);
            opacity: 0.9;
          }
        }
        h1 {
          animation: fadeInUp 1.2s ease-out;
        }
        h1 span {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-fade-in-delayed {
          animation: fadeInDelayed 1s ease-out 1.5s both;
        }
        .animate-bounce-arrow {
          animation: bounceArrow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default HeroSection