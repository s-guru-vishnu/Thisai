import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '500px'
};

const DriverMap = ({ driverLocation, stops, onMapLoad }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const mapRef = useRef(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [showTraffic, setShowTraffic] = useState(false);
    const [mapType, setMapType] = useState("roadmap");
    
    // Track the active zoom and center of the user so it doesn't snap back when the backend polls
    const [mapZoom, setMapZoom] = useState(12);
    const [mapCenter, setMapCenter] = useState({ lat: 13.0827, lng: 80.2707 });
    const [isCenterInitialized, setIsCenterInitialized] = useState(false);
    
    const driverMarkerIcon = useMemo(() => ({
        path: "M 0,0 m -5,-5 L 5,-5 L 5,5 L -5,5 Z",
        fillColor: "#ff6600",
        fillOpacity: 1,
        strokeColor: "#000",
        strokeWeight: 2,
        scale: 2
    }), []);

    const directionsOptions = useMemo(() => ({
        directions: directionsResponse,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: { strokeColor: '#ffbb00', strokeWeight: 5 }
    }), [directionsResponse]);

    const mapOptions = useMemo(() => ({
        styles: (mapType === "roadmap" && !showTraffic) ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }
        ] : [],
        disableDefaultUI: true, // Hides the duplicate native Map/Satellite buttons
        zoomControl: true,      // Keeps only the native +/- zoom buttons
    }), [mapType, showTraffic]);

    // Center gracefully only once
    useEffect(() => {
        if (driverLocation && !isCenterInitialized) {
            setMapCenter(driverLocation);
            setIsCenterInitialized(true);
        }
    }, [driverLocation, isCenterInitialized]);

    // Force map to recalculate route whenever stops or driver coordinates really change
    const stopsStr = JSON.stringify(stops);
    const driverLocStr = JSON.stringify(driverLocation);
    useEffect(() => {
        setDirectionsResponse(null);
    }, [stopsStr, driverLocStr]);

    const onLoad = useCallback(function callback(mapInstance) {
        mapRef.current = mapInstance;
        if (onMapLoad) onMapLoad(mapInstance);
    }, [onMapLoad]);

    const onUnmount = useCallback(function callback() {
        mapRef.current = null;
    }, []);

    // Safely update React with the user's latest zoom strictly only if distinct, blocking infinite render loops
    const handleZoomChanged = useCallback(() => {
        if (mapRef.current) {
            const newZoom = mapRef.current.getZoom();
            setMapZoom((prevZoom) => prevZoom === newZoom ? prevZoom : newZoom);
        }
    }, []);

    // Safely update React with camera position preventing hard snapping
    const handleDragEnd = useCallback(() => {
        if (mapRef.current) {
            const center = mapRef.current.getCenter();
            if (center) {
                const lat = center.lat();
                const lng = center.lng();
                setMapCenter((prevCenter) => (prevCenter.lat === lat && prevCenter.lng === lng) ? prevCenter : { lat, lng });
            }
        }
    }, []);

    const directionsCallback = useCallback((response) => {
        if (response !== null && response.status === 'OK') {
            setDirectionsResponse(response);
        }
    }, []);

    if (loadError) return <div style={{ minHeight: '500px' }}>Error loading Google Maps</div>;
    if (!isLoaded) return <div style={{ minHeight: '500px' }}>Initializing Cyber Road Map...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                mapTypeId={mapType}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                onZoomChanged={handleZoomChanged}
                onDragEnd={handleDragEnd}
            >
                {/* Traffic Layer */}
                {showTraffic && <TrafficLayer />}

                {/* Directions Route */}
                {stops && stops.length > 0 && driverLocation && directionsResponse === null && (
                    <DirectionsService
                        options={{
                            origin: driverLocation,
                            destination: stops[stops.length - 1].location,
                            waypoints: stops.slice(0, -1).map(stop => ({ location: stop.location, stopover: true })),
                            travelMode: 'DRIVING'
                        }}
                        callback={directionsCallback}
                    />
                )}

                {stops && stops.length > 0 && directionsResponse && (
                    <DirectionsRenderer options={directionsOptions} />
                )}

                {/* Driver Marker */}
                {driverLocation && (
                    <Marker
                        position={driverLocation}
                        icon={driverMarkerIcon}
                        title="Driver Current Location"
                    />
                )}

                {/* Stop Markers */}
                {stops && stops.map((stop, idx) => (
                    <Marker
                        key={stop.id || idx}
                        position={stop.location}
                        icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        title={stop.productName || 'Delivery Stop'}
                        onClick={() => mapRef.current && mapRef.current.panTo(stop.location)}
                    />
                ))}
            </GoogleMap>

            {/* Control Toolbar */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.75)',
                zIndex: 10,
                flexWrap: 'wrap'
            }}>
                <button 
                    onClick={() => setMapType('roadmap')}
                    style={{
                        padding: '6px 12px',
                        background: mapType === 'roadmap' ? 'var(--accent)' : 'transparent',
                        color: mapType === 'roadmap' ? '#000' : '#fff',
                        border: '1px solid',
                        borderColor: mapType === 'roadmap' ? 'var(--accent)' : '#555',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                    }}
                >
                    Map
                </button>
                <button 
                    onClick={() => setMapType('satellite')}
                    style={{
                        padding: '6px 12px',
                        background: mapType === 'satellite' ? 'var(--accent)' : 'transparent',
                        color: mapType === 'satellite' ? '#000' : '#fff',
                        border: '1px solid',
                        borderColor: mapType === 'satellite' ? 'var(--accent)' : '#555',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                    }}
                >
                    Satellite
                </button>
                <button 
                    onClick={() => setShowTraffic(!showTraffic)}
                    style={{
                        padding: '6px 12px',
                        background: showTraffic ? 'var(--accent)' : 'transparent',
                        color: showTraffic ? '#000' : '#fff',
                        border: '1px solid',
                        borderColor: showTraffic ? 'var(--accent)' : '#555',
                        borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                    }}
                >
                    Traffic
                </button>
                <button 
                    onClick={() => {
                        if (mapRef.current && driverLocation) {
                            mapRef.current.panTo(driverLocation);
                            setMapCenter(driverLocation);
                        }
                    }}
                    style={{
                        padding: '6px 12px',
                        background: 'transparent', color: '#fff',
                        border: '1px solid #555', borderRadius: '6px',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem'
                    }}
                >
                    Center Driver
                </button>
            </div>
        </div>
    );
};

export default React.memo(DriverMap);
