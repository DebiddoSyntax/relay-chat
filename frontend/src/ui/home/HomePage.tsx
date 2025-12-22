"use client"
import HeroSection from "./HeroSection"
import LetsBuildTogether from "./LetsBuildTogether"
import WhyChooseUs from "./WhyChooseUs"

function HomePage() {
    return (
      <div className="w-full">
          <HeroSection />
          <WhyChooseUs />
          <LetsBuildTogether />
      </div>
    )
}

export default HomePage
