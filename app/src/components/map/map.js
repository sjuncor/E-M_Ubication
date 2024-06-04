import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  BackHandler,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { darkMapStyle, styles } from "./styles";
import io from "socket.io-client";

export default function App() {
  const [origin, setOrigin] = useState(null);
  const [usersLocations, setUsersLocations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUserLocation, setSelectedUserLocation] = useState(null);
  const mapRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Se necesita permiso para acceder a la ubicación.",
          [{ text: "OK", onPress: () => BackHandler.exitApp() }]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    socketRef.current = io("http://192.168.43.122:3000"); // Reemplaza con tu IP y puerto correctos

    socketRef.current.on("connect", () => {
      console.log("Conectado al servidor de Socket.IO");
    });

    socketRef.current.on("updateLocations", (locations) =>
      setUsersLocations(locations)
    );
  }, []);

  useEffect(() => {
    if (selectedUserLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedUserLocation.latitude,
        longitude: selectedUserLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.002,
      });
    }
  }, [selectedUserLocation]);

  const handleUserPress = (userLocation) => {
    setSelectedUserLocation(userLocation);
    setSearchText("");
  };

  const filteredLocations = usersLocations.filter((userLocation) =>
    userLocation.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!origin) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: origin.latitude, // Se usa origin.latitude en lugar de la ubicación fija de Bogotá
          longitude: origin.longitude, // Se usa origin.longitude en lugar de la ubicación fija de Bogotá
          latitudeDelta: 0.005,
          longitudeDelta: 0.002,
        }}
      >
        <Marker coordinate={origin}>
          <Callout>
            <Text>Origin</Text>
          </Callout>
        </Marker>
        {usersLocations.map((userLocation, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          >
            <Callout>
              <Text>{userLocation.name}</Text>
            </Callout>
          </Marker>
        ))}
      </MapView>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuario..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <FlatList
            style={styles.searchResults}
            data={filteredLocations}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleUserPress(item)}>
                <Text style={styles.searchResultText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}