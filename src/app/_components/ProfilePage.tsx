"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState(session?.user.name ?? "");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [loadedProfile, setLoadedProfile] = useState(false);

  const { data: profile, refetch: refetchProfile } =
    api.user.getProfile.useQuery();

  useEffect(() => {
    if (profile && !loadedProfile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setLoadedProfile(true);
    }
  }, [profile, loadedProfile]);

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      refetchProfile();
      updateSession();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { isNameValid, isEmailValid, isFormValid } = useMemo(() => {
    const isNameValid = /^[a-zA-Z\s]{2,}$/.test(name.trim());
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return {
      isNameValid,
      isEmailValid,
      isFormValid: isNameValid && isEmailValid,
    };
  }, [name, email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      updateProfile.mutate({ name, email });
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-lg p-4">
      <h1 className="mb-6 text-center text-3xl font-bold">Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
            placeholder="Enter your name"
          />
          {name && !isNameValid && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid name (at least 2 characters, letters only)
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="Enter your email"
          />
          {email && !isEmailValid && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid email address
            </p>
          )}
        </div>
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={updateProfile.isPending || !isFormValid}
          >
            {updateProfile.isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
