import { useState, useEffect } from "react"
import HeroSection from "../../components/home/HeroSection"
import Categories from "../../components/home/categories"
import Events from "../../components/home/events"
import Organizers from "../../components/home/organizers"
import axiosInstance from "../../utils/axiosInstance"


const Home = () => {
  const [categories, setCategories] = useState([])
  const [events, setEvents] = useState([])
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState({
    categories: true,
    events: true,
    organizers: true,
  })
  const [error, setError] = useState({
    categories: null,
    events: null,
    organizers: null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await axiosInstance.get("/categories/")
        setCategories(categoriesResponse.data.categories || [])
        setLoading((prev) => ({ ...prev, categories: false }))
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError((prev) => ({ ...prev, categories: "Failed to load categories" }))
        setLoading((prev) => ({ ...prev, categories: false }))
      }

      try {
        const eventsResponse = await axiosInstance.get("/events/")
        setEvents(eventsResponse.data || [])
        setLoading((prev) => ({ ...prev, events: false }))
      } catch (err) {
        console.error("Error fetching events:", err)
        setError((prev) => ({ ...prev, events: "Failed to load events" }))
        setLoading((prev) => ({ ...prev, events: false }))
      }

      try {
        const organizersResponse = await axiosInstance.get("/users/organizers/")
        setOrganizers(organizersResponse.data || [])
        setLoading((prev) => ({ ...prev, organizers: false }))
      } catch (err) {
        console.error("Error fetching organizers:", err)
        setError((prev) => ({ ...prev, organizers: "Failed to load organizers" }))
        setLoading((prev) => ({ ...prev, organizers: false }))
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <div className="container mx-auto px-4 py-8">
        <Categories categories={categories} loading={loading.categories} error={error.categories} />

        <Events events={events} loading={loading.events} error={error.events} />

        <Categories />

        <Organizers organizers={organizers} loading={loading.organizers} error={error.organizers} />

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