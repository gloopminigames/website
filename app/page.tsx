import Hero from '@/components/Hero';
import ContinueBlock from '@/components/ContinueBlock';
import GamesSection from '@/components/GamesSection';
import ChallengeBlock from '@/components/ChallengeBlock';
import HowBlock from '@/components/HowBlock';

export default function Home() {
  return (
    <>
      <Hero />
      <ContinueBlock />
      <GamesSection title="Populair vandaag" />
      <ChallengeBlock />
      <HowBlock />
    </>
  );
}
