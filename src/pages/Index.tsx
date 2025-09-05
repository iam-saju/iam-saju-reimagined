import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-foreground font-sans relative">
      <Navigation />
      
      <main>
        <Hero />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
