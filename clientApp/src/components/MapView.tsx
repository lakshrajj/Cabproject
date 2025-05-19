import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { COLORS } from '../utils/theme';

interface MapViewComponentProps {
  initialRegion?: Region;
  showUserLocation?: boolean;
  startLocation?: [number, number]; // [longitude, latitude]
  endLocation?: [number, number]; // [longitude, latitude]
  pickupLocation?: [number, number]; // [longitude, latitude]
  dropLocation?: [number, number]; // [longitude, latitude]
  driverLocation?: [number, number]; // [longitude, latitude]
  onRegionChange?: (region: Region) => void;
  onMapPress?: (event: any) => void;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  initialRegion,
  showUserLocation = false,
  startLocation,
  endLocation,
  pickupLocation,
  dropLocation,
  driverLocation,
  onRegionChange,
  onMapPress,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(
    initialRegion || {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  // Load user's location and set as initial region if requested
  useEffect(() => {
    if (showUserLocation && !initialRegion) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      })();
    }
  }, [showUserLocation, initialRegion]);

  // Fit markers on map if locations change
  useEffect(() => {
    if (mapRef.current && (startLocation || endLocation || pickupLocation || dropLocation || driverLocation)) {
      const coordinates = [];
      
      if (startLocation) {
        coordinates.push({
          latitude: startLocation[1],
          longitude: startLocation[0],
        });
      }
      
      if (endLocation) {
        coordinates.push({
          latitude: endLocation[1],
          longitude: endLocation[0],
        });
      }
      
      if (pickupLocation) {
        coordinates.push({
          latitude: pickupLocation[1],
          longitude: pickupLocation[0],
        });
      }
      
      if (dropLocation) {
        coordinates.push({
          latitude: dropLocation[1],
          longitude: dropLocation[0],
        });
      }
      
      if (driverLocation) {
        coordinates.push({
          latitude: driverLocation[1],
          longitude: driverLocation[0],
        });
      }
      
      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [startLocation, endLocation, pickupLocation, dropLocation, driverLocation]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    onRegionChange && onRegionChange(newRegion);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        onRegionChangeComplete={handleRegionChange}
        onPress={onMapPress}
      >
        {startLocation && (
          <Marker
            coordinate={{
              latitude: startLocation[1],
              longitude: startLocation[0],
            }}
            title="Start Location"
            pinColor={COLORS.primary}
          />
        )}

        {endLocation && (
          <Marker
            coordinate={{
              latitude: endLocation[1],
              longitude: endLocation[0],
            }}
            title="End Location"
            pinColor={COLORS.success}
          />
        )}

        {pickupLocation && (
          <Marker
            coordinate={{
              latitude: pickupLocation[1],
              longitude: pickupLocation[0],
            }}
            title="Pickup Location"
            pinColor={COLORS.warning}
          />
        )}

        {dropLocation && (
          <Marker
            coordinate={{
              latitude: dropLocation[1],
              longitude: dropLocation[0],
            }}
            title="Drop Location"
            pinColor={COLORS.info}
          />
        )}

        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation[1],
              longitude: driverLocation[0],
            }}
            title="Driver Location"
            pinColor={COLORS.accent}
          />
        )}

        {/* Draw route line if we have both start and end locations */}
        {startLocation && endLocation && (
          <Polyline
            coordinates={[
              {
                latitude: startLocation[1],
                longitude: startLocation[0],
              },
              {
                latitude: endLocation[1],
                longitude: endLocation[0],
              },
            ]}
            strokeColor={COLORS.primary}
            strokeWidth={3}
          />
        )}

        {/* Draw route line for pickup and drop if both exist */}
        {pickupLocation && dropLocation && (
          <Polyline
            coordinates={[
              {
                latitude: pickupLocation[1],
                longitude: pickupLocation[0],
              },
              {
                latitude: dropLocation[1],
                longitude: dropLocation[0],
              },
            ]}
            strokeColor={COLORS.info}
            strokeWidth={3}
          />
        )}

        {/* Draw route line from driver to pickup if both exist */}
        {driverLocation && pickupLocation && (
          <Polyline
            coordinates={[
              {
                latitude: driverLocation[1],
                longitude: driverLocation[0],
              },
              {
                latitude: pickupLocation[1],
                longitude: pickupLocation[0],
              },
            ]}
            strokeColor={COLORS.accent}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: '100%',
  },
});

export default MapViewComponent;