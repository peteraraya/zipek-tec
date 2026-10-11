import { techStackData, features } from "@/config/site";

export default function TechStack() {
  if (!features.enableTechStack) return null;

  return (
    <section className="py-12 border-y border-white/5 bg-background/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-widest">
          Tecnologías que dominamos
        </p>
      </div>
      
      {/* Marquee wrapper */}
      <div className="relative w-full overflow-hidden flex">
        {/* Left and Right fade masks */}
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Marquee track */}
        <div className="flex w-[200%] animate-marquee">
          {/* We duplicate the array to create a seamless loop */}
          {[...techStackData, ...techStackData, ...techStackData, ...techStackData].map((tech, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 mx-8 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            >
              <span className="text-xl md:text-2xl font-bold text-gray-300">
                {tech}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
