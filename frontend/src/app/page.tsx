import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "./sections/Hero";
import { FeaturedProjects } from "./sections/FeaturedProjects";
import { Skills } from "./sections/Skills";
import { LatestPosts } from "./sections/LatestPosts";
import { ContactCTA } from "./sections/ContactCTA";
import ProjectsGridClient from "./components/ProjectsGridClient";

export default async function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <FeaturedProjects />
        <Skills />
        <LatestPosts />
        <ContactCTA />
      </main>
      <Footer />
    </>
  );
}
