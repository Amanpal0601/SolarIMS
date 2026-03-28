import React from 'react'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { LayoutDashboard, TrendingUp } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'
const Header =  async () => {
  try {
    await checkUser();
  } catch (e) {
    console.error("Header checkUser failed:", e.message);
  }
  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">

      <nav className="container mx-auto px-4 py-4 flex items-center justify-between ">
        <Link href="/">
        <Image src={"/pv-logo-01.png"}
        alt="SolarIMS logo" height={60} width={200}
        className="h-20 w-auto object-contain"
        priority
        />
        </Link>
      <div  className='flex items-center space-x-4'>

        <SignedIn>
          <Link href={"/dashboard"}
          className="text-gray-600 hover:text-blue-600 flex item-center gap-2">
          <Button variant="outline">
            <LayoutDashboard size={18}/>
            <span className="hidden md:inline">Dashboard</span>
          </Button>
          </Link>
          <Link href={"/prediction"}
          className="flex item-center gap-2">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <TrendingUp size={18}/>
              <span className='hidden md:inline'>Prediction</span>
            </Button>
          </Link >
        </SignedIn>
      <SignedOut>
        <SignInButton forceRedirectUrl="/dashboard">
        <Button variant ="outline"> Login </Button>
        </SignInButton>
        </SignedOut>
        {/* Show the user button when the user is signed in */}
        <SignedIn>
          <UserButton appearance={{
            elements:{
              avatarBox:"w-10 h-10"
            }
          }} />
        </SignedIn>
        </div>
      </nav>
    </div>

  )
}

export default Header
