import Navbar from "../../wasteweb/app/components/Navbar";
import Hero from "../../wasteweb/app/components/Hero";
import Features from "../../wasteweb/app/components/Features";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <Features />
    </main>
  );
}