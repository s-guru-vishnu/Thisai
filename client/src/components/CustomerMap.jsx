import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    borderRadius: '12px'
};

const mapOptions = {
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }
    ],
    disableDefaultUI: false,
    zoomControl: true,
};

const CustomerMap = ({ deliveryDetails }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [driverLocation, setDriverLocation] = useState({ lat: 13.0827, lng: 80.2707 });

    const customerLocation = deliveryDetails?.location || { lat: 13.0067, lng: 80.2206 }; // Default to Guindy if missing

    useEffect(() => {
        if (!deliveryDetails || deliveryDetails.status === 'Delivered') return;

        const driverId = deliveryDetails.driverId || 'CURRENT_DRIVER_ID';

        const fetchLiveLocation = async () => {
            try {
                // Step 8: Fetch driver location from backend for Live Tracking
                const locRes = await axios.get(`http://localhost:5000/api/driver/location/${driverId}`);
                if (locRes.data && locRes.data.location) {
                    setDriverLocation(locRes.data.location);
                }
            } catch (err) {
                // Mock movement if API fails
                setDriverLocation(prev => ({
                    lat: prev.lat - 0.0005,
                    lng: prev.lng - 0.0005
                }));
            }
        };

        fetchLiveLocation();
        const interval = setInterval(fetchLiveLocation, 10000);
        return () => clearInterval(interval);
    }, [deliveryDetails]);

    const onLoad = useCallback(function callback(mapInstance) {
        setMap(mapInstance);
    }, []);

    const onUnmount = useCallback(function callback(mapInstance) {
        setMap(null);
    }, []);

    const directionsCallback = (response) => {
        if (response !== null && response.status === 'OK') {
            setDirectionsResponse(response);
        }
    };

    if (loadError) return <div style={{ color: 'red' }}>Error loading tracking map</div>;
    if (!isLoaded) return <div>Initializing Live Tracking...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={driverLocation}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {/* Route Rendering between Driver and Customer */}
                {!directionsResponse && deliveryDetails.status !== 'Delivered' && (
                    <DirectionsService
                        options={{
                            origin: driverLocation,
                            destination: customerLocation,
                            travelMode: 'DRIVING'
                        }}
                        callback={directionsCallback}
                    />
                )}

                {directionsResponse && deliveryDetails.status !== 'Delivered' && (
                    <DirectionsRenderer
                        options={{
                            directions: directionsResponse,
                            suppressMarkers: true,
                            polylineOptions: { strokeColor: '#00cc66', strokeWeight: 5 }
                        }}
                    />
                )}

                {/* Driver Marker */}
                {deliveryDetails.status !== 'Delivered' && (
                    <Marker
                        position={driverLocation}
                        icon={{
                            path: "M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z",
                            fillColor: "#ffbb00",
                            fillOpacity: 1,
                            strokeColor: "#000",
                            strokeWeight: 2,
                            scale: 2
                        }}
                        title="Driver is here"
                    />
                )}

                {/* Customer Location Marker */}
                <Marker
                    position={customerLocation}
                    icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                    title="Your Location"
                />
            </GoogleMap>
        </div>
    );
};

export default CustomerMap;
