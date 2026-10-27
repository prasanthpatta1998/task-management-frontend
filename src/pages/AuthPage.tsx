import { useState } from "react";
import type { FormEvent } from "react";
import { confirmResetPassword, confirmSignUp, fetchUserAttributes, getCurrentUser, resetPassword, signIn, signUp } from "aws-amplify/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../app/context";
import { isCognitoConfigured } from "../lib/cognito";

type AuthRoute = "login" | "signup" | "forgot" | "confirm" | "reset-password";

function routeToView(pathname: string): AuthRoute {
  const route = pathname.split("/").filter(Boolean)[0];
  if (route === "signup" || route === "forgot" || route === "confirm" || route === "reset-password") return route;
  return "login";
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, showNotice } = useAppContext();
  const view = routeToView(location.pathname);
  const confirmationEmail = (location.state as { email?: string } | null)?.email ?? "";
  const [authBusy, setAuthBusy] = useState(false);

  function goTo(route: AuthRoute, email?: string) {
    navigate(`/${route}`, { state: email ? { email } : undefined });
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isCognitoConfigured) {
      showNotice("Cognito is not configured. Set the User Pool ID and App Client ID in frontend .env.");
      return;
    }
    if (authBusy) return;
    setAuthBusy(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || confirmationEmail).trim().toLowerCase();
    const password = String(data.get("password") || "");
    try {
      if (view === "confirm") {
        await confirmSignUp({ username: confirmationEmail, confirmationCode: String(data.get("code") || "").trim() });
        showNotice("Email confirmed. Sign in with your email and password.");
        goTo("login");
        return;
      }
      if (view === "reset-password") {
        await confirmResetPassword({
          username: confirmationEmail,
          confirmationCode: String(data.get("code") || "").trim(),
          newPassword: String(data.get("newPassword") || ""),
        });
        showNotice("Password reset successfully. Sign in with your new password.");
        goTo("login");
        return;
      }
      if (view === "forgot") {
        const result = await resetPassword({ username: email });
        if (result.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
          goTo("reset-password", email);
          showNotice("Password reset code sent. Check your email.");
        } else {
          showNotice("Follow the password reset instructions shown by your account provider.");
        }
        return;
      }
      if (view === "signup") {
        const name = String(data.get("name") || "").trim();
        const result = await signUp({
          username: email,
          password,
          options: { userAttributes: { email, name } },
        });
        if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
          goTo("confirm", email);
          showNotice("Verification code sent. Check your email to confirm the account.");
        } else {
          goTo("login");
          showNotice("Account created. Sign in to continue.");
        }
        return;
      }

      const result = await signIn({ username: email, password });
      if (!result.isSignedIn) {
        showNotice(`Additional sign-in step required: ${result.nextStep.signInStep}. Configure MFA/challenges in Cognito to complete it.`);
        return;
      }
      const currentUser = await getCurrentUser();
      const attributes = await fetchUserAttributes().catch(() => ({ email: "", name: "" }));
      setUser({
        email: attributes.email || email,
        name: attributes.name || email.split("@")[0] || currentUser.username,
      });
      navigate("/dashboard", { replace: true });
      showNotice("Signed in successfully.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-decoration">
        <div className="brand brand-light"><span className="brand-mark">s</span> stride</div>
        <div className="auth-art">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-card art-card-main"><span className="art-check">✓</span><div><b>Launch website refresh</b><small>Website redesign · Today</small></div><span className="art-pill">Done</span></div>
          <div className="art-card art-card-small"><span className="mini-avatar">AM</span><div><b>Team sync</b><small>10:30 AM · 4 people</small></div></div>
          <div className="art-spark">✦</div>
        </div>
        <div className="auth-quote"><h2>Make room for<br />meaningful work.</h2><p>Bring your projects, people, and plans together in one calm workspace.</p><div className="quote-dots"><i /><i /><i /></div></div>
        <span className="auth-footnote">A little more focus. A lot more flow.</span>
      </div>
      <main className="auth-main">
        <div className="mobile-brand brand"><span className="brand-mark">s</span> stride</div>
        <div className="auth-form-wrap">
          {!isCognitoConfigured && <p className="auth-config-warning">Authentication is not configured yet. Set the Cognito values in your local .env file.</p>}
          {view === "login" && <>
            <div className="eyebrow">WELCOME BACK</div><h1>Sign in to your workspace</h1><p className="muted auth-subtitle">Pick up where you left off.</p>
            <form onSubmit={handleAuth} className="form-stack">
              <label>Email address<input name="email" type="email" placeholder="you@company.com" required /></label>
              <label>Password<div className="password-field"><input name="password" type="password" placeholder="Enter your password" required minLength={8} /><span className="lock-icon">●</span></div></label>
              <div className="form-inline"><label className="check-label"><input type="checkbox" defaultChecked /> Remember me</label><button type="button" className="text-button" onClick={() => goTo("forgot")}>Forgot password?</button></div>
              <button className="primary-button full-button" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : "Sign in"} <span>→</span></button>
            </form>
            <div className="auth-divider"><span />or continue with<span /></div>
            <button className="secondary-button full-button" onClick={() => showNotice("Google sign-in is not configured. Use email and password for this Cognito user pool.")}><span className="google-g">G</span> Continue with Google</button>
            <p className="auth-switch">New to Stride? <button className="text-button" onClick={() => goTo("signup")}>Create an account</button></p>
          </>}
          {view === "signup" && <>
            <div className="eyebrow">GET STARTED</div><h1>Create your account</h1><p className="muted auth-subtitle">Your team's next chapter starts here.</p>
            <form onSubmit={handleAuth} className="form-stack">
              <label>Full name<input name="name" placeholder="Alex Morgan" required /></label>
              <label>Work email<input name="email" type="email" placeholder="you@company.com" required /></label>
              <label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength={8} required /></label>
              <label className="check-label terms"><input type="checkbox" required /> I agree to the demo terms and privacy notice.</label>
              <button className="primary-button full-button" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : "Create account"} <span>→</span></button>
            </form>
            <p className="auth-switch">Already have an account? <button className="text-button" onClick={() => goTo("login")}>Sign in</button></p>
          </>}
          {view === "forgot" && <>
            <button className="back-button" onClick={() => goTo("login")}>← Back to sign in</button>
            <div className="eyebrow">ACCOUNT RECOVERY</div><h1>Reset your password</h1><p className="muted auth-subtitle">Enter your account email and Cognito will send a password reset code.</p>
            <form onSubmit={handleAuth} className="form-stack">
              <label>Email address<input name="email" type="email" placeholder="you@company.com" required /></label>
              <button className="primary-button full-button" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : "Send reset instructions"} <span>→</span></button>
            </form>
          </>}
          {view === "confirm" && <>
            <button className="back-button" onClick={() => goTo("signup")}>← Back</button>
            <div className="eyebrow">VERIFY YOUR EMAIL</div><h1>Enter your verification code</h1>
            <p className="muted auth-subtitle">We sent a code to {confirmationEmail}. Enter it to activate your account.</p>
            <form onSubmit={handleAuth} className="form-stack">
              <label>Verification code<input name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" required /></label>
              <button className="primary-button full-button" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : "Confirm account"} <span>→</span></button>
            </form>
          </>}
          {view === "reset-password" && <>
            <button className="back-button" onClick={() => goTo("login")}>← Back to sign in</button>
            <div className="eyebrow">ACCOUNT RECOVERY</div><h1>Choose a new password</h1>
            <p className="muted auth-subtitle">Enter the reset code sent to {confirmationEmail} and choose a new password.</p>
            <form onSubmit={handleAuth} className="form-stack">
              <label>Reset code<input name="code" inputMode="numeric" autoComplete="one-time-code" required /></label>
              <label>New password<input name="newPassword" type="password" minLength={8} autoComplete="new-password" required /></label>
              <button className="primary-button full-button" type="submit" disabled={authBusy}>{authBusy ? "Please wait…" : "Reset password"} <span>→</span></button>
            </form>
          </>}
        </div>
        <div className="auth-legal">© 2026 Stride Workspace <span>Privacy</span><span>Terms</span></div>
      </main>
    </div>
  );
}
