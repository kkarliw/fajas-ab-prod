import Ticker from "@/components/Ticker";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductsSection from "@/components/ProductsSection";
import EditorialBand from "@/components/EditorialBand";
import Reviews from "@/components/Reviews";
import CareHighlights from "@/components/CareHighlights";
import FaqHome from "@/components/FaqHome";
import NewsletterSection from "@/components/NewsletterSection";
import ServiceStrip from "@/components/ServiceStrip";
import Footer from "@/components/Footer";
import PromoPopup from "@/components/PromoPopup";

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Ticker />
      <Navbar />
      <PromoBar />
      <main id="main">
        <HeroSection />
        <CategoriesSection />
        <ProductsSection />
        <EditorialBand />
        <Reviews />
        <CareHighlights />
        <FaqHome />
        <NewsletterSection />
        <ServiceStrip />
      </main>
      <Footer />
      <PromoPopup />
    </div>
  );
};

export default Index;
