import LandingNavbar from "./LandingNavbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowItWorksSection from "./HowItWorksSection";
import CTASection from "./CTASection";
import Footer from "./Footer";
import "../../styles/landing.css";

function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;

