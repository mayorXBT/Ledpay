import { Agent } from "./components/Agent";
import { Faq } from "./components/Faq";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Limits } from "./components/Limits";
import { Nav } from "./components/Nav";
import { Status } from "./components/Status";
import { Steps } from "./components/Steps";
import { Tools } from "./components/Tools";

export default function App() {
  return (
    <>
      <a href="#features" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-20 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Steps />
        <Agent />
        <Tools />
        <Limits />
        <Status />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
