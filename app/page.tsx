import HomeTop from '@/components/HomeTop';
import GamesSection from '@/components/GamesSection';
import HomeBottom from '@/components/HomeBottom';
import InstallApp from '@/components/InstallApp';
import XlBanner from '@/components/XlBanner';

// Home: zo snel mogelijk spelen. Zoeken en 'Binnenkort' staan op /games.
export default function Home() {
  return (
    <>
      <HomeTop />
      <XlBanner />
      <InstallApp variant="banner" />
      <GamesSection title="Kies een game" home />
      <HomeBottom />
    </>
  );
}
