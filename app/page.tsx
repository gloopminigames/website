import Hero from '@/components/Hero';
import ContinueBlock from '@/components/ContinueBlock';
import GamesSection from '@/components/GamesSection';
import ChallengeBlock from '@/components/ChallengeBlock';
import HowBlock from '@/components/HowBlock';
import InstallApp from '@/components/InstallApp';

export default function Home() {
  return (
    <>
      <Hero />
      <InstallApp variant="banner" />
      <ContinueBlock />
      <GamesSection title="Populair vandaag" soonLimit={4} />
      <ChallengeBlock />
      <HowBlock />
    </>
  );
}
