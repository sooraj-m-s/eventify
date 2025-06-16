import { useEffect, useState } from "react"


const VideoSection = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoUrl = "https://res.cloudinary.com/dogt3mael/video/upload/q_auto,f_auto/203987-923133879_tiny_qwpe2c.mp4"

  useEffect(() => {
    const video = document.createElement("video")
    video.src = videoUrl
    video.onloadeddata = () => setIsVideoLoaded(true)
    video.load()
  }, [videoUrl])

  return (
    <>
      <div className="relative h-screen overflow-hidden">
        <video
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          onError={(e) => {
            console.error("Video failed to load:", e)
            setIsVideoLoaded(false)
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source
            src="https://res.cloudinary.com/dogt3mael/video/upload/q_auto,f_webm/203987-923133879_tiny_qwpe2c.webm"
            type="video/webm"
          />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">Loading video...</div>
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
              <span className="inline-block animate-slide-in-left">Where</span>
              <span className="inline-block mx-3 animate-slide-in-up animation-delay-300">Dreams</span>
              <br />
              <span className="inline-block animate-slide-in-right animation-delay-600">Meet</span>
              <span className="inline-block mx-3 animate-scale-in animation-delay-900 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Reality
              </span>
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl font-light mb-8 text-gray-200 max-w-3xl mx-auto animate-typewriter animation-delay-1200">
              Every celebration tells a story. Every moment becomes a memory. Let us craft yours with perfection.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center space-x-4 animate-fade-in animation-delay-1500">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 animate-bounce-in animation-delay-1800">
              <span className="inline-block px-6 py-3 border border-white/30 rounded-full text-sm font-medium backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300">
                ✨ Creating Unforgettable Experiences
              </span>
            </div>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-yellow-400 rounded-full animate-float animation-delay-500 opacity-70"></div>
          <div className="absolute top-32 right-16 w-2 h-2 bg-pink-400 rounded-full animate-float animation-delay-1000 opacity-60"></div>
          <div className="absolute bottom-24 left-20 w-4 h-4 bg-purple-400 rounded-full animate-float animation-delay-1500 opacity-50"></div>
          <div className="absolute bottom-40 right-12 w-2.5 h-2.5 bg-blue-400 rounded-full animate-float animation-delay-2000 opacity-70"></div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(100px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes typewriter {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          50% {
            transform: translateY(-10px) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out both;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out both;
        }

        .animate-slide-in-up {
          animation: slideInUp 0.8s ease-out both;
        }

        .animate-scale-in {
          animation: scaleIn 1s ease-out both;
        }

        .animate-typewriter {
          animation: typewriter 1s ease-out both;
        }

        .animate-bounce-in {
          animation: bounceIn 0.8s ease-out both;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out both;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-900 {
          animation-delay: 0.9s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }

        .animation-delay-1500 {
          animation-delay: 1.5s;
        }

        .animation-delay-1800 {
          animation-delay: 1.8s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  )
}

export default VideoSection