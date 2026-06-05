import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <Features />
    </main>
  );
}