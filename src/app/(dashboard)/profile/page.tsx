"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  Star,
  MapPin,
  Clock,
  Award,
  Edit,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const roleBadgeVariant: Record<string, "default" | "secondary" | "destructive"> =
  {
    ADMIN: "destructive",
    TECHNICIAN: "secondary",
    CUSTOMER: "default",
  };

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center py-20"
      >
        <p className="text-muted-foreground">No user data available.</p>
      </motion.div>
    );
  }

  const isTechnician = user.role === "TECHNICIAN";
  const profile = user.technicianProfile;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Your account information
        </p>
      </motion.div>

      {/* Basic Info Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </span>
                {user.name}
              </CardTitle>
              <CardDescription>
                {isTechnician ? "Technician Account" : "Account Details"}
              </CardDescription>
            </div>
            <Badge variant={roleBadgeVariant[user.role] || "default"}>
              {user.role}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="truncate text-sm font-medium">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="truncate text-sm font-medium">
                    {user.phone || "—"}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <BadgeCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium">{user.role}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <Calendar className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Technician Profile Card */}
      {isTechnician && profile && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Professional Details
                </CardTitle>
                <CardDescription>
                  Your technician profile information
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              {profile.bio && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Experience */}
                {profile.experience !== undefined && profile.experience !== null && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Experience
                      </p>
                      <p className="text-sm font-medium">
                        {profile.experience} year
                        {profile.experience !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Hourly Rate */}
                {profile.hourlyRate !== undefined && profile.hourlyRate !== null && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                    <BadgeCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Hourly Rate
                      </p>
                      <p className="text-sm font-medium">
                        ৳{profile.hourlyRate}/hr
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Location */}
              {profile.location && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">{profile.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button asChild className="gap-2">
                <Link href="/technician/profile">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
