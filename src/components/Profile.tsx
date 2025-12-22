import { useState } from 'react';
import { UserProfile } from '../App';
import { ProfileForm } from './ProfileForm';

interface ProfileProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
  onShowOnboarding?: () => void;
}

export function Profile({ user, onUpdate, onShowOnboarding }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedProfile: UserProfile & { bio?: string }) => {
    onUpdate(updatedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <ProfileForm 
      user={user} 
      onSave={handleSave}
      onCancel={handleCancel}
      isFirstTime={false}
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onShowOnboarding={onShowOnboarding}
    />
  );
}
