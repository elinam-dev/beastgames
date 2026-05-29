import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'MR BEAST GAMES AFRICA WAITLIST — Register for the Biggest Game Show in Africa',
  description: 'Register now for a chance to be considered for MR BEAST GAMES AFRICA. Join the official waitlist, unlock priority access by sharing with friends, and get a shot at life-changing prizes.',
  keywords: 'Mr Beast Games Africa, Beast Games Africa, Waitlist, Game Show, Africa, Registration, MrBeast Africa',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://gaming-africa-hub.preview.emergentagent.com'),
  openGraph: {
    title: 'MR BEAST GAMES AFRICA WAITLIST',
    description: 'Register now for a chance to be considered. Join the biggest game show coming to Africa.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556764420-e37ef4cdfa5c?crop=entropy&cs=srgb&fm=jpg&w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Mr Beast Games Africa Waitlist'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MR BEAST GAMES AFRICA WAITLIST',
    description: 'Register now for a chance to be considered. Join the biggest game show coming to Africa.',
    images: ['https://images.unsplash.com/photo-1556764420-e37ef4cdfa5c?crop=entropy&cs=srgb&fm=jpg&w=1200&h=630&fit=crop']
  },
  robots: { index: true, follow: true }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased selection:bg-amber-400 selection:text-black">
        {children}
        <Toaster richColors theme="dark" position="top-center" />
      </body>
    </html>
  )
}
