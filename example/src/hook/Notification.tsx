import {useCallback, useEffect, useState} from 'react';
import {
  FirebaseMessagingTypes,
  default as messaging,
} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import {UserData, ditoAPI} from '../utils/api';

export const useNotification = () => {
  const [userData, setUserData] = useState<UserData>({
    id: '22222222222',
    name: 'Usuário de teste React Native',
    email: 'sdk-react-native@dito.com.br',
    location: 'São Paulo',
    token: '',
  });

  const [channelId, setChannelId] = useState('');
  const [notifications, setNotifications] = useState<
    FirebaseMessagingTypes.RemoteMessage[]
  >([]);

  const requestUserPermission = useCallback(async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await ditoAPI.updateUserData({
        userData: {...userData, custom_Data: {enablePush: 'true'}},
      });
    }
  }, []);

  const onAppBootstrap = useCallback(async () => {
    await requestUserPermission();
    await messaging().registerDeviceForRemoteMessages();
    const t = await messaging().getToken();
    setUserData({...userData, token: t});
  }, []);

  useEffect(() => {
    onAppBootstrap();
  }, [onAppBootstrap]);

  useEffect(() => {
    const notify = async () => {
      if (notifications.length) {
        for (let i = 0; i < notifications.length; i++) {
          const data = JSON.parse(notifications[i].data?.data as string);

          const details = data.details;

          if (details?.title && details?.message) {
            const not = {
              title: String(details.title),
              body: String(details.message),
              android: {
                channelId,
                importance: AndroidImportance.HIGH,
              },
              data: {
                notification:
                  String(data.notification) || '01HV25WN4E3P3GHSXD90WHQ2BZ',
                reference: String(data.reference),
              },
            };

            await notifee.displayNotification(not);
          }
        }
        setNotifications([]);
      }
    };
    notify();
  }, [notifications]);

  const onMessageReceived = async (message: any) => {
    const hasNotifiedBefore = notifications.find(
      notification =>
        (notification?.data?.details as any)?.notification ===
        (message.data?.details as any)?.notification,
    );

    if (!hasNotifiedBefore) {
      setNotifications(prev => [...prev, message]);
    }
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(onMessageReceived);
    messaging().setBackgroundMessageHandler(onMessageReceived);
    notifee.onBackgroundEvent(() => true);

    const createChannel = async () => {
      setChannelId(
        await notifee.createChannel({
          id: 'DITO',
          name: 'Dito Notification',
          importance: AndroidImportance.HIGH,
        }),
      );
    };

    createChannel();

    return unsubscribe;
  }, []);

  const openNotification = async (notification: string, reference: string) => {
    await ditoAPI.openNotification({
      notificationId: notification,
      reference: reference,
      userData,
    });
  };

  useEffect(() => {
    const handleClickOnNotification = notifee.onForegroundEvent(
      async ({type, detail}) => {
        switch (type) {
          case EventType.DISMISSED:
            console.log('User dismissed notification', detail.notification);
            break;
          case EventType.PRESS:
            const notification = String(
              detail.notification?.data?.notification,
            );
            const reference = String(detail.notification?.data?.reference);

            notification &&
              reference &&
              (await openNotification(notification, reference));

            break;
        }
      },
    );

    return handleClickOnNotification;
  }, []);

  return {userData, setUserData};
};
