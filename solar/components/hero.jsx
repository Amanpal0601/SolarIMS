"use client"


import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import Image from 'next/image'

const HeroSection = () => {

  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <section className='pb-20 px-4'>
      <div className="container mx-auto text-center" >
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title">
          Monitor Your Pv System <br /> with Intelligence
        </h1>

        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered solar energy monitoring platform that helps you track, analyze, and predict your PV system performance with real-time sensor insights.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 fill-mode-both">
          <Link href="/dashboard">
            <Button size="lg" className="px-10 py-6 text-lg rounded-full shadow-blue-500/25">
              Get Started
            </Button>
          </Link>
          <Link target="_blank" rel="noopener noreferrer" href="https://drive.google.com/file/d/17G6o8sdFHGTyC8nmov2dVyvpW-MmnoJN/view?usp=drive_link">
            <Button size="lg" variant="outline" className="px-10 py-6 text-lg rounded-full">
              Project Idea Reference
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper mt-12 md:mt-16 pb-12 w-full md:w-[70%] mx-auto px-4 md:px-0">
          <div ref={imageRef} className="hero-image w-full mx-auto">
            <Image
              src="/Pv-Banner-New.png"
              width={1200}
              height={675}
              alt="Solar Performance Dashboard"
              className="w-full h-auto max-h-[400px] md:max-h-[500px] object-cover rounded-2xl shadow-2xl border border-gray-200 mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
