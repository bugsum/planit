import { Closing } from "@/components/home/Closing";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { KeyboardShowcase } from "@/components/home/KeyboardShowcase";
import { Planners } from "@/components/home/Planners";
import { Principles } from "@/components/home/Principles";

export default function Home() {
  return (
    <>
      <Hero />
      <Principles />
      <Features />
      <KeyboardShowcase />
      <Planners />
      <Closing />
    </>
  );
}
