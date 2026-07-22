import { Link } from "react-router-dom";
import about from '../assets/about.png';

function About() {
  return (
    <div className="w-full py-12 px-4 bg-gradient-to-b from-green-50 to-green-100 font-poppins">
      
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        
        {/* Image Section */}
        <div className="relative order-2 md:order-1 flex justify-center">
          <img 
            className="w-[300px] sm:w-[400px] md:w-[450px] rounded-xl shadow-lg transition duration-300 hover:scale-105" 
            src={about} 
            alt="About Us" 
          />
        </div>

        {/* Text Section */}
        <div className="flex flex-col justify-center text-center md:text-left order-1 md:order-2">
          
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2 font-roboto">About Us</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3">
            About Krishi-Ai
          </h2>
          <div className="h-1 w-16 bg-green-600 mx-auto rounded-full mb-6" />

          {/* Mission Card */}
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-600 mb-4">
            <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
              🌟 Our Mission
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              We empower farmers with AI-driven solutions to improve yield and reduce waste.
            </p>
          </div>

          {/* How It Works Card */}
          <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-emerald-600 mb-6">
            <h3 className="text-lg font-semibold text-emerald-700 mb-2 flex items-center gap-2">
              🤔 How it Works
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✔</span>
                <span>Crop prediction using ML models</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✔</span>
                <span>Better decisions on crop & pest control</span>
              </li>
            </ul>
          </div>

          {/* Button */}
          <Link
            to="/products"
            className="inline-block px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-800 rounded-full shadow-md hover:shadow-lg transition duration-300 md:w-fit"
          >
            Explore Now
          </Link>

        </div>
      </div>
    </div>
  );
}

export default About;