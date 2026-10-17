import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { Security } from "./components/Security";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <>
      <a
        href="#how"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-30 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-fog"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Security />
      </main>
      <Footer />
    </>
  );
}
