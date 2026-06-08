import Navbar from "../../wasteweb/app/components/Navbar";
import Hero from "../../wasteweb/app/components/Hero";
import Features from "../../wasteweb/app/components/Features";
import Footer from "../../wasteweb/app/components/Footer";
import How from "../../wasteweb/app/components/How";
import Cta from "../../wasteweb/app/components/Cta";
import Faq from "../../wasteweb/app/components/Faq";
import Newsletter from "../../wasteweb/app/components/Newsletter";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <Features />
      <How />
      <Faq />
  
      <Cta />
          <Newsletter />
      <Footer />
    </main>
  );
}