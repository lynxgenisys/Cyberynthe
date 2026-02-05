import React, { useState, useEffect } from 'react';
import { supabase, signInWithOtp, verifyOtp, claimInvite, updateProfile, signInWithPassword } from '../../utils/supabase';

// --- RENDER HELPERS (Defined OUTSIDE component to prevent re-mount focus loss) ---
const Input = ({ type, placeholder, value, onChange }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-black/50 border border-cyan/30 p-2 text-cyan placeholder-cyan/30 text-center font-mono focus:border-cyan focus:outline-none focus:bg-cyan/10"
        required
    />
);

const Button = ({ label, onClick, disabled, color = 'cyan' }) => (
    <button
        type="submit"
        onClick={onClick}
        disabled={disabled}
        className={`w-full border border-${color} text-${color} py-2 hover:bg-${color} hover:text-black transition-all font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-wait`}
    >
        {disabled ? '[ PROCESSING... ]' : `[ ${label} ]`}
    </button>
);

const BackBtn = ({ onClick }) => (
    <button type="button" onClick={onClick} className="text-gray-500 hover:text-white text-xs mt-4 underline">[BACK_TO_ROOT]</button>
);

/**
 * AUTH OVERLAY (Split Flow: LOGIN | REGISTER)
 */
export default function AuthOverlay({ onLoginSuccess }) {
    // MODES: 'SELECT', 'LOGIN', 'REGISTER_EMAIL', 'REGISTER_OTP', 'REGISTER_PROFILE', 'REGISTER_TICKET'
    const [mode, setMode] = useState('SELECT');

    // FORM STATE
    const [loginId, setLoginId] = useState(''); // Email or Username
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [hackerId, setHackerId] = useState('');
    const [ticket, setTicket] = useState('');

    // UI FEEDBACK
    const [status, setStatus] = useState(''); // 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'
    const [msg, setMsg] = useState('');

    // --- 0. AUTO-DETECT MAGIC LINK LOGIN ---
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                console.log("[AUTH]: Magic Link / Session Detected", session.user);

                // Determine next step
                // Check if profile exists
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('hacker_id, invite_claimed')
                    .eq('id', session.user.id)
                    .single();

                if (!profile) {
                    // Step 3: Profile Creation Needed
                    setMsg("UPLINK_VERIFIED. IDENTITY_REQUIRED.");
                    setStatus('IDLE');
                    setMode('REGISTER_PROFILE');
                } else if (!profile.invite_claimed) {
                    // Step 4: Ticket Needed
                    setMsg("IDENTITY_FOUND. CLEARANCE_REQUIRED.");
                    setStatus('IDLE');
                    setMode('REGISTER_TICKET');
                    setHackerId(profile.hacker_id); // Pre-fill?
                } else {
                    // Fully Complete - Login
                    setMsg("WELCOME_BACK_OPERATIVE.");
                    setStatus('SUCCESS');
                    setTimeout(() => onLoginSuccess(session.user.email), 1000);
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // --- 1. DIRECT LOGIN (Existing User) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setMsg("AUTHENTICATING...");

        const result = await signInWithPassword(loginId, password);
        if (result.success) {
            setMsg("ACCESS_GRANTED");
            setStatus('SUCCESS');
            setTimeout(() => onLoginSuccess(result.data.user.email), 1000);
        } else {
            console.error(result.error);
            setMsg(`ACCESS_DENIED: ${result.error}`);
            setStatus('ERROR');
        }
    };

    // --- 2. REGISTRATION FLOW (New User) ---
    // A. Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setMsg("INITIATING_UPLINK...");

        const result = await signInWithOtp(email);
        if (result.success) {
            setMsg("UPLINK_ESTABLISHED. ENTER_GHOST_CODE.");
            setStatus('IDLE');
            setMode('REGISTER_OTP');
        } else {
            setMsg(`CONNECTION_REFUSED: ${result.error}`);
            setStatus('ERROR');
        }
    };

    // B. Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setMsg("VERIFYING_SIGNATURE...");

        const result = await verifyOtp(email, otp);
        if (result.success) {
            setMsg("SIGNATURE_ACCEPTED.");
            setStatus('IDLE');
            // Check if profile exists? For now assume new reg flow always goes to Profile
            setMode('REGISTER_PROFILE');
        } else {
            setMsg(`INVALID_SIGNATURE: ${result.error}`);
            setStatus('ERROR');
        }
    };

    // C. Create Profile (Password + Username)
    const handleRegisterProfile = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setMsg("BUILDING_DIGITAL_SELF...");

        // 1. Set Password
        const { error: pwdError } = await supabase.auth.updateUser({ password: password });
        if (pwdError) {
            setMsg(`PASSWORD_REJECTED: ${pwdError.message}`);
            setStatus('ERROR');
            return;
        }

        // 2. Set Profile (Username)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const profileRes = await updateProfile(user.id, hackerId);
            if (profileRes.success) {
                setMsg("IDENTITY_CONSTRUCTED.");
                setStatus('IDLE');
                setMode('REGISTER_TICKET');
            } else {
                setMsg(`PROFILE_ERROR: ${profileRes.error}`);
                setStatus('ERROR');
            }
        }
    };

    // D. Claim Ticket
    const handleClaimTicket = async (e) => {
        e.preventDefault();
        setStatus('LOADING');
        setMsg("VALIDATING_TICKET...");

        const result = await claimInvite(ticket);
        if (result.success) {
            setMsg("TICKET_PUNCHED. WELCOME_TO_CYBERYNTHE.");
            setStatus('SUCCESS');
            setTimeout(() => onLoginSuccess(email), 1500);
        } else {
            setMsg(`INVALID_TICKET: ${result.error}`);
            setStatus('ERROR');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md">
            <div className="w-[400px] border-2 border-cyan/20 p-8 shadow-[0_0_50px_rgba(0,255,255,0.1)] relative overflow-hidden bg-black">
                {/* SCANLINE */}
                <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-10 pointer-events-none"></div>

                {mode === 'SELECT' && (
                    <div className="flex flex-col gap-6 animate-fadeIn">
                        <h2 className="text-2xl font-black text-center text-cyan tracking-widest mb-4">GATEWAY_PROTOCOL</h2>
                        <button onClick={() => setMode('LOGIN')} className="group border border-cyan p-4 hover:bg-cyan/10 transition-all flex flex-col items-center">
                            <span className="text-xl font-bold text-cyan group-hover:text-white mb-1">LOGIN</span>
                            <span className="text-[10px] text-gray-500">EXISTING_ENTITY // PASSWORD</span>
                        </button>
                        <button onClick={() => setMode('REGISTER_EMAIL')} className="group border border-magenta p-4 hover:bg-magenta/10 transition-all flex flex-col items-center">
                            <span className="text-xl font-bold text-magenta group-hover:text-white mb-1">REGISTER</span>
                            <span className="text-[10px] text-gray-500">NEW_ENTITY // TICKET_REQUIRED</span>
                        </button>
                    </div>
                )}

                {mode === 'LOGIN' && (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4 animate-fadeIn">
                        <h3 className="text-lg text-cyan font-bold text-center mb-2">IDENTITY_VERIFICATION</h3>
                        <Input type="text" placeholder="EMAIL_OR_USERNAME" value={loginId} onChange={setLoginId} />
                        <Input type="password" placeholder="PASSWORD" value={password} onChange={setPassword} />
                        <Button label="ACCESS_MAINFRAME" disabled={status === 'LOADING'} />
                        <BackBtn onClick={() => { setMsg(''); setStatus(''); setMode('SELECT'); }} />
                    </form>
                )}

                {mode === 'REGISTER_EMAIL' && (
                    <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 animate-fadeIn">
                        <h3 className="text-lg text-magenta font-bold text-center mb-2">INIT_REGISTRATION</h3>
                        <p className="text-xs text-gray-400 text-center mb-2">STEP 1: ESTABLISH COMMS</p>
                        <Input type="email" placeholder="ENTER_EMAIL_ADDRES" value={email} onChange={setEmail} />
                        <Button label="SEND_GHOST_CODE" color="magenta" disabled={status === 'LOADING'} />
                        <BackBtn onClick={() => { setMsg(''); setStatus(''); setMode('SELECT'); }} />
                    </form>
                )}

                {mode === 'REGISTER_OTP' && (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 animate-fadeIn">
                        <h3 className="text-lg text-magenta font-bold text-center mb-2">VERIFY_UPLINK</h3>
                        <p className="text-xs text-gray-400 text-center mb-2">STEP 2: CONFIRM OWNERSHIP</p>
                        <Input type="text" placeholder="ENTER_6_DIGIT_CODE" value={otp} onChange={setOtp} />
                        <Button label="VERIFY_CODE" color="magenta" disabled={status === 'LOADING'} />
                    </form>
                )}

                {mode === 'REGISTER_PROFILE' && (
                    <form onSubmit={handleRegisterProfile} className="flex flex-col gap-4 animate-fadeIn">
                        <h3 className="text-lg text-cyan font-bold text-center mb-2">CREATE_PERSONA</h3>
                        <p className="text-xs text-gray-400 text-center mb-2">STEP 3: SECURE CREDENTIALS</p>
                        <Input type="text" placeholder="CHOOSE_USERNAME (HACKER_ID)" value={hackerId} onChange={setHackerId} />
                        <Input type="password" placeholder="SET_PASSWORD" value={password} onChange={setPassword} />
                        <Button label="SAVE_PROFILE" disabled={status === 'LOADING'} />
                    </form>
                )}

                {mode === 'REGISTER_TICKET' && (
                    <form onSubmit={handleClaimTicket} className="flex flex-col gap-4 animate-fadeIn">
                        <h3 className="text-lg text-yellow-500 font-bold text-center mb-2">FINAL_CLEARANCE</h3>
                        <p className="text-xs text-gray-400 text-center mb-2">STEP 4: PRESENT TICKET</p>
                        <Input type="text" placeholder="ENTER_INVITE_TICKET" value={ticket} onChange={setTicket} />
                        <Button label="PUNCH_TICKET" color="yellow-500" disabled={status === 'LOADING'} />
                    </form>
                )}

                {/* STATUS MESSAGE */}
                {msg && (
                    <div className={`mt-6 text-center font-mono text-xs p-2 border ${status === 'ERROR' ? 'border-red-500 text-red-500 bg-red-900/10' : 'border-gray-500 text-gray-400'}`}>
                        {msg}
                    </div>
                )}
            </div>
        </div>
    );
}
