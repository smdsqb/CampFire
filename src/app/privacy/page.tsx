export const dynamic = 'force-dynamic'

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh touch-scroll safe-top" style={{ background: '#0D0B09', color: '#F5EFE8', padding: '40px', fontFamily: 'sans-serif', maxWidth: 700, margin: '0 auto' }}>
      <h1 style={{ color: '#F97316', marginBottom: 24 }}>🔥 CampFire Privacy Policy</h1>
      <p style={{ color: '#A89880', marginBottom: 16 }}>Last updated: March 2026</p>
      <h2 style={{ marginBottom: 12 }}>What we collect</h2>
      <p style={{ color: '#A89880', marginBottom: 16 }}>We collect your name, email address and profile picture when you sign in with Google.</p>
      <h2 style={{ marginBottom: 12 }}>How we use it</h2>
      <p style={{ color: '#A89880', marginBottom: 16 }}>We use your information to create and manage your CampFire account and to display your name on posts and comments.</p>
      <h2 style={{ marginBottom: 12 }}>Third parties</h2>
      <p style={{ color: '#A89880', marginBottom: 16 }}>We use Supabase for authentication and data storage. We do not sell your data to anyone.</p>
      <h2 style={{ marginBottom: 12 }}>Contact</h2>
      <p style={{ color: '#A89880' }}>For any questions email us at your email address.</p>
    </div>
  )
}
