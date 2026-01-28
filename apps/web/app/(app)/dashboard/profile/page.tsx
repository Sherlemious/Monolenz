import Link from 'next/link';

export default function ProfilePage() {
  return (
    <header>
      <div>
        <h1>My Profile</h1>
        <p>Your professional identity across all platforms</p>
      </div>

      <Link href='/dashboard/profile/edit'>
        Edit Profile
      </Link>
    </header>
  );
}
