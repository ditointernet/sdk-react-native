# Dito React Native SDK

## Projeto de exemplo

As libs utilizadas neste projeto foram:
- https://notifee.app/
- https://rnfirebase.io/

## Como utilizar no projeto

1) O disparo de push é feito através do Google FCM. Para o funcionamento completo é necessário instalar e configurar a lib **rcfirebase** que possibilita utilizar as principais funcionalidade do Google Firebase dentro do app.
Na [documentação do rnfirebase](https://rnfirebase.io/messaging/usage) há um guia de como instalar e configurar corretamente nos ambientes Android & iOS ou Expo.

2) Depois de configurar o rnfirebase, o projeto está hapto a começar a utilizar os push da Dito. O App irá receber o evento via foregound ou background e devemos implementar a lib que irá mostar a mensagem na tela, o **notifee**
vem para comprir este papel.

3) O arquivo `example/src/hooks/Notification.tsx` já faz a implementação do **notifee** com deduplicação de mensagens com fila de consumo utilizando os eventos: foregound e background. Copie para teu projeto e personalize como necessário
