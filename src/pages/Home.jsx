import Hero from '../components/sections/Hero';
import DonationCategories from '../components/sections/DonationCategories';
import AboutSection from '../components/sections/AboutSection';
import CausesSection from '../components/sections/CausesSection';
import CallToAction from '../components/sections/CallToAction';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <DonationCategories />
      <AboutSection />
      <CausesSection />
      <CallToAction />
    </div>
  );
};

export default Home;
