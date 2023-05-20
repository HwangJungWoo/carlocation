
import React, { useEffect, useRef, useState } from 'react';
import './Maps.css';
import { Geolocation } from '@capacitor/geolocation';


export default function Maps(props) {
    const lat = Number(props.lat);
    const lng = Number(props.lng);
    const mapRef = useRef(null);

    // map은 지도 인스턴스를 저장하는 상태입니다.
    const [map, setMap] = useState(null);
    // watchId는 위치 추적을 중지하기 위해 필요한 ID를 저장하는 상태입니다.
    const [watchId, setWatchId] = useState(null);
    // marker는 현재 위치를 표시하는 마커 인스턴스를 저장하는 상태입니다.
    const [marker, setMarker] = useState(null);
    // 현재 위치를 추적하는 상태를 추가합니다.
    const [tracking, setTracking] = useState(false);

    const [vehicleMarker, setVehicleMarker] = useState(null);

    // 위치 보정 상태를 추가합니다.
    const [correctingLocation, setCorrectingLocation] = useState(false);

    /**
    * ----------------------------------------------------------------
    * 맵 초기화
    * ----------------------------------------------------------------
    */
    useEffect(() => {
        if (!window.naver) return;

        const naverMap = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(lat, lng),
            zoom: 18
        });

        setMap(naverMap);
    }, []);

    /**
     * ----------------------------------------------------------------
     * 로컬 스토리지에 좌표값이 있는지 검사 
     * ----------------------------------------------------------------
     */
    useEffect(() => {
        const fetchVehicleLocation = async () => {
            const storedVehicleLocation = localStorage.getItem('vehicleLocation');

            if (storedVehicleLocation) {
                const { lat_s, lng_s } = JSON.parse(storedVehicleLocation);
                drawMarker(lat_s, lng_s);
            }
        };

        if (map) {
            fetchVehicleLocation();
        }
    }, [map]);

    // 마커 그리기
    function drawMarker(lat_s, lng_s) {
        if (!map) {
            console.error('map is not initialized');  // map이 제대로 초기화되었는지 확인
            return;
        }
        const newCenter = new window.naver.maps.LatLng(lat_s, lng_s);
        map.setCenter(newCenter);

        // If there is a vehicleMarker, remove it from the map
        if (vehicleMarker) {
            vehicleMarker.setMap(null);
        }

        // 현재 위치에 마커 추가
        const newMarker = new window.naver.maps.Marker({
            position: newCenter,
            map: map,
        });

        // Update the vehicleMarker state
        setVehicleMarker(newMarker);

        // 마커 위에 '내차' 문자열을 표시하는 InfoWindow 추가
        const infoWindow = new window.naver.maps.InfoWindow({
            content: '<div style="width:50px; text-align:center; color:black; border:none; background-color:yellow;">내차</div>',
            position: newCenter,
            pixelOffset: new window.naver.maps.Point(0, -15),
        });

        infoWindow.open(map, newMarker);
    }

    /**
     * ----------------------------------------------------------------
     * 내차 위치
     * ----------------------------------------------------------------
     */
    const handleCurrentLocationClick = async () => {
        try {
            if (!map) return;

            // Start the process of 'correcting location'
            setCorrectingLocation(true);

            // Using watchPosition to track vehicle's location in real-time
            const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position) => {

                // If position or coordinates are not available, do nothing
                if (!position || !position.coords) return;

                const { latitude, longitude } = position.coords;

                // Delay of 5 seconds
                setTimeout(() => {
                    const newCenter = new window.naver.maps.LatLng(latitude, longitude);
                    map.setCenter(newCenter);

                    // If there is a vehicleMarker, update its position
                    if (vehicleMarker) {
                        vehicleMarker.setPosition(newCenter);
                    } else {
                        // Otherwise, create a new marker
                        const newMarker = new window.naver.maps.Marker({
                            position: newCenter,
                            map: map,
                        });

                        // Update the vehicleMarker state
                        setVehicleMarker(newMarker);
                    }

                    // 마커 위에 '내차' 문자열을 표시하는 InfoWindow 추가
                    const infoWindow = new window.naver.maps.InfoWindow({
                        content: '<div style="width:50px; text-align:center; color:black; border:none; background-color:yellow;">내차</div>',
                        position: newCenter,
                        pixelOffset: new window.naver.maps.Point(0, -15),
                    });

                    infoWindow.open(map, vehicleMarker);

                    // 로컬 스토리지에 차량 위치 저장
                    const vehicleLocation = { lat_s: latitude, lng_s: longitude };
                    localStorage.setItem('vehicleLocation', JSON.stringify(vehicleLocation));

                    // End the process of 'correcting location'
                    setCorrectingLocation(false);

                    // Stop tracking
                    Geolocation.clearWatch({ id: id });
                }, 5000);
            });
        } catch (error) {
            console.error(error);
        }
    };


    /**
    * ----------------------------------------------------------------
    * 내 현재 위치
    * ----------------------------------------------------------------
    */
    // map이나 marker 상태가 변경될 때마다 실행됩니다.
    useEffect(() => {

        // map이 초기화되지 않았거나 위치 추적이 활성화되지 않았으면 아무것도 하지 않습니다.
        if (!map || !tracking) return;

        // 사용자의 위치를 실시간으로 추적하고, 그 위치로 지도의 중심을 이동하며 마커를 업데이트합니다.
        const id = Geolocation.watchPosition({ enableHighAccuracy: true }, (position) => {

            // position 객체가 없거나 coords 속성이 없는 경우 함수를 종료합니다.
            if (!position || !position.coords) return;

            const { latitude, longitude } = position.coords;

            const newCenter = new window.naver.maps.LatLng(latitude, longitude);
            map.setCenter(newCenter);


            // 이미 마커가 있으면 위치만 업데이트합니다.
            if (marker) {
                marker.setPosition(newCenter);
            } else {
                // 처음에는 새 마커를 만듭니다.
                const newMarker = new window.naver.maps.Marker({
                    position: newCenter,
                    map: map,
                    icon: {
                        url: '/assets/boy.png',  // public 폴더를 root로 간주
                        scaledSize: new window.naver.maps.Size(50, 50),
                    }

                });

                setMarker(newMarker);
            }
        });


        // 위치 추적 ID를 저장합니다.
        setWatchId(id);

        // 컴포넌트가 언마운트되거나 종속성이 변경될 때 위치 추적을 중지합니다.
        return () => {
            if (watchId) {
                Geolocation.clearWatch({ id: watchId });
            }
        };
    }, [map, marker, tracking]);

    // "현재 위치 보기" 버튼의 핸들러를 수정합니다.
    const handleMyLocationClick = () => {
        setTracking(!tracking);  // 위치 추적 상태를 토글합니다.
    };


    return (
        <div className='container'>
            <div ref={mapRef} className='map' />
            <button onClick={handleCurrentLocationClick} className='current-location-button'>
                차량위치 선택
            </button>
            <button onClick={handleMyLocationClick} className='my-location'> 현재 내 위치 </button>
            {/* 위치 보정중 메시지를 추가합니다. */}
            {correctingLocation &&
                <div className='correcting-location-overlay'>
                    <div className='correcting-location-message'>위치보정중...</div>
                </div>
            }
        </div>
    );
}