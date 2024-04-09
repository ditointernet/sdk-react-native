import React from 'react';
import {Platform, Pressable, Text, TextInput, View} from 'react-native';

import {ditoAPI} from './utils/api';
import {styles} from './styles';
import {useNotification} from './hook/Notification';

function App() {
  const {userData, setUserData} = useNotification();

  const handleIdentify = async () => {
    await ditoAPI.identify({userData});
    await ditoAPI.registerMobile({
      userData: userData,
      token: userData.token,
      platform: Platform.OS === 'ios' ? 'Apple iPhone' : 'android',
    });
  };

  const handleRemoveToken = async () => {
    await ditoAPI.removeMobile({
      userData: userData,
      token: userData.token,
      platform: Platform.OS === 'ios' ? 'Apple iPhone' : 'android',
    });
  };

  const handleNotification = async () => {
    await ditoAPI.event({
      userData: userData,
      event: {
        action: 'action-test',
      },
    });
  };

  return (
    <View style={styles.view}>
      <Text style={styles.title}>App de test integração</Text>

      <View style={{width: '70%'}}>
        <Text style={styles.label}>CPF</Text>
        <TextInput
          onChangeText={id => setUserData({...userData, id})}
          keyboardType="number-pad"
          defaultValue={userData.id}
          style={styles.input}
        />
      </View>

      <Pressable onPress={handleIdentify} style={styles.buttonIdentify}>
        <Text style={styles.text}>Identificar usuário</Text>
      </Pressable>
      <Pressable onPress={handleNotification} style={styles.buttonNotify}>
        <Text style={styles.text}>Receber notificação</Text>
      </Pressable>
      <Pressable onPress={handleRemoveToken} style={styles.buttonRemoveToken}>
        <Text style={styles.text}>Remover token</Text>
      </Pressable>
    </View>
  );
}

export default App;
