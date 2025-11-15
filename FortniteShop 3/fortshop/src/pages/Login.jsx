import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

function LoginPage() {

    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigate();

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        setAuthError('');
        setIsLoading(true);
        
        try {
            const authData = await login(userEmail, userPassword);
            localStorage.setItem('token', authData.token);
            localStorage.setItem('user', JSON.stringify(authData.user));
            navigation('/');
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-content">
            <div className="card login-card">
                <h2>Вход в систему</h2>
                
                {authError && (
                    <p className="error-message">{authError}</p>
                )}
                
                <form onSubmit={handleLoginSubmit}>
                    <input
                        type="email"
                        placeholder="Ваш email"
                        value={userEmail}
                        onChange={e => setUserEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="auth-input"
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={userPassword}
                        onChange={e => setUserPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="auth-input"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="cta-button login-button"
                    >
                        {isLoading ? 'Вход...' : 'Войти в систему'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;