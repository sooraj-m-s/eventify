import HeroSection from "../../components/home/HeroSection"
import Categories from "../../components/home/categories"
import Events from "../../components/home/events"
import Organizers from "../../components/home/organizers"


const Home = () => {

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        
        <Events />

        <Categories />
        
        <Organizers />
        
        <Categories />

        <div className="my-16 text-center">
          <h2 className="text-2xl font-semibold mb-8 relative inline-block">
            <span className="relative z-10">Your Events, Their Stories of Success</span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300 z-0"></div>
          </h2>
        </div>
      </div>
    </div>
  )
}

export default Home