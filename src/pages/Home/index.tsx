import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Image, StyleSheet, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

interface Select {
  label: string;
  value: string;
}


const Home = () => {
  const [ufs, setUfs] = useState<Select[]>([]);
  const [cities, setCities] = useState<Select[]>([]);

  const [selectedUf, setSelectedUf] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const navigation = useNavigation();


  useEffect(() => {
    // Pegando os Estados da API do IBGE.
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        
        const ufInitials = response.data.map(uf => ({label: uf.sigla, value: uf.sigla}) )
        setUfs(ufInitials)
      })
  }, []);


  useEffect(() => {
    // Pegando as cidades de acordo com o estado selecionado da API do IBGE.
   if(selectedUf === '0'){
     return;
   }

   axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
     .then(response => {
       const cityNames = response.data.map(city => ({label: city.nome, value: city.nome}) )
       setCities(cityNames)
     })
 }, [selectedUf]);



  function handleNavigationToPoints(){
    navigation.navigate('Points', {
      uf: selectedUf,
      city: selectedCity
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}// O imageStyle permite estilizar a imagem de background separada.
    >      
      <View style={styles.main}>
         <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
          </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.input}>
          <RNPickerSelect 
            placeholder={{ label: 'Selecione um Estado', value: 'Selecione um Estado' }}
            style={{ viewContainer: { flex: 1,justifyContent: 'center', alignItems: 'center', backgroundColor: 'RED' } }}            
            onValueChange={(value) => setSelectedUf(value)}
            items={ufs}
          />
        </View>

        <View style={[styles.input, !selectedUf ? { opacity: .5} : {opacity: 1} ]}>
          <RNPickerSelect 
            placeholder={{ label: 'Selecione uma Cidade', value: 'Selecione uma Cidade' }}
            style={{ viewContainer: { flex: 1,justifyContent: 'center', alignItems: 'center', backgroundColor: 'RED' } }}            
            onValueChange={(value) => setSelectedCity(value)}
            items={cities}
            disabled={!selectedUf}
          />
        </View>


        <RectButton style={styles.button} onPress={handleNavigationToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>

    </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: '#F0F0F5'
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});

export default Home;