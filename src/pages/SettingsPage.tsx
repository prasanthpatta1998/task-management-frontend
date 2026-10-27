import type { FormEvent } from "react";
import { useAppContext } from "../app/context";

export function SettingsPage() {
  const { user, updateProfile, showNotice } = useAppContext();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateProfile({
      name: String(data.get("name") || user?.name || ""),
      email: String(data.get("email") || user?.email || ""),
    });
  }

  return (
    <div className="page-content">
      <div className="welcome-row"><div><div className="eyebrow">MAKE IT YOURS</div><h1>Settings</h1><p className="muted">Manage your profile and workspace preferences.</p></div></div>
      <div className="settings-layout">
        <section className="panel settings-menu">
          <button className="settings-option active">♙ <span><b>Profile</b><small>Your personal information</small></span></button>
          <button className="settings-option" onClick={() => showNotice("Notification preferences are not connected yet")}>♧ <span><b>Notifications</b><small>Choose what you hear about</small></span></button>
          <button className="settings-option" onClick={() => showNotice("Security settings are managed by your sign-in provider")}>♢ <span><b>Security</b><small>Password and account security</small></span></button>
          <button className="settings-option" onClick={() => showNotice("Workspace settings are demo-only")}>⚙ <span><b>Workspace</b><small>Manage your team space</small></span></button>
        </section>
        <section className="panel settings-form">
          <div className="panel-heading"><div><h2>Profile information</h2><p className="muted">Update the details displayed in your workspace.</p></div></div>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="profile-edit-row"><div className="avatar avatar-violet large-avatar">{user?.name.slice(0, 2).toUpperCase() || "ME"}</div><div><b>Profile photo</b><p className="muted">Avatar upload is not available in this demo.</p></div></div>
            <label>Full name<input name="name" defaultValue={user?.name} required /></label>
            <label>Email address<input name="email" type="email" defaultValue={user?.email} required /></label>
            <label>Role<input name="role" defaultValue="Product designer" /></label>
            <div className="settings-actions"><button type="button" className="secondary-button" onClick={() => showNotice("No changes saved")}>Cancel</button><button type="submit" className="primary-button">Save changes</button></div>
          </form>
        </section>
      </div>
    </div>
  );
}
