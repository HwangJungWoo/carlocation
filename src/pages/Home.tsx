import './Home.css';
import Maps from '../components/naver/maps/Maps'
import { Geolocation } from '@capacitor/geolocation';
import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import AdBanner from '../components/Admop/Adbanner';


const Home: React.FC = () => {

  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    async function getCurrentPosition() {
      const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      setLat(coordinates.coords.latitude);
      setLng(coordinates.coords.longitude);
    }
    getCurrentPosition();
  }, []);

  useEffect(() => {
    const checkBackButton = App.addListener('backButton', (e) => {
      if (window.confirm("앱을 종료하시겠습니까?")) {
        App.exitApp();
      }
    });

    return () => {
      checkBackButton.remove();
    };
  }, []);

  return (
    <>
      <AdBanner />
      {lat !== null && lng !== null && <Maps lat={lat} lng={lng} />}
    </>
  );
};

export default Home;
