import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import How from "./components/How";
import Cta from "./components/Cta";
import Faq from "./components/Faq";
import Newsletter from "./components/Newsletter";

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