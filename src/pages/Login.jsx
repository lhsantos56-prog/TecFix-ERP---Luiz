import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Wrench, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

/**
 * Tela de Login — TecFix ERP
 */
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Informe seu e-mail.'); return; }
    if (!password) { setError('Informe sua senha.'); return; }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      // AuthContext detecta a sessão via onAuthStateChange — App re-renderiza automaticamente
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setError('E-mail ou senha incorretos.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.');
      } else {
        setError(msg || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Gradient decorativo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(ellipse 70% 60% at 20% 20%, rgba(34,211,238,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 50% 50% at 80% 80%, rgba(99,102,241,0.07) 0%, transparent 60%)
        `,
      }} />

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-modal)',
        padding: '40px 36px',
        position: 'relative',
        backdropFilter: 'blur(12px)',
        animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, var(--color-accent), #6366f1)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(34,211,238,0.3)',
          }}>
            <Wrench size={28} color="#0a0f1e" />
          </div>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.03em', margin: 0,
          }}>TecFix</h1>
          <p style={{
            fontSize: '0.82rem', color: 'var(--color-text-muted)',
            marginTop: '4px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>ERP Sistema</p>
        </div>

        <p style={{
          fontSize: '0.9rem', color: 'var(--color-text-secondary)',
          textAlign: 'center', marginBottom: '28px',
        }}>
          Faça login para acessar o sistema
        </p>

        {/* Erro */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 14px', borderRadius: '10px',
            background: 'var(--color-cancelada-bg)',
            border: '1px solid var(--color-cancelada-border)',
            color: 'var(--color-cancelada)',
            fontSize: '0.85rem', marginBottom: '20px',
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* E-mail */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="login-email" className="form-label">
              <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={loading}
              style={{ fontSize: '0.95rem', padding: '12px 14px' }}
            />
          </div>

          {/* Senha */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="login-password" className="form-label">
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                style={{ fontSize: '0.95rem', padding: '12px 42px 12px 14px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', padding: '2px',
                  display: 'flex', alignItems: 'center',
                }}
                aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: '0.95rem' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: '16px', height: '16px' }} />Entrando...</>
            ) : (
              <><LogIn size={17} />Entrar</>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '24px',
          fontSize: '0.75rem', color: 'var(--color-text-muted)',
        }}>
          Problemas de acesso? Fale com o Administrador.
        </p>
      </div>
    </div>
  );
}

export default Login;
