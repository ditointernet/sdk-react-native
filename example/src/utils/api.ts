import sha1 from 'sha1';

import {SECRET, KEY} from '@env';
import {Platform} from 'react-native';
import axios from 'axios';

export type UserData = {
  id: string;
  name?: string;
  birthday?: string;
  location?: string;
  custom_Data?: {[key: string]: any};
} & {[key: string]: any};

type Identify = {
  userData: UserData;
};

type RegisterMobile = {
  userData: UserData;
  token?: string;
  platform: string;
};

const convertToSHA1 = (input: string) => {
  const digest = sha1(input);

  return digest;
};

const signature = convertToSHA1(SECRET);

const _getUserAgent = () => {
  const platform = Platform.OS;
  const appName = 'Dito SDK Test';
  const appVersion = '1.0';

  let system;
  let model;

  if (Platform.OS === 'ios') {
    system = 'ios';
    model = Platform.Version;
  } else if (Platform.OS === 'android') {
    system = 'android';
    model = Platform.Version;
  } else {
    system = platform;
    model = 'Unknown';
  }

  return `${appName}/${appVersion} (${system}; ${model})`;
};

const defaultUserAgent = _getUserAgent();

const API = axios.create({
  transformRequest: [
    data => {
      const {id, ...raw} = data;

      const d = {
        ...raw,
        platform_api_key: KEY,
        sha1_signature: signature,
      };

      return d;
    },
  ],
  params: {
    platform_api_key: KEY,
    sha1_signature: signature,
    encoding: 'base64',
  },
  headers: {
    'User-Agent': defaultUserAgent,
    'Content-Type': 'application/json;charset=utf-8',
    Accept: 'application/json;charset=utf-8',
    accept: 'application/json',
    Cookie: '',
  },
});

export const ditoAPI = {
  identify: async ({userData}: Identify) => {
    const data = {
      user_data: userData,
    };

    const login = await API.post(
      `https://login.plataformasocial.com.br/users/portal/${userData.id}/signup`,
      data,
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error.message;
        }

        console.info(`Dito: usuário ${userData.id} identificado com sucesso! `);
      })
      .catch(error => console.error(error));

    const update = await API.put(
      `https://login.plataformasocial.com.br/users/${userData.id}`,
      {},
      {
        params: {
          ...data,
          id_type: 'id',
          network_name: 'pt',
          platform_api_key: KEY,
          sha1_signature: signature,
        },
      },
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error.message;
        }

        console.info(
          `Dito: dados do usuário ${userData.id} atualizados sucesso! `,
        );
      })
      .catch(error => console.error(error));

    return await Promise.all([login, update]);
  },
  updateUserData: async ({userData}: Identify) => {
    const data = {
      user_data: userData,
    };

    return await API.put(
      `https://login.plataformasocial.com.br/users/${userData.id}`,
      {},
      {
        params: {
          ...data,
          id_type: 'id',
          network_name: 'pt',
          platform_api_key: KEY,
          sha1_signature: signature,
        },
      },
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error.message;
        }

        console.info(
          `Dito: dados do usuário ${userData.id} atualizados sucesso! `,
        );
      })
      .catch(error => console.error(error));
  },
  event: async ({event, userData}: {event: any; userData: UserData}) => {
    const data = {
      id_type: 'id',
      network_name: 'pt',
      event: JSON.stringify(event),
      platform_api_key: KEY,
      sha1_signature: signature,
    };

    return API.post(
      `http://events.plataformasocial.com.br/users/${userData.id}`,
      {},
      {params: data},
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error;
        }

        console.info('Dito: evento enviado com  sucesso! ');
      })
      .catch(error => console.error(error.message));
  },
  openNotification: async ({
    notificationId,
    reference,
    userData,
  }: {
    notificationId: string;
    reference: string;
    userData: UserData;
  }) => {
    const params = {
      channel_type: 'mobile',
      platform_api_key: KEY,
      sha1_signature: signature,
    };

    return API.post(
      `
      https://notification.plataformasocial.com.br/notifications/${userData.id}/open/`,
      {
        data: JSON.stringify({
          identifier: notificationId,
          reference: reference,
        }),
      },
      {
        params,
      },
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error;
        }

        console.info(
          'Dito: Evento de abertura de notificação enviado com sucesso! ',
        );
      })
      .catch(error => console.error(error.message));
  },
  registerMobile: async ({userData, token, platform}: RegisterMobile) => {
    const data = {
      id_type: 'id',
      token,
      platform,
      platform_api_key: KEY,
      sha1_signature: signature,
    };

    return API.post(
      `https://notification.plataformasocial.com.br/users/${userData.id}/mobile-tokens/`,
      {},
      {params: data},
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error;
        }

        console.info('Dito: token registrado com sucesso! ');
      })
      .catch(error => console.error(error.message));
  },
  removeMobile: async ({userData, token, platform}: RegisterMobile) => {
    const data = {
      id_type: 'id',
      token,
      platform,
      platform_api_key: KEY,
      sha1_signature: signature,
    };

    return API.post(
      `https://notification.plataformasocial.com.br/users/${userData.id}/mobile-tokens/disable`,
      {},
      {params: data},
    )
      .then(result => {
        if (result.data.error) {
          throw result.data.error;
        }

        console.info('Dito: token removido com sucesso! ');
      })
      .catch(error => console.error(error.message));
  },
};
