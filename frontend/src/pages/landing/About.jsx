import { useState, useEffect } from "react"
import { Calendar, Users, Globe, Zap, Shield, Heart, Github, ArrowRight, Star, Code, Database, Linkedin } from "lucide-react"
import { useNavigate } from "react-router-dom"


const About = () => {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Event Creation & Management",
      description: "Create, customize, and manage tech events with our intuitive dashboard. From hackathons to conferences, we've got you covered."
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Community Building",
      description: "Connect with like-minded developers, designers, and tech enthusiasts. Build lasting relationships through shared experiences."
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-600" />,
      title: "Global Reach",
      description: "Host virtual or in-person events with participants from around the world. Break geographical barriers in tech education."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Real-time Updates",
      description: "Stay connected with live notifications, real-time chat, and instant updates about your favorite events and organizers."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Secure & Reliable",
      description: "Built with security first. Your data is protected with enterprise-grade security measures and reliable infrastructure."
    },
    {
      icon: <Heart className="h-8 w-8 text-pink-600" />,
      title: "Community Driven",
      description: "Made by developers, for developers. Open source and community-driven development ensures continuous improvement."
    }
  ]

  const techStack = [
    { name: "React", description: "Modern frontend framework", color: "bg-blue-100 text-blue-800" },
    { name: "Django", description: "Robust backend framework", color: "bg-green-100 text-green-800" },
    { name: "PostgreSQL", description: "Reliable database", color: "bg-indigo-100 text-indigo-800" },
    { name: "Cloudinary", description: "Media management", color: "bg-orange-100 text-orange-800" },
    { name: "WebSockets", description: "Real-time communication", color: "bg-purple-100 text-purple-800" },
    { name: "Tailwind CSS", description: "Modern styling", color: "bg-cyan-100 text-cyan-800" }
  ]

  const stats = [
    { number: "50+", label: "Events Hosted", icon: <Calendar className="h-6 w-6" /> },
    { number: "1000+", label: "Active Users", icon: <Users className="h-6 w-6" /> },
    { number: "25+", label: "Tech Categories", icon: <Code className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <Database className="h-6 w-6" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              About <span className="text-yellow-300">Eventify</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              The future of tech event management. Where innovation meets community.
            </p>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-blue-300/20 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            To democratize tech event management and create meaningful connections within the developer community. 
            We believe that great events can spark innovation, foster learning, and build lasting professional relationships.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4 text-blue-600">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose Eventify?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with cutting-edge technology and designed for the modern tech community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: `${index * 100}ms` }}>
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Built with Modern Technology</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by a robust tech stack that ensures scalability, performance, and reliability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <div key={index} className="text-center">
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${tech.color} mb-2`}>
                  {tech.name}
                </div>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Section - UPDATED */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Meet the Developer</h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">SM</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Sooraj M S</h3>
            <p className="text-blue-200 mb-4">Full Stack Developer & Tech Enthusiast</p>
            <p className="text-gray-300 leading-relaxed mb-6">
              Passionate about creating meaningful digital experiences that bring the tech community together. 
              With expertise in modern web technologies, I built Eventify to solve real problems in event management.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="https://github.com/sooraj-m-s"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub Profile
              </a>
              <a 
                href="https://www.linkedin.com/in/sooraj-m-s/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of developers and organizers who trust Eventify for their tech events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
              Start Creating Events
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            <button onClick={() => navigate('/')} className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 transition-colors">
              Explore Events
              <Star className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About