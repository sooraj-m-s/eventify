import heroBackground from "../../assets/home-banner.jpg"


const HeroSection = () => {

  return (
    <div
      className="relative h-[400px] md:h-[500px] bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
          Love in Every Detail, Planned for You
        </h1>
      </div>
    </div>
  )
}

export default HeroSection