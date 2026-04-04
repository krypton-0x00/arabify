"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Moon, Sun, Globe, LogOut, Save, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session, update: updateSession, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useLayoutEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const currentTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(currentTheme as "light" | "dark");
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      setName(session.user.name);
    }
  }, [session, status]);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      
      if (res.ok) {
        await updateSession({ name });
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update profile" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setMessage(null);
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSaving(true);
    
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      if (res.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {message && (
        <div className={cn(
          "p-3 rounded-lg mb-4 text-sm",
          message.type === "success" ? "bg-teal/10 text-teal" : "bg-red-50 text-red-500"
        )}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gold/10">
            <User className="w-5 h-5 text-gold" />
          </div>
          <h3 className="font-semibold">Profile</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold">
              {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
            </div>
            <div>
              <p className="font-medium">{session?.user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Display Name</Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="flex-1"
              />
              <Button variant="teal" onClick={handleSaveProfile} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-teal/10">
            <Lock className="w-5 h-5 text-teal" />
          </div>
          <h3 className="font-semibold">Change Password</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button 
            variant="coral"
            onClick={handleChangePassword} 
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="gap-2"
          >
            <Lock className="w-4 h-4" />
            Change Password
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="p-6 rounded-xl border border-border bg-card mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-teal/10">
            <Settings className="w-5 h-5 text-teal" />
          </div>
          <h3 className="font-semibold">Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Choose your theme</p>
            </div>
            <div className="flex gap-1 bg-secondary rounded-lg p-1">
              <Button
                variant={theme === "light" ? "teal" : "ghost"}
                size="sm"
                onClick={() => handleThemeChange("light")}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                variant={theme === "dark" ? "teal" : "ghost"}
                size="sm"
                onClick={() => handleThemeChange("dark")}
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Button variant="destructive" onClick={handleLogout} className="gap-2">
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}