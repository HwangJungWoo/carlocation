import React, { useEffect } from 'react';
import { AdMob, BannerAdOptions, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob'

const AdBanner = () => {
    useEffect(() => {
        async function initializeAd() {
            await init();
            await showAd();
        }
        initializeAd();
    }, []);

    const init = async () => {
        const { status } = await AdMob.trackingAuthorizationStatus();

        if (status === 'notDetermined') {
            console.log('Display information before ads load first time');
        }

        AdMob.initialize( {
            requestTrackingAuthorization: true,
            testingDevices: ['YOURTESTDEVICECODE'],
            initializeForTesting: true,
        })
    }

    async function showAd() {
        const options: BannerAdOptions = {
            adId: 'ca-app-pub-8579081967222175~3824487258',
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.TOP_CENTER,
            margin: 0,
            isTesting: false,
        }

        await AdMob.showBanner(options);
    };

    return null;
};

export default AdBanner;
