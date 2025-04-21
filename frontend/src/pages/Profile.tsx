import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../profile.css'; 

type UserProfileData = {
  username: string;
  win_count: number;
  loss_count: number;
  total_bomb_count: number;
  total_shield_count: number;
};

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>(); // Retrieve userId from URL
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`); // Fetch user profile data
        const data = await response.json();
        setUserProfile(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!userProfile) {
    return <div>User profile not found.</div>;
  }

  return (
    <div>
      <h1>{userProfile.username}'s Profile</h1>
      <p>Wins: {userProfile.win_count}</p>
      <p>Losses: {userProfile.loss_count}</p>
      <p>Total Bombs Used: {userProfile.total_bomb_count}</p>
      <p>Total Shields Used: {userProfile.total_shield_count}</p>
    </div>
  );
};

export default UserProfile;




