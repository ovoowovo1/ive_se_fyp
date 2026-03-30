import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import axios from 'shared/api/http';
import { Typography } from 'antd';
import { GOOGLE_MAPS_API_KEY, buildAssetUrl } from 'shared/config/env';

const { Text: _Text, Title } = Typography;

export default function MapShowDonation() {
    const [markerFPosition, setMarkerFPosition] = useState([]);
    const [isAPILoaded, setIsAPILoaded] = useState(false);

    const mapContainerStyle = { width: '100%', height: '500px' };
    const center = { lat: 22.3193, lng: 114.1694 };
    const zoom = 10;

    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            return;
        }

        axios.get('/getMapDonationItemDataAndlatlon', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).then(response => {
                console.log(response.data);
                setMarkerFPosition(response.data);
            })
            .catch(error => {
                console.log("Error in getting data from backend");
                console.log(error);
            });
    }, []);

    // Custom marker icon configuration
    const customMarkerIcon = (photo) => ({
        url: buildAssetUrl(photo),
        scaledSize: new window.google.maps.Size(40, 40),
    });

    return (
        <>
            <Title level={3}><b>Donate Item Data (Map)</b></Title>
            {!GOOGLE_MAPS_API_KEY ? (
                <div>Google Maps is not configured.</div>
            ) : (
                <LoadScript
                    googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                    onLoad={() => setIsAPILoaded(true)}
                >
                    {isAPILoaded && (
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
                    )}
                </LoadScript>
            )}
        </>
    );
}
