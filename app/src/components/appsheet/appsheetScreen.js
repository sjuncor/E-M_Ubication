import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button } from "react-native";

const WebViewComponent = ({navigation}) => {
  const [loading, setLoading] = useState(true);

  // ESTE TROZO DE CODIGO TIENE LA FUNCION DE OCULTAR LA BARRA DE ESTADO

  // useEffect(() => {
  //   // Ocultar la barra de estado
  //   StatusBar.setHidden(true);
    
  //   return () => {
  //     // Mostrar la barra de estado cuando el componente se desmonte
  //     StatusBar.setHidden(false);
  //   };
  // }, []);

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator
          color="#009688"
          size="large"
          style={styles.activityIndicator}
        />
      )}
      <WebView 
        source={{ uri: 'https://www.appsheet.com/start/a04f8d2c-fde9-4fea-bad1-ec21c6b27e2d#appName=ClPapelesNacionales-791783773&page=gallery&sort=%5B%7B%22Column%22%3A%22Orden%22%2C%22Order%22%3A%22Ascending%22%7D%5D&table=Filtro+Menu&view=Men%C3%BA+Inicial' }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      <Button
        title="Ir a Inicio de Sesión"
        onPress={() => navigation.navigate("LoginScreen")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WebViewComponent;