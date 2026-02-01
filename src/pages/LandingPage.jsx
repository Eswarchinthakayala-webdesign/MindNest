import React from 'react';
import AntiGravityBackground from '../components/landing/AntiGravityBackground';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TrustSection from '../components/landing/TrustSection';
import Footer from '../components/landing/Footer';
import Header from '../components/landing/Header';

import AboutSection from '../components/landing/AboutSection';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white font-sans">
      {/* Texture Overlay */}
      <div className="bg-noise" />
      
      {/* Background System */}
      <AntiGravityBackground />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="relative z-10 flex flex-col">
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <TrustSection />
      </main>
      
      <Footer />
    </div>
  );
}

export default LandingPage;