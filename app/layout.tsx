import type {Metadata} from 'next';
import { Sora, Inter } from 'next/font/google';
import './globals.css';

const sora = Sora({ 
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-sora',
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ChatGPT Prompts – 100% Free | chatgpt-prompts.com',
  description: 'Over 1,000 ChatGPT Prompts that actually work. Copy instantly. No login. Professional prompts for marketing, sales, email, and SEO.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased text-text-primary overflow-x-hidden min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
