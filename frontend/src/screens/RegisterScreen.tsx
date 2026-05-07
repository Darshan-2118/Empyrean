import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ArrowLeft, User, Key, Check, X, ShieldCheck, Mail, Phone, Users } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Stepper, Step } from '../components/Stepper';

const { width } = Dimensions.get('window');

export const RegisterScreen = () => {
    const navigation = useNavigation<any>();

    // Step 1: Verification
    const [contactMethod, setContactMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [verifyMsg, setVerifyMsg] = useState('');

    const handleVerify = () => {
        if (verificationCode.trim().length >= 4) {
            setIsVerified(true);
            setVerifyMsg('Successfully verified!');
        } else {
            setVerifyMsg('Invalid code.');
        }
    };

    const [currentStep, setCurrentStep] = useState(1);

    // Step 2: Form
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [createError, setCreateError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+]/.test(password);
    const isPasswordValid = hasLength && hasUpper && hasNumber && hasSpecial;

    const handleCreateAccount = () => {
        if (!name || !username || !gender || !password) {
            setCreateError('Please fill out all required fields.');
            return;
        }
        if (!isPasswordValid) {
            setCreateError('Please ensure all password requirements are met.');
            return;
        }
        setCreateError('');
        setIsSuccess(true);
    };

    if (isSuccess) {
        return (
            <View style={styles.container}>
                <Video
                    source={{ uri: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4" }}
                    style={StyleSheet.absoluteFill}
                    shouldPlay
                    isLooping
                    isMuted
                    resizeMode={ResizeMode.COVER}
                />
                <View style={styles.darkOverlay} />
                <View style={[styles.content, { justifyContent: 'center' }]}>
                    <View style={[styles.glassCard, { alignItems: 'center', paddingVertical: 50 }]}>
                        <ShieldCheck color="#4ade80" size={80} style={{ marginBottom: 20 }} />
                        <Text style={styles.title}>Account Created!</Text>
                        <Text style={[styles.subtitle, { textAlign: 'center', marginVertical: 20 }]}>
                            Welcome to Empyrean. Your account has been successfully verified and created.
                        </Text>
                        <TouchableOpacity 
                            style={[styles.loginBtn, { width: '100%' }]} 
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginBtnText}>Proceed to Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

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
                    <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.glassCard}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Create an Account</Text>
                            <Text style={styles.subtitle}>Join the Empyrean Ecosystem</Text>
                        </View>

                        <Stepper
                            initialStep={1}
                            onStepChange={(step: number) => setCurrentStep(step)}
                            onFinalStepCompleted={handleCreateAccount}
                            disableStepIndicators={true}
                            nextButtonProps={{ 
                                disabled: (currentStep === 1 && !isVerified) || (currentStep === 2 && (!name || !username || !gender || !isPasswordValid)) 
                            }}
                            backButtonText="Previous"
                            nextButtonText={currentStep === 2 ? "Create Account" : "Continue"}
                        >
                            <Step>
                                <View style={styles.stepContainer}>
                                    <Text style={styles.stepTitle}>1. Verification</Text>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Send verification code via:</Text>
                                        <View style={styles.radioGroup}>
                                            <TouchableOpacity style={styles.radioBtn} onPress={() => setContactMethod('email')}>
                                                <View style={[styles.radioInner, contactMethod === 'email' && styles.radioActive]} />
                                                <Text style={styles.radioText}>Email</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.radioBtn} onPress={() => setContactMethod('sms')}>
                                                <View style={[styles.radioInner, contactMethod === 'sms' && styles.radioActive]} />
                                                <Text style={styles.radioText}>SMS</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {contactMethod === 'email' ? (
                                            <View style={styles.inputContainer}>
                                                <Mail color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter your email"
                                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                                    value={email}
                                                    onChangeText={setEmail}
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                />
                                            </View>
                                        ) : (
                                            <View style={styles.inputContainer}>
                                                <Phone color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Enter your phone number"
                                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                                    value={phone}
                                                    onChangeText={setPhone}
                                                    keyboardType="phone-pad"
                                                />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Verification Code</Text>
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            <View style={[styles.inputContainer, { flex: 1 }]}>
                                                <ShieldCheck color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                                                <TextInput
                                                    style={styles.input}
                                                    placeholder="Code from SMS/Email"
                                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                                    value={verificationCode}
                                                    onChangeText={setVerificationCode}
                                                    editable={!isVerified}
                                                />
                                            </View>
                                            {!isVerified ? (
                                                <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
                                                    <Text style={styles.verifyBtnText}>Verify</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={styles.verifiedBox}>
                                                    <ShieldCheck color="#4ade80" size={20} />
                                                    <Text style={styles.verifiedText}>Verified</Text>
                                                </View>
                                            )}
                                        </View>
                                        {verifyMsg ? (
                                            <Text style={[styles.verifyMsgText, isVerified ? { color: '#4ade80' } : { color: '#f87171' }]}>
                                                {verifyMsg}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            </Step>

                            <Step>
                                <View style={styles.stepContainer}>
                                    <Text style={styles.stepTitle}>2. Account Details</Text>
                                    
                                    {createError ? (
                                        <View style={styles.errorBox}>
                                            <Text style={styles.errorText}>{createError}</Text>
                                        </View>
                                    ) : null}

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Full Name</Text>
                                        <View style={styles.inputContainer}>
                                            <User color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="John Doe"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={name}
                                                onChangeText={setName}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Username</Text>
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.atSymbol}>@</Text>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="johndoe123"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={username}
                                                onChangeText={setUsername}
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Gender</Text>
                                        <View style={styles.inputContainer}>
                                            <Users color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Male / Female / Other"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={gender}
                                                onChangeText={setGender}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Secure Password</Text>
                                        <View style={[styles.inputContainer, password.length > 0 && (isPasswordValid ? styles.inputSuccess : styles.inputError)]}>
                                            <Key color="rgba(255,255,255,0.5)" size={18} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Create a strong password"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry
                                            />
                                        </View>
                                        
                                        <View style={styles.passwordRules}>
                                            <View style={styles.ruleRow}>
                                                {hasLength ? <Check size={14} color="#4ade80" /> : <X size={14} color="rgba(255,255,255,0.5)" />}
                                                <Text style={[styles.ruleText, hasLength && styles.ruleTextSuccess]}>At least 8 characters</Text>
                                            </View>
                                            <View style={styles.ruleRow}>
                                                {hasUpper ? <Check size={14} color="#4ade80" /> : <X size={14} color="rgba(255,255,255,0.5)" />}
                                                <Text style={[styles.ruleText, hasUpper && styles.ruleTextSuccess]}>One uppercase letter</Text>
                                            </View>
                                            <View style={styles.ruleRow}>
                                                {hasNumber ? <Check size={14} color="#4ade80" /> : <X size={14} color="rgba(255,255,255,0.5)" />}
                                                <Text style={[styles.ruleText, hasNumber && styles.ruleTextSuccess]}>One number</Text>
                                            </View>
                                            <View style={styles.ruleRow}>
                                                {hasSpecial ? <Check size={14} color="#4ade80" /> : <X size={14} color="rgba(255,255,255,0.5)" />}
                                                <Text style={[styles.ruleText, hasSpecial && styles.ruleTextSuccess]}>One special character</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Step>
                        </Stepper>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    darkOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
    content: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 100, paddingBottom: 50, alignItems: 'center' },
    backBtn: { position: 'absolute', top: 40, left: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8 },
    backText: { color: 'white', fontWeight: '600' },
    glassCard: { 
        width: '100%', 
        maxWidth: 500, 
        backgroundColor: 'rgba(255,255,255,0.1)', 
        borderRadius: 24, 
        paddingTop: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)'
    },
    header: { alignItems: 'center', marginBottom: 20 },
    title: { color: 'white', fontSize: 32, fontWeight: '600', marginBottom: 5 },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontStyle: 'italic' },
    stepContainer: { width: '100%' },
    stepTitle: { color: 'white', fontSize: 20, fontWeight: '600', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 10 },
    radioGroup: { flexDirection: 'row', gap: 20, marginBottom: 15 },
    radioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    radioInner: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#5227ff' },
    radioActive: { backgroundColor: '#5227ff' },
    radioText: { color: 'white', fontSize: 16 },
    errorBox: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)', borderRadius: 12, padding: 12, marginBottom: 20 },
    errorText: { color: '#fca5a5', fontSize: 14, textAlign: 'center' },
    inputGroup: { marginBottom: 20 },
    label: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', marginBottom: 8, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, height: 50 },
    inputSuccess: { borderColor: 'rgba(74, 222, 128, 0.5)' },
    inputError: { borderColor: 'rgba(239, 68, 68, 0.5)' },
    inputIcon: { paddingHorizontal: 15 },
    atSymbol: { paddingHorizontal: 15, color: 'rgba(255,255,255,0.5)', fontSize: 18, fontWeight: 'bold' },
    input: { flex: 1, color: 'white', fontSize: 16 },
    verifyBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 20, borderRadius: 16, justifyContent: 'center' },
    verifyBtnText: { color: 'white', fontWeight: '600' },
    verifiedBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 6 },
    verifiedText: { color: '#4ade80', fontWeight: '600', fontSize: 16 },
    verifyMsgText: { marginTop: 8, marginLeft: 4, fontSize: 14 },
    passwordRules: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, paddingHorizontal: 4 },
    ruleRow: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 6, gap: 6 },
    ruleText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    ruleTextSuccess: { color: '#4ade80' },
    loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5227ff', borderRadius: 16, height: 54, marginTop: 10 },
    loginBtnText: { color: 'white', fontWeight: '600', fontSize: 16 }
});
