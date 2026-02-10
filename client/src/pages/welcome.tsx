import { Link } from "wouter";
import { PageTransition, NeonButton } from "@/components/ui-components";
import introImg from "@assets/New_Bitmap_Image_1770752351617.bmp";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <PageTransition>
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-black rounded-2xl p-2 border border-white/10 overflow-hidden">
              <img 
                src={introImg} 
                alt="Spy Game Welcome" 
                className="w-full h-auto rounded-xl filter contrast-125 brightness-110"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-white neon-text uppercase italic">
              Welcome Agent
            </h1>
            <p className="text-gray-400 font-medium leading-relaxed">
              Prepare for the ultimate mission of deception. <br/>
              Can you find the spy before it's too late?
            </p>
          </div>

          <div className="pt-6">
            <Link href="/login">
              <NeonButton className="w-full h-16 text-xl shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
                GET STARTED
              </NeonButton>
            </Link>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
