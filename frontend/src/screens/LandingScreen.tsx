import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Menu, Download } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export const LandingScreen = () => {
    const navigation = useNavigation<any>();

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
            
            <View style={styles.overlay}>
                <View style={styles.glassPanel}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoText}>EMPYREAN</Text>
                        </View>
                        <TouchableOpacity style={styles.menuBtn}>
                            <Text style={styles.menuText}>Menu</Text>
                            <Menu color="white" size={16} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.centerContent}>
                        <Text style={styles.title}>Breathing</Text>
                        <Text style={styles.subtitle}>Intelligence into Air Data</Text>

                        <TouchableOpacity 
                            style={styles.exploreBtn}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.exploreText}>Explore Now</Text>
                            <View style={styles.iconCircle}>
                                <Download color="white" size={16} />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerLabel}>Visionary Design</Text>
                        <Text style={styles.footerQuote}>"Where Air Meets Intelligence at the Highest Plane"</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    overlay: { flex: 1, padding: width > 768 ? 40 : 20 },
    glassPanel: { 
        flex: 1, 
        backgroundColor: 'rgba(255,255,255,0.08)', 
        borderRadius: 32, 
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoText: { color: 'white', fontSize: 24, fontWeight: '700', letterSpacing: 1 },
    menuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8 },
    menuText: { color: 'white', fontWeight: '600' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { color: 'white', fontSize: width > 768 ? 64 : 48, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
    subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: width > 768 ? 48 : 32, fontStyle: 'italic', textAlign: 'center', marginBottom: 60 },
    exploreBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 40, gap: 12 },
    exploreText: { color: 'white', fontWeight: '600', fontSize: 18 },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    footer: { alignItems: 'center', marginBottom: 20 },
    footerLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 },
    footerQuote: { color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', textAlign: 'center', fontSize: 18 }
});
