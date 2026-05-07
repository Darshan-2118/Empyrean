import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Check } from 'lucide-react-native';

export const Stepper = ({
    children,
    initialStep = 1,
    onStepChange = () => {},
    onFinalStepCompleted = () => {},
    backButtonText = 'Previous',
    nextButtonText = 'Continue',
    disableStepIndicators = false,
    nextButtonProps = {},
    backButtonProps = {}
}: any) => {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const stepsArray = React.Children.toArray(children);
    const totalSteps = stepsArray.length;
    const isCompleted = currentStep > totalSteps;
    const isLastStep = currentStep === totalSteps;

    const updateStep = (newStep: number) => {
        setCurrentStep(newStep);
        if (newStep > totalSteps) {
            onFinalStepCompleted();
        } else {
            onStepChange(newStep);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) updateStep(currentStep - 1);
    };

    const handleNext = () => {
        if (!isLastStep) updateStep(currentStep + 1);
    };

    const handleComplete = () => {
        updateStep(totalSteps + 1);
    };

    return (
        <View style={styles.container}>
            <View style={styles.stepIndicatorRow}>
                {stepsArray.map((_, index) => {
                    const stepNumber = index + 1;
                    const isNotLastStep = index < totalSteps - 1;
                    const status = currentStep === stepNumber ? 'active' : currentStep < stepNumber ? 'inactive' : 'complete';
                    
                    return (
                        <React.Fragment key={stepNumber}>
                            <TouchableOpacity 
                                disabled={disableStepIndicators || status === 'inactive'}
                                onPress={() => updateStep(stepNumber)}
                                style={[styles.stepCircle, status === 'active' || status === 'complete' ? styles.stepActive : styles.stepInactive]}
                            >
                                {status === 'complete' ? (
                                    <Check color="white" size={16} />
                                ) : status === 'active' ? (
                                    <View style={styles.activeDot} />
                                ) : (
                                    <Text style={styles.stepText}>{stepNumber}</Text>
                                )}
                            </TouchableOpacity>
                            {isNotLastStep && (
                                <View style={styles.connectorContainer}>
                                    <View style={[styles.connectorInner, { width: currentStep > stepNumber ? '100%' : '0%' }]} />
                                </View>
                            )}
                        </React.Fragment>
                    );
                })}
            </View>

            <View style={styles.contentContainer}>
                {!isCompleted && stepsArray[currentStep - 1]}
            </View>

            {!isCompleted && (
                <View style={[styles.footer, currentStep === 1 ? { justifyContent: 'flex-end' } : { justifyContent: 'space-between' }]}>
                    {currentStep !== 1 && (
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack} {...backButtonProps}>
                            <Text style={styles.backBtnText}>{backButtonText}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                        style={[styles.nextBtn, nextButtonProps.disabled && styles.nextBtnDisabled]} 
                        onPress={isLastStep ? handleComplete : handleNext}
                        disabled={nextButtonProps.disabled}
                    >
                        <Text style={[styles.nextBtnText, nextButtonProps.disabled && styles.nextBtnTextDisabled]}>
                            {isLastStep ? 'Create Account' : nextButtonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export const Step = ({ children }: any) => {
    return <View>{children}</View>;
};

const styles = StyleSheet.create({
    container: { width: '100%' },
    stepIndicatorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, paddingHorizontal: 10 },
    stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    stepActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    stepInactive: { backgroundColor: 'rgba(255,255,255,0.1)' },
    activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'white' },
    stepText: { color: '#a3a3a3', fontWeight: 'bold' },
    connectorContainer: { flex: 1, height: 2, backgroundColor: '#52525b', marginHorizontal: 8, borderRadius: 1, overflow: 'hidden' },
    connectorInner: { height: '100%', backgroundColor: 'rgba(255,255,255,0.5)' },
    contentContainer: { minHeight: 200, width: '100%' },
    footer: { flexDirection: 'row', marginTop: 20 },
    backBtn: { paddingVertical: 10, paddingHorizontal: 15 },
    backBtnText: { color: '#a3a3a3', fontSize: 16, fontWeight: '500' },
    nextBtn: { backgroundColor: '#5227ff', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
    nextBtnDisabled: { backgroundColor: '#3f3f46' },
    nextBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
    nextBtnTextDisabled: { color: '#a3a3a3' }
});
