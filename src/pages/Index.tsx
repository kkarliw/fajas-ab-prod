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
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-cream">
      <SEO />
      <Ticker />
      <Navbar />
      <PromoBar />
      <main id="main">
        <h1 className="sr-only">Fajas Colombianas Postquirúrgicas, Reductoras y Moldeadoras - FAJAS AB</h1>
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
