import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';

import api from '../../services/api';

interface Item {
  id: number;
  title: string;
  image_url: string;
}


interface Point {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
}


const Points = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

  const navigation = useNavigation();

  useEffect(() => {
    async function loadPosition(){
      // pedind permissão para o usuário para exibir a localização dele.
      const { status } = await Location.requestPermissionsAsync();

      if(status !== 'granted'){
        Alert.alert('Ooooops...', 'Precisamos de sua permissão ara obter a localização');
        return;
      }

      // traz a posição do usuário.
      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;

      setInitialPosition([
        latitude,
        longitude
      ])
    }

    loadPosition();
  },[])

  useEffect(() => {
    api.get('items').then(response => setItems(response.data));

  },[]);

  useEffect(() => {
    api.get('points', {
      params: {
        city: 'Bebedouro',
        uf: 'SP',
        items: [1, 2, 6]
      }
    }).then(response => {
      setPoints(response.data);     
    });
  },[]);

  
  function handleNavigateBack(){
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number){
    navigation.navigate('Detail', { point_id: id});
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);

      setSelectedItems(filteredItems);
    }else{

      setSelectedItems([...selectedItems, id]);
    }
  }


  return (
    <SafeAreaView style={{flex: 1}}>
    <View style={styles.container}>
      <TouchableOpacity onPress={handleNavigateBack}>
        <Icon name="arrow-left" size={20} color="#34CD79" />
      </TouchableOpacity>

      <Text style={styles.title}>Bem vindo.</Text>
      <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

      <View style={styles.mapContainer}>
        {initialPosition[0] !== 0 && (
          <MapView 
            style={styles.map} 
            initialRegion={{
              latitude: initialPosition[0],
              longitude: initialPosition[1],
              latitudeDelta: 0.014,
              longitudeDelta: 0.014,
            }}
          >
            {
              points.map(point => (
                <Marker 
                  key={String(point.id)}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{ 
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }} 
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image source={{ uri: point.image }} style={styles.mapMarkerImage} />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
              </Marker>
              ))}
          </MapView>
        )}
      </View>

    </View>

    <View style={styles.itemsContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {
          items.map(item => (
            <TouchableOpacity 
              key={String(item.id)} 
              style={[
                styles.item, 
                selectedItems.includes(item.id) ? styles.selectedItem : {} // aplicando borda aos items selecionados.
              ]} 
              activeOpacity={0.5} // propriedade do touchableopacity para controlar a opacidade.
              onPress={() => handleSelectItem(item.id)}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))
        }
      </ScrollView>
    </View>
  </SafeAreaView>
  )
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight, // fornece informações do sistema e aplicativo.
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});

export default Points;