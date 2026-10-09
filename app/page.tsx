import HomeTop from '@/components/HomeTop';
import GamesSection from '@/components/GamesSection';
import HomeBottom from '@/components/HomeBottom';
import InstallApp from '@/components/InstallApp';

// Home: zo snel mogelijk spelen. Zoeken en 'Binnenkort' staan op /games.
export default function Home() {
  return (
    <>
      <HomeTop />
      <InstallApp variant="banner" />
      <GamesSection title="Kies een game" home />
      <HomeBottom />
    </>
  );
}
