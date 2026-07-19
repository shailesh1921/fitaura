import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DietModule from './components/DietModule';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#FAF6F0] selection:bg-terracotta selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <DietModule />
        <Stats />
        <Testimonials />
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
