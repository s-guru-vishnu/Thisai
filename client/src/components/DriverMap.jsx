import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsService, DirectionsRenderer, TrafficLayer, Circle, InfoWindow, OverlayView } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
    minHeight: '500px'
};

// Safe InfoWindow offset helper - returns literal object which Maps API accepts
const getOffset = (w, h) => {
    return { width: w, height: h };
};

const DriverMap = ({ driverLocation, warehouseLocation, stops, onMapLoad, driverName, warehouseName }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const mapRef = useRef(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [pickupDirections, setPickupDirections] = useState(null);
    const [deliveryDirections, setDeliveryDirections] = useState(null);
    const [showTraffic, setShowTraffic] = useState(true);
    const [mapType, setMapType] = useState("roadmap");
    
    // Zoom/Center stabilization
    const [mapZoom, setMapZoom] = useState(12);
    const [mapCenter, setMapCenter] = useState({ lat: 12.9341, lng: 79.1367 });
    const [isCenterInitialized, setIsCenterInitialized] = useState(false);
    
    const driverMarkerIcon = useMemo(() => ({
        path: "M 0,0 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0", 
        fillColor: "#ff4400",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 1.5
    }), []);

    const warehouseMarkerIcon = useMemo(() => ({
        path: "M 0,0 m -12,0 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0",
        fillColor: "#0066ff",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 2
    }), []);

    const pickupOptions = useMemo(() => ({
        directions: pickupDirections,
        suppressMarkers: true,
        suppressInfoWindows: true,
        preserveViewport: true,
        polylineOptions: { 
            strokeColor: '#ff6600', 
            strokeWeight: 6,
            strokeOpacity: 0.8
        }
    }), [pickupDirections]);

    const deliveryOptions = useMemo(() => ({
        directions: deliveryDirections,
        suppressMarkers: true,
        suppressInfoWindows: true,
        preserveViewport: true,
        polylineOptions: { 
            strokeColor: '#00ffff', 
            strokeWeight: 5,
            strokeOpacity: 0.9,
            lineDashArray: [10, 5] 
        }
    }), [deliveryDirections]);

    const mapOptions = useMemo(() => ({
        styles: (mapType === "roadmap" && !showTraffic) ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#38414e" }, { visibility: "on" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#38414e" }, { visibility: "on" }] },
            { featureType: "road.local", elementType: "all", stylers: [{ visibility: "off" }] }, // Hide narrow local roads (< 5m preference)
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
            { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] }
        ] : [],
        disableDefaultUI: true, 
        zoomControl: true,      
    }), [mapType, showTraffic]);

    // Initialize center once
    useEffect(() => {
        if (driverLocation && !isCenterInitialized) {
            setMapCenter(driverLocation);
            setIsCenterInitialized(true);
        }
    }, [driverLocation, isCenterInitialized]);

    // Force route recalculation
    const stopsStr = JSON.stringify(stops);
    const driverLocStr = JSON.stringify(driverLocation);
    const warehouseLocStr = JSON.stringify(warehouseLocation);
    useEffect(() => {
        setPickupDirections(null);
        setDeliveryDirections(null);
    }, [stopsStr, driverLocStr, warehouseLocStr]);

    const onLoad = useCallback((mapInstance) => {
        mapRef.current = mapInstance;
        if (onMapLoad) onMapLoad(mapInstance);
    }, [onMapLoad]);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    const handleZoomChanged = useCallback(() => {
        if (mapRef.current) {
            const newZoom = mapRef.current.getZoom();
            setMapZoom((prevZoom) => prevZoom === newZoom ? prevZoom : newZoom);
        }
    }, []);

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

    const pickupCallback = useCallback((response) => {
        if (response !== null && response.status === 'OK') {
            setPickupDirections(response);
        }
    }, []);

    const deliveryCallback = useCallback((response) => {
        if (response !== null && response.status === 'OK') {
            setDeliveryDirections(response);
        }
    }, []);

    if (loadError) return <div style={{ minHeight: '500px' }}>Error loading Google Maps</div>;
    if (!isLoaded) return <div style={{ minHeight: '500px' }}>Initializing Intelligent Route Map...</div>;

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
                {showTraffic && <TrafficLayer />}

                {/* Pickup Leg: Driver -> Warehouse (Orange) */}
                {driverLocation && warehouseLocation && pickupDirections === null && (
                    <DirectionsService
                        options={{
                            origin: driverLocation,
                            destination: warehouseLocation,
                            travelMode: 'DRIVING'
                        }}
                        callback={pickupCallback}
                    />
                )}
                {pickupDirections && (
                    <DirectionsRenderer 
                        options={pickupOptions} 
                        suppressMarkers={true} 
                        suppressInfoWindows={true} 
                    />
                )}

                {/* Delivery Leg: Warehouse -> Stops (Cyan) */}
                {warehouseLocation && stops && stops.length > 0 && deliveryDirections === null && (
                    <DirectionsService
                        options={{
                            origin: warehouseLocation,
                            destination: stops[stops.length - 1].location,
                            waypoints: stops.slice(0, -1).map(stop => ({ location: stop.location, stopover: true })),
                            travelMode: 'DRIVING',
                            drivingOptions: {
                                departureTime: new Date(),
                                trafficModel: 'best_guess'
                            },
                            optimizeWaypoints: true
                        }}
                        callback={deliveryCallback}
                    />
                )}
                {deliveryDirections && (
                    <DirectionsRenderer 
                        options={deliveryOptions} 
                        suppressMarkers={true} 
                        suppressInfoWindows={true} 
                    />
                )}

                {/* Warehouse Marker & High-Visibility Pulse */}
                {warehouseLocation && warehouseLocation.lat && (
                    <React.Fragment>
                        <Circle
                            center={warehouseLocation}
                            radius={400}
                            options={{
                                fillColor: "#0066ff",
                                fillOpacity: 0.15,
                                strokeColor: "#0066ff",
                                strokeOpacity: 0.5,
                                strokeWeight: 2
                            }}
                        />
                        <Marker
                            position={warehouseLocation}
                            icon={warehouseMarkerIcon}
                            title="Warehouse Hub"
                            zIndex={9999}
                            label={{ text: "WH", color: "#fff", fontWeight: "bold" }}
                        />
                        <OverlayView
                            position={warehouseLocation}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div style={{ 
                                transform: 'translate(-50%, -65px)',
                                background: '#0066ff', color: '#fff', 
                                padding: '5px 12px', borderRadius: '5px', 
                                fontWeight: 'bold', whiteSpace: 'nowrap',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                pointerEvents: 'none',
                                fontSize: '11px',
                                border: '2px solid #fff'
                            }}>
                                HUB: {warehouseName?.toUpperCase() || 'LOGISTICS HUB'}
                            </div>
                        </OverlayView>
                    </React.Fragment>
                )}

                {/* Driver Marker & Pulse */}
                {driverLocation && driverLocation.lat && (
                    <React.Fragment>
                        <Circle
                            center={driverLocation}
                            radius={200}
                            options={{
                                fillColor: "#ff4400",
                                fillOpacity: 0.1,
                                strokeColor: "#ff4400",
                                strokeOpacity: 0.4,
                                strokeWeight: 1
                            }}
                        />
                        <Marker
                            position={driverLocation}
                            icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                            title="Driver Current Location"
                            zIndex={2000}
                        />
                        <OverlayView
                            position={driverLocation}
                            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                        >
                            <div style={{ 
                                transform: 'translate(-50%, -60px)',
                                background: '#333', color: '#fff', 
                                padding: '4px 10px', borderRadius: '4px', 
                                fontWeight: 'bold', fontSize: '10px',
                                whiteSpace: 'nowrap',
                                border: '2px solid #ff4400',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                pointerEvents: 'none'
                            }}>
                                DRIVER: {driverName?.toUpperCase() || 'YOU'}
                            </div>
                        </OverlayView>
                    </React.Fragment>
                )}

                {/* Delivery Stops */}
                {stops && stops.map((stop, idx) => (
                    stop.location && stop.location.lat && (
                        <React.Fragment key={stop.id || idx}>
                            <Marker
                                position={stop.location}
                                icon="https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                title={stop.productName || 'Stop'}
                            />
                            <OverlayView
                                position={stop.location}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                            >
                                <div style={{ 
                                    transform: 'translate(-50%, -70px)',
                                    background: '#00cc66', color: '#fff', 
                                    padding: '5px 12px', borderRadius: '5px', 
                                    fontWeight: 'bold', fontSize: '10px', 
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                    pointerEvents: 'none',
                                    border: '1px solid #fff'
                                }}>
                                    STOP: {stop.productName || 'PARCEL'} ({stop.trackingCode || 'N/A'})
                                </div>
                            </OverlayView>
                        </React.Fragment>
                    )
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
                            setMapZoom(15);
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
