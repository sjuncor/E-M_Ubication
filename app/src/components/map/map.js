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
  Button,
} from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { darkMapStyle, styles } from "./styles";
import io from "socket.io-client";

export default function MapScreen({ route, navigation }) {
  const { usuario } = route.params; // Obtén el usuario de los parámetros de navegación
  const [origin, setOrigin] = useState(null);
  const [usersLocations, setUsersLocations] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUserLocation, setSelectedUserLocation] = useState(null);
  const mapRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
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
      } catch (error) {
        console.error("Error obteniendo la ubicación inicial:", error);
      }
    })();
  }, []);

  useEffect(() => {
    socketRef.current = io("http://192.168.0.7:3000"); // Reemplaza con tu IP y puerto correctos

    socketRef.current.on("connect", () => {
      console.log("Conectado al servidor de Socket.IO");
    });

    socketRef.current.on("updateLocations", (locations) =>
      setUsersLocations(locations)
    );

    socketRef.current.on("disconnect", () => {
      console.log("Desconectado del servidor de Socket.IO");
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const sendLocation = () => {
      if (origin) {
        socketRef.current.emit("ubicacion", {
          id: usuario, // Usar el correo como id
          lat: origin.latitude,
          lng: origin.longitude,
        });
      }
    };

    const locationInterval = setInterval(async () => {
      try {
        let location = await Location.getCurrentPositionAsync({});
        const newOrigin = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        if (
          origin &&
          (newOrigin.latitude !== origin.latitude ||
            newOrigin.longitude !== origin.longitude)
        ) {
          setOrigin(newOrigin);
        }

        sendLocation();
      } catch (error) {
        console.error("Error obteniendo la ubicación periódica:", error);
      }
    }, 5000); // Enviar ubicación cada 5 segundos

    return () => clearInterval(locationInterval);
  }, [origin, usuario]);

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
    userLocation.id.toLowerCase().includes(searchText.toLowerCase())
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
          latitude: origin.latitude,
          longitude: origin.longitude,
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
              <Text>{userLocation.id}</Text>
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
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleUserPress(item)}>
                <Text style={styles.searchResultText}>{item.id}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <Button
        title="Ir a Inicio de Sesión"
        onPress={() => navigation.navigate("LoginScreen")}
      />
    </View>
  );
}
