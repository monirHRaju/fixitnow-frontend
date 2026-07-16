"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { technicianApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function TechnicianProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.technicianProfile) {
      const p = user.technicianProfile;
      setBio(p.bio || "");
      setSkillsInput(p.skills?.join(", ") || "");
      setExperience(p.experience || 0);
      setHourlyRate(p.hourlyRate || 0);
      setLocation(p.location || "");
    }
    setLoading(false);
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await technicianApi.updateProfile({
        bio,
        skills,
        experience,
        hourlyRate,
        location,
      });
      if (user) {
        setUser({
          ...user,
          technicianProfile: {
            ...(user.technicianProfile || {
              id: "",
              userId: user.id,
              isAvailable: false,
              createdAt: "",
              updatedAt: "",
            }),
            bio,
            skills,
            experience,
            hourlyRate,
            location,
          },
        });
      }
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update your professional information
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell clients about yourself and your experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  placeholder="e.g. Plumbing, Electrical, Painting"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate skills with commas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Experience (years)
                  </Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">
                    Hourly Rate (BDT)
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min={0}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
