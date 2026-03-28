import HeroSection from "@/components/hero";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
    <div className="mt-40">
      <HeroSection/>

      {/* Stats Section */}
      <section className="py-24 bg-slate-50/50 border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((statsData,index)=>(
            <div key ={index} className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{statsData.value}</div>
            <div  className="text-gray-600">{statsData.label}</div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">
      Intelligent Features Built for Smart Solar Monitoring
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {featuresData.map((feature, index) => (
        <Card
          className="p-8 hover:shadow-2xl transition duration-500 hover:-translate-y-2 border-slate-100 bg-white"
          key={index}
        >
          <CardContent className="space-y-4 pt-4">
            {feature.icon}
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>


{/* How It Works Section */}
<section className="py-24 bg-gradient-to-b from-slate-50 to-white">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
      How SolarIMS Works
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
      {howItWorksData.map((step, index) => (
        <div key={index} className="text-center group">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:rotate-3">
            {step.icon}
          </div>
          <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
          <p className="text-gray-600">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>


{/* Testimonials Section 
<section id="testimonials" className="py-20">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-16">
      Trusted by Renewable Energy Professionals
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonialsData.map((testimonial, index) => (
        <Card key={index} className="p-6 hover:shadow-lg transition">
          <CardContent className="pt-4">
            <div className="flex items-center mb-4">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-4">
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-600">
                  {testimonial.role}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{testimonial.quote}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>
*/}


{/* CTA Section */}
<section className="py-24 bg-slate-900 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-slate-900/80 z-0"></div>
  <div className="container mx-auto px-4 text-center relative z-10">
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
      Ready to Optimize Your Solar Energy Performance?
    </h2>
    <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
      Monitor real-time solar data, predict future energy output,
      and unlock AI-powered insights with SolarIMS.
    </p>
    <Link href="/dashboard">
      <Button
        size="lg"
        className="bg-white text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-blue-900/20 text-lg px-8 py-6 rounded-xl"
      >
        Launch SolarIMS Dashboard
      </Button>
    </Link>
  </div>
</section>

    </div>
  );
}
