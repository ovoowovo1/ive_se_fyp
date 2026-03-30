import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import axios from 'shared/api/http';

export default function Test() {
    const [markerFPosition, setMarkerFPosition] = useState([]);

    const mapContainerStyle = { width: '100%', height: '500px' };
    const center = { lat: 22.3193, lng: 114.1694 };
    const zoom = 10;

    const _markerPosition = { lat: 22.3193, lng: 114.1694 };

    useEffect(() => {
        axios.get('http://localhost:8081/getMapDonationItemDataAndlatlon')
            .then(response => {
                // Extract the marker positions from the response data
                console.log(response.data);
                setMarkerFPosition(response.data);
            })
            .catch(error => {
                console.log("Error in getting data from backend");
                console.log(error);
            });
    }, []);

    // 自定義標記圖標的配置
    const customMarkerIcon = (photo) => ({
        url: `http://localhost:8081/${photo.replace(/\\/g, '/')}`,
        scaledSize: new window.google.maps.Size(40, 40), // Adjust the icon size
    });

    return (
        <LoadScript googleMapsApiKey="AIzaSyAIRZSTD9hk7JVdGi7ff6dY_lLG2bzdPdo">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={zoom}
            >
                {markerFPosition.map((marker, index) => (
                    <MarkerF
                        key={index}
                        position={{ lat: marker.lat, lng: marker.lon }}
                        title={marker.name}
                        icon={customMarkerIcon(marker.photo)}
                        onClick={() => alert(`Marker clicked! Name: ${marker.name}, Location: ${marker.location}, Date: ${marker.date}`)}
                    />
                ))}
            </GoogleMap>
        </LoadScript>
    );
}
