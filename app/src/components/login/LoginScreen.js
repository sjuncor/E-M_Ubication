import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import axios from "axios"; // Importa Axios
import Background from "../Background";
import Logo from "../Logo";
import Header from "../Header";
import Button from "../Button";
import TextInput from "../TextInput";
import BackButton from "../BackButton";
import { theme } from "../../core/theme";

export default function LoginScreen({ navigation }) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  const onLoginPressed = async () => {
    try {
      const response = await axios.get(`http://192.168.0.7:3000/usuario/${user}/${password}`);
      if (response.data.length > 0) {
        const userData = response.data[0];
        if (userData.Tipo === 'Lider') {
          navigation.reset({
            index: 0,
            routes: [{ name: "Map", params: { usuario: user } }],
          });
        } else if (userData.Tipo === 'Empleado') {
          navigation.reset({
            index: 0,
            routes: [{ name: "Appsheet", params: { usuario: user } }],
          });
        } else {
          Alert.alert("Error", "Tipo de usuario no reconocido");
        }
      } else {
        Alert.alert("Error", "Usuario o contraseña incorrectos");
      }
    } catch (error) {
      console.error("Error consultando la API:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al conectarse al servidor. Por favor, intenta de nuevo."
      );
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Iniciar Sesión</Header>
      <TextInput
        label="Usuario"
        returnKeyType="next"
        value={user}
        onChangeText={(text) => setUser(text)}
        autoCapitalize="none"
      />
      <TextInput
        label="Contraseña"
        returnKeyType="done"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <View style={styles.forgotPassword}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ResetPasswordScreen")}
        >
          <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed}>
        Ingresar
      </Button>
      <View style={styles.row}>
        <Text style={{ color: "white" }}>¿No tienes una cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.replace("RegisterScreen")}>
          <Text style={styles.link}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  forgot: {
    fontSize: 13,
    color: theme.colors.text,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});