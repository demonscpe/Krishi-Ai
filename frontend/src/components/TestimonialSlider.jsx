import { useEffect, useState, useMemo } from 'react';
import farmer1 from "../assets/testimonials/farmer1.jpg";
import farmer2 from "../assets/testimonials/farmer2.jpg";
import farmer3 from "../assets/testimonials/farmer3.jpg";
import farmer4 from "../assets/testimonials/farmer4.jpg";
import farmer5 from "../assets/testimonials/farmer5.jpg";
import farmer6 from "../assets/testimonials/farmer6.jpg";
import farmer7 from "../assets/testimonials/farmer7.jpg";

const TestimonialSlider = () => {
  const [active, setActive] = useState(0); 
  const [isPaused, setIsPaused] = useState(false);

  const items = useMemo(() => [
    { img: farmer1, stars: "★★★★★", text: "Krishi-AI helped me improve crop yield and reduce fertilizer waste.", name: "Ramesh Reddy", jobTitle: "Farmer", location: "Anantapur, Andhra Pradesh", badge: "Verified Farmer" },
    { img: farmer2, stars: "★★★★★", text: "Pest prediction saved my crops this season.", name: "Lakshmi Devi", jobTitle: "Farmer", location: "Kurnool, Andhra Pradesh", badge: "Verified Farmer" },
    { img: farmer3, stars: "★★★★", text: "Very useful for irrigation planning.", name: "Suresh Naidu", jobTitle: "Farmer", location: "Kadapa, Andhra Pradesh", badge: "Verified Farmer" },
    { img: farmer4, stars: "★★★★★", text: "Soil analysis improved my farming decisions.", name: "Anil Kumar", jobTitle: "Farmer", location: "Chittoor, Andhra Pradesh", badge: "Verified Farmer" },
    { img: farmer5, stars: "★★★★★", text: "Weather prediction is very accurate.", name: "Ravi Teja", jobTitle: "Farmer", location: "Nellore, Andhra Pradesh", badge: "Verified Farmer" },
    { img: farmer6, stars: "★★★★", text: "Reduced crop loss using AI insights.", name: "Mahesh", jobTitle: "Farmer", location: "Guntur, Andhra Pradesh", badge: "Verified Farmer" },
    { img: farmer7, stars: "★★★★★", text: "Best tool for smart farming.", name: "Prasad Reddy", jobTitle: "Farmer", location: "Vijayawada, Andhra Pradesh", badge: "Verified Farmer" }
  ], []);
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused, items.length]);

  const getStyles = (index) => {
    let diff = index - active;
    if (index < active && active - index > items.length / 2) diff += items.length;
    if (index > active && index - active > items.length / 2) diff -= items.length;
    const absDiff = Math.abs(diff);
    if (absDiff > 2) {
      return {
        opacity: 0,
        transform: `translateX(${diff > 0 ? 200 : -200}px) scale(0)`,
        zIndex: 0,
        pointerEvents: 'none'
      };
    }
    return {
      transform: `translateX(${diff * 160}px) scale(${1 - 0.25 * absDiff})`,
      zIndex: 10 - absDiff,
      opacity: absDiff === 0 ? 1 : 0.4,
      filter: absDiff === 0 ? 'none' : 'blur(2px)',
      transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };
  return (
    <section className="py-20 bg-white font-poppins overflow-hidden">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Testimonials</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">User Success Stories</h2>
        <div className="h-1 w-16 bg-green-600 mx-auto rounded-full" />
      </div>
      <div 
        className="relative w-full h-[420px] sm:h-[450px] flex justify-center items-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="absolute w-[320px] h-[400px] bg-white rounded-[2rem] p-8 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 cursor-pointer select-none"
            style={{
              ...getStyles(index),
              left: '50%',
              marginLeft: '-160px',
            }}
            onClick={() => setActive(index)}
          >
            <div className="relative mb-6">
              <img
                key={`img-${index}`} 
                src={item.img}
                alt={item.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="absolute bottom-1 right-1 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center border-4 border-white">
                <span className="text-[10px]">✔</span>
              </div>
            </div>
            <div className="text-amber-400 text-xl mb-2 tracking-widest">
              {item.stars}
            </div>
            <p className="text-center text-slate-500 text-base italic leading-relaxed mb-6 px-2">
              "{item.text}"
            </p>
            <div className="mt-auto text-center">
              <h4 className="text-lg font-bold text-slate-800">{item.name}</h4>
              <p className="text-green-600 text-xs font-bold uppercase tracking-widest mt-1">
                {item.jobTitle}
              </p>
              <p className="text-slate-400 text-[11px] mt-1">{item.location}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3 mt-10">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`transition-all duration-100 rounded-full ${
              active === i ? "w-10 h-2 bg-green-600" : "w-2 h-2 bg-slate-200"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialSlider;