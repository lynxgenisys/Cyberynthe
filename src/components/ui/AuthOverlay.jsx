import React, { useState } from 'react';
import { signInWithOtp, verifyOtp, updateProfile, claimInvite, supabase } from '../../utils/supabase';
import './AuthOverlay.css';

/**
 * AUTH OVERLAY
 * Handles the "Invite Only" access flow.
 * Steps: Email -> OTP Code -> Hacker ID Creation
 */
export default function AuthOverlay({ onComplete }) {
    const [step, setStep] = useState('EMAIL'); // EMAIL, OTP, TICKET, PROFILE
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [ticket, setTicket] = useState('');
    const [hackerId, setHackerId] = useState('');
    const [password, setPassword] = useState(''); // Note: Supabase OTP logs them in, password is extra? 
    // User requested password, but OTP is passwordless. 
    // We'll treat "Password" as a mandatory UpdatePassword step if desired, 
    // or just skip it since OTP is secure. 
    // *Correction*: User asked t create a password. We'll add a database update for it via auth.updateUser.

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. SEND EMAIL
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await signInWithOtp(email);
        setLoading(false);

        if (res.success) {
            setStep('OTP');
        } else {
            setError(res.error);
        }
    };

    // 2. VERIFY CODE
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await verifyOtp(email, otp);

        if (res.success) {
            setLoading(false);
            setStep('TICKET');
        } else {
            setError(res.error);
            setLoading(false);
        }
    };

    // 3. CLAIM GOLDEN TICKET
    const handleClaimTicket = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = await claimInvite(ticket);
        setLoading(false);

        if (res.success) {
            setStep('PROFILE');
        } else {
            setError("ACCESS DENIED: " + res.error);
        }
    };

    // 3. CREATE PROFILE (Hacker ID + Password)
    const handleCreateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            setError("Session lost. Please restart.");
            return;
        }

        // A. Update Password (Optional but requested)
        if (password) {
            const { error: pwdError } = await supabase.auth.updateUser({ password: password });
            if (pwdError) {
                setError("Password weakness: " + pwdError.message);
                setLoading(false);
                return;
            }
        }

        // B. Create Profile Entry
        const res = await updateProfile(user.id, hackerId);
        setLoading(false);

        if (res.success) {
            onComplete(hackerId);
        } else {
            setError("ID Creation Failed: " + res.error);
        }
    };

    return (
        <div className="auth-overlay">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="cyan-glow">SECURE_UPLINK</div>
                    <div className="auth-subtitle">IDENTITY_VERIFICATION_REQUIRED</div>
                </div>

                {error && <div className="auth-error">error: {error}</div>}

                {step === 'EMAIL' && (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <div className="auth-label">ENTER_VIRTUAL_ADDRESS:</div>
                        <input
                            type="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ghost@net.work"
                            required
                        />
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'TRANSMITTING...' : 'REQUEST_UNLOCK_CODE'}
                        </button>
                    </form>
                )}

                {step === 'OTP' && (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <div className="auth-label">ENTER_UNLOCK_SEQUENCE:</div>
                        <div className="auth-sublabel">Code sent to {email}</div>
                        <input
                            type="text"
                            className="auth-input"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            required
                        />
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'DECRYPTING...' : 'VERIFY_IDENTITY'}
                        </button>
                        <div className="auth-back" onClick={() => setStep('EMAIL')}>[ RESEND_SIGNAL ]</div>
                    </form>
                )}

                {step === 'TICKET' && (
                    <form onSubmit={handleClaimTicket} className="auth-form">
                        <div className="auth-label">GOLDEN_TICKET_REQUIRED:</div>
                        <div className="auth-sublabel">INVITE_ONLY_ACCESS</div>
                        <input
                            type="text"
                            className="auth-input"
                            value={ticket}
                            onChange={(e) => setTicket(e.target.value)}
                            placeholder="TICKET_KEY"
                            required
                        />
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'VALIDATING...' : 'CLAIM_ACCESS'}
                        </button>
                    </form>
                )}

                {step === 'PROFILE' && (
                    <form onSubmit={handleCreateProfile} className="auth-form">
                        <div className="auth-label">INITIALIZE_OPERATOR:</div>

                        <div className="input-group">
                            <label>HACKER_ID</label>
                            <input
                                type="text"
                                className="auth-input"
                                value={hackerId}
                                onChange={(e) => setHackerId(e.target.value.toUpperCase())}
                                placeholder="ZERO_COOL"
                                maxLength={15}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>SET_ACCESS_KEY (PASSWORD)</label>
                            <input
                                type="password"
                                className="auth-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                minLength={6}
                                required
                            />
                        </div>

                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'WRITING_TO_LEDGER...' : 'FINALIZE_UPLINK'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
