import { Geolocation } from '@capacitor/geolocation';
import React, { useEffect, useRef, useState } from 'react';

async function MyCarLocation({map}) {
    // vehicleMarker는 차량 위치를 표시하는 마커 인스턴스를 저장하는 상태입니다.
    const [vehicleMarker, setVehicleMarker] = useState(null);
    // vehicleInfoWindow는 차량 위치에 표시하는 정보 창 인스턴스를 저장하는 상태입니다.
    const [vehicleInfoWindow, setVehicleInfoWindow] = useState(null);
    const [vehicleLocation, setVehicleLocation] = useState({lat: null, lng: null});

    
        try {
            const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
            const { latitude, longitude } = coordinates.coords;

            setVehicleLocation({ lat: latitude, lng: longitude });


            if (!map) return;
            const newCenter = new window.naver.maps.LatLng(latitude, longitude);
            map.setCenter(newCenter);

            // 현재 위치에 마커 추가
            const newMarker = new window.naver.maps.Marker({
                position: newCenter,
                map: map,
            });

            setVehicleMarker(newMarker);

            // 마커 위에 '내차' 문자열을 표시하는 InfoWindow 추가
            const infoWindow = new window.naver.maps.InfoWindow({
                content: '<div style="width:50px; text-align:center; color:black; border:none; background-color:yellow;">내차</div>',
                position: newCenter,
                pixelOffset: new window.naver.maps.Point(0, -15),
            });

            infoWindow.open(map, newMarker);

            setVehicleInfoWindow(infoWindow);

            // 차량위치 선택 버튼이 눌러진 것으로 상태를 업데이트합니다.
            //setLocationSelected(true);

            // 차량위치 선택 버튼을 비활성화합니다.
            //setVehicleLocationSelected(true);
        } catch (error) {
            console.error(error);
        }
    
}

export default MyCarLocation;