import { Announcement, BuyBand } from "@/components/home/Bands";
import EngineSteps from "@/components/home/EngineSteps";
import FrontrunnerRace from "@/components/home/FrontrunnerRace";
import Hero from "@/components/home/Hero";
import Movers from "@/components/home/Movers";
import Pairing from "@/components/home/Pairing";
import TickerTape from "@/components/home/TickerTape";

export default function Home() {
  return (
    <>
      <Hero />
      <BuyBand />
      <TickerTape />
      <EngineSteps />
      <Pairing />
      <Announcement />
      <Movers />
      <FrontrunnerRace />
    </>
  );
}
