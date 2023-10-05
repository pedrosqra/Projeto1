import React, {useEffect, useRef, useState} from 'react';
import {Button, View} from 'react-native';
import * as Notifications from 'expo-notifications';
import {useUserStore} from '../../store/user';
import {registerForPushNotificationsAsync, schedulePushNotification} from '../../resources/notifications';
import styles from './HomeScreenStyles';
import firebase from 'firebase/compat';
import {getDebtsForUser} from "../../../backend/group-config/group-service";
import User = firebase.User;
import { Text,TouchableOpacity, View, Button, StyleSheet, Image, ScrollView, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import styles from './HomeScreenStyles'
import Ionicons from '@expo/vector-icons/Ionicons';
import { readUser } from '../../../backend/user-config/user-service';
import { getGroups } from '../../../backend/group-config/group-service';
import { DocumentData } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import navigation from "../../navigation/Navigation";
import React, {useEffect, useRef, useState} from 'react';
import {Button, View} from 'react-native';
import * as Notifications from 'expo-notifications';
import {useUserStore} from '../../store/user';
import {registerForPushNotificationsAsync, schedulePushNotification} from '../../resources/notifications';
import styles from './HomeScreenStyles';
import firebase from 'firebase/compat';
import {getDebtsForUser} from "../../../backend/group-config/group-service";
import User = firebase.User;

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const HomeScreen = ({route}) => {
    const {uid} = route.params;
    const {email} = useUserStore();
    const [expoPushToken, setExpoPushToken] = useState<any>('');
    const [notification, setNotification] = useState<any>();
    const notificationListener = useRef<any>();
    const responseListener = useRef<any>();
    const [userData, setUserData] = useState<User | null>(null);
    const [userDebts, setUserDebts] = useState<Map<string, number>>(new Map());
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserDebts = async () => {
            try {
                const userDebts = await getDebtsForUser('s7riXqLLHwZ8nHXGaVA2k9qTipa2');

                const groupedDebts = {};

                userDebts.forEach((debt) => {
                    groupedDebts[debt.groupId] = debt.amount;
                });

                setUserDebts(groupedDebts);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        // Fetch user data and debts
        fetchUserDebts();

        //main().then((r) => console.log('Main called'));
        registerForPushNotificationsAsync()
            .then((token) => setExpoPushToken(token))
            .catch(() => {
            });

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log(response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    const onPressAdicionarGrupo = () => {
        // Lógica para adicionar novo grupo
        console.log('Novo grupo adicionado!');
        // Adicione sua lógica aqui, como abrir um modal ou navegar para outra tela
    };

    const navigateToGroup = (groupId: string) => {
        console.log('Navegar para o grupo: ', groupId);
        navigation.navigate('GroupScreen', { groupId });

    };

    return (
      <View style={styles.container}>

        <View style={styles.header}>
          <View style={styles.profileContent}>
            <Image
              source={{uri: 'https://s2-valor.glbimg.com/LZyCSHR22BjRuB06S60vWzmKJqQ=/0x0:5408x3355/888x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_63b422c2caee4269b8b34177e8876b93/internal_photos/bs/2020/T/A/fuvfecS5Od2cxQlrQ5Pw/kym-mackinnon-aerego3rque-unsplash.jpg'}}
              style={styles.profileImage}
              />
            <Text style={styles.profileName}>{ userName }</Text>
          </View>
          <View style={styles.notificationContent}>
            <Ionicons name="notifications-outline" size={28} color="white"/>
          </View>

        <View style={styles.searchContainer}>

        </View>

        <View style={styles. groupListTitleView}>
          <Text style={styles.groupsListTitle}>Grupos</Text>
        </View>
        <ScrollView style={styles.list}>
          {groups.map((group) => (
            <TouchableOpacity key={group.groupId} onPress={() => navigateToGroup(group.groupId)} >
              <View style={styles.listItem} key={group.groupId}>
                <View style={styles.groupImageContainer}>
                  <Ionicons name="people-outline" size={28} color="white"/>
                </View>
                <View style={styles.groupInfo}>
                  <Text style= {styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription}>{group.debtDescription}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.addGroupButtonView}>
          <TouchableOpacity onPress={onPressAdicionarGrupo} style={styles.addGroupButton}>
            <Ionicons name="add-circle-outline" size={28} color="white" style={styles.addIcon}/>
            <Text style={styles.addText}>Adicionar novo grupo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
};


export default HomeScreen;


