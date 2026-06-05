import Navbar from "../../wasteweb/app/components/Navbar";
import Hero from "../../wasteweb/app/components/Hero";
import Features from "../../wasteweb/app/components/Features";
import Footer from "../../wasteweb/app/components/Footer";
import How from "../../wasteweb/app/components/How";
import Cta from "../../wasteweb/app/components/Cta";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <Features />
      <How />
      <Cta />
      <Footer />
    </main>
  );
}