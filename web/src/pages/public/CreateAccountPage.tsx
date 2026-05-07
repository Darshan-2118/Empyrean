import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, ShieldCheck, Key, User, Users, CheckCircle, Check, X } from 'lucide-react';
import Stepper, { Step } from '../../components/onboarding/Stepper';

export default function CreateAccountPage() {
    const navigate = useNavigate();

    // Step 1: Verification
    const [contactMethod, setContactMethod] = useState('email');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [verifyMsg, setVerifyMsg] = useState('');

    const handleVerify = () => {
        if (verificationCode.trim().length >= 4) { // Mock verification
            setIsVerified(true);
            setVerifyMsg('Successfully verified!');
        } else {
            setVerifyMsg('Invalid code.');
        }
    };

    const [currentStep, setCurrentStep] = useState(1);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (currentStep === 1) {
                if (!isVerified) {
                    handleVerify();
                } else {
                    const nextBtn = document.querySelector('.next-button') as HTMLButtonElement;
                    nextBtn?.click();
                }
            } else if (currentStep === 2) {
                const completeBtn = document.querySelector('.next-button') as HTMLButtonElement;
                completeBtn?.click();
            }
        }
    };

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

    return (
        <div className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex items-center justify-center p-4">
            
            {/* Background Video (Static) */}
            <video
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4#t=0.1"
            />

            <button 
                onClick={() => navigate('/login')} 
                className="absolute z-10 top-6 left-6 liquid-glass flex items-center gap-2 px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-transform"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Login</span>
            </button>

            <div className="relative z-10 w-full max-w-2xl liquid-glass rounded-3xl p-10 shadow-2xl backdrop-blur-xl" onKeyDown={handleKeyDown}>
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-semibold tracking-tighter text-white">Create an Account</h2>
                    <p className="text-white/70 text-base mt-2 font-serif italic">Join the Empyrean Ecosystem</p>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', bounce: 0.5 }}
                        >
                            <CheckCircle className="w-24 h-24 text-green-400 mb-6" />
                        </motion.div>
                        <h2 className="text-3xl font-semibold tracking-tighter text-white mb-2">Account Created!</h2>
                        <p className="text-white/70 text-base mb-8 text-center max-w-md">
                            Welcome to Empyrean. Your account has been successfully verified and created.
                        </p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="liquid-glass-strong px-8 py-4 rounded-2xl text-white font-medium hover:scale-105 transition-transform"
                        >
                            Proceed to Login
                        </button>
                    </div>
                ) : (
                <Stepper
                    initialStep={1}
                    onStepChange={(step: number) => setCurrentStep(step)}
                    onFinalStepCompleted={handleCreateAccount}
                    disableStepIndicators={true}
                    nextButtonProps={{ disabled: (currentStep === 1 && !isVerified) || (currentStep === 2 && (!name || !username || !gender || !isPasswordValid)) }}
                    backButtonText="Previous"
                    nextButtonText={currentStep === 2 ? "Create Account" : "Continue"}
                >
                    {/* Step 1: Verification */}
                    <Step>
                        <div className="flex flex-col gap-5 text-left mb-4">
                            <h3 className="text-xl font-semibold">1. Verification</h3>
                            
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-medium text-white/80 ml-1">Send verification code via:</label>
                                <div className="flex gap-6 mb-2">
                                    <label className="flex items-center gap-2 text-base cursor-pointer">
                                        <input type="radio" value="email" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} className="accent-[#5227ff] w-4 h-4" />
                                        Email
                                    </label>
                                    <label className="flex items-center gap-2 text-base cursor-pointer">
                                        <input type="radio" value="sms" checked={contactMethod === 'sms'} onChange={() => setContactMethod('sms')} className="accent-[#5227ff] w-4 h-4" />
                                        SMS
                                    </label>
                                </div>

                                {contactMethod === 'email' ? (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-white/50" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Phone className="h-4 w-4 text-white/50" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 mt-6">
                                <label className="text-sm font-medium text-white/80 ml-1">Verification Code</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <ShieldCheck className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-base"
                                            placeholder="Code from SMS/Email"
                                            disabled={isVerified}
                                        />
                                    </div>
                                    {!isVerified ? (
                                        <button type="button" onClick={handleVerify} className="liquid-glass-strong px-6 rounded-2xl text-sm font-medium hover:scale-105 transition-transform">
                                            Verify
                                        </button>
                                    ) : (
                                        <div className="flex items-center text-green-400 text-base font-medium px-4">
                                            <ShieldCheck className="w-6 h-6 mr-2" /> Verified
                                        </div>
                                    )}
                                </div>
                                {verifyMsg && <p className={`text-sm ml-1 ${isVerified ? 'text-green-400' : 'text-red-400'}`}>{verifyMsg}</p>}
                            </div>
                        </div>
                    </Step>

                    {/* Step 2: Account Details */}
                    <Step>
                        <div className="flex flex-col gap-6 text-left mb-4">
                            <h3 className="text-xl font-semibold mb-2 border-b border-white/10 pb-2">2. Account Details</h3>
                            
                            {createError && (
                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm px-4 py-3 rounded-xl backdrop-blur-md">
                                    {createError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-white/80 ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-white/50" />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-base"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-white/80 ml-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-white/50 font-bold text-lg">@</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-base"
                                            placeholder="johndoe123"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white/80 ml-1">Gender</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Users className="h-5 w-5 text-white/50" />
                                    </div>
                                    <select 
                                        value={gender} 
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 text-base appearance-none"
                                    >
                                        <option value="" disabled className="text-black">Select your gender</option>
                                        <option value="male" className="text-black">Male</option>
                                        <option value="female" className="text-black">Female</option>
                                        <option value="other" className="text-black">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white/80 ml-1">Secure Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-white/50" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 text-base transition-colors ${password.length > 0 ? (isPasswordValid ? 'border-green-500/50' : 'border-red-500/50') : 'border-white/10'}`}
                                        placeholder="Create a strong password"
                                    />
                                </div>
                                
                                {/* Password Live Indicators */}
                                <div className="grid grid-cols-2 gap-2 mt-2 px-2">
                                    <div className={`flex items-center text-xs ${hasLength ? 'text-green-400' : 'text-white/50'}`}>
                                        {hasLength ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center text-xs ${hasUpper ? 'text-green-400' : 'text-white/50'}`}>
                                        {hasUpper ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        One uppercase letter
                                    </div>
                                    <div className={`flex items-center text-xs ${hasNumber ? 'text-green-400' : 'text-white/50'}`}>
                                        {hasNumber ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        One number
                                    </div>
                                    <div className={`flex items-center text-xs ${hasSpecial ? 'text-green-400' : 'text-white/50'}`}>
                                        {hasSpecial ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                                        One special character
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>
                </Stepper>
                )}
            </div>
        </div>
    );
}
