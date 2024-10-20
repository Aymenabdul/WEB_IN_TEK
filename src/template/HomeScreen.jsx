import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';

const HomeScreen = ({ userFirstName }) => {
    const [selectedValue, setSelectedValue] = useState('account');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: 'https://via.placeholder.com/50' }} // Replace with your image URL
                        style={styles.profileImage}
                    />
                    <Text style={styles.firstName}>{userFirstName}</Text>
                </View>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                    />
                    <TouchableOpacity style={styles.searchIcon}>
                        <FontAwesome name={'search'} size={20} />
                    </TouchableOpacity>
                </View>
                <Picker
                    selectedValue={selectedValue}
                    style={styles.dropdown}
                    onValueChange={(itemValue) => setSelectedValue(itemValue)}
                >
                    <Picker.Item label="Account" value="account" />
                    <Picker.Item label="FAQ" value="faq" />
                </Picker>
            </View>
            {/* Add more components for the rest of your home screen */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        backgroundColor: '#f8f8f8', // Adjust as needed
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    firstName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
    },
    searchIcon: {
        marginLeft: 10,
    },
    dropdown: {
        width: 100,
        height: 40,
    },
});

export default HomeScreen;
