import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ArrowLeft, User, Lock, LogIn } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        
        setError('');
        
        try {
            const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Invalid username or password.');
                } else if (response.status === 422) {
                    setError('Missing required fields.');
                } else {
                    setError('Login failed. Please try again later.');
                }
                return;
            }

            const data = await response.json();
            // Data contains: access_token, refresh_token, expires_in, role
            // Typically you would store the tokens in SecureStore or AsyncStorage here.
            
            navigation.navigate('MainDrawer');
        } catch (err) {
            console.error(err);
            setError('Network error. Is the server running?');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Video
                source={{ uri: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4" }}
                style={StyleSheet.absoluteFill}
                shouldPlay
                isLooping
                isMuted
                resizeMode={ResizeMode.COVER}
            />
            <View style={styles.darkOverlay} />
            
            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft color="white" size={16} />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.glassCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Access the Intelligence</Text>
                    </View>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Username</Text>
                        <View style={styles.inputContainer}>
                            <User color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Password</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotText}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Lock color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <Text style={styles.loginBtnText}>Login to Dashboard</Text>
                        <LogIn color="white" size={18} />
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Create an account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    backBtn: { position: 'absolute', top: 40, left: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8 },
    backText: { color: 'white', fontWeight: '600' },
    glassCard: { 
        width: '100%', 
        maxWidth: 400, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: 24, 
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)'
    },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { color: 'white', fontSize: 32, fontWeight: '600', marginBottom: 5 },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontStyle: 'italic' },
    errorBox: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)', borderRadius: 12, padding: 12, marginBottom: 20 },
    errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center' },
    inputGroup: { marginBottom: 20 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 },
    label: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
    forgotText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, height: 50 },
    inputIcon: { paddingHorizontal: 15 },
    input: { flex: 1, color: 'white', fontSize: 16 },
    loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, height: 54, gap: 8, marginTop: 10 },
    loginBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    registerLink: { color: 'white', fontSize: 14, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.4)' }
});
