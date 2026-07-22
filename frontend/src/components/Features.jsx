import { RiTailwindCssFill } from "react-icons/ri";
import { MdLeaderboard } from "react-icons/md";
import { BiSolidCustomize } from "react-icons/bi";
import { FaLaptopFile } from "react-icons/fa6";

const featureData = [
  {
    icon: <RiTailwindCssFill size={26} />,
    title: "Responsive Design",
    description: "Access tools seamlessly on any device, from field-ready smartphones to desktop dashboards.",
    gradient: "bg-white", 
    textColor: "text-slate-600",
    titleColor: "text-slate-900",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-100"
  },
  {
    icon: <MdLeaderboard size={26} />,
    title: "Data-Driven Insights",
    description: "Leverage precision machine learning to optimize soil health, pest control, and yield outcomes.",
    gradient: "bg-white",
    textColor: "text-slate-600",
    titleColor: "text-slate-900",
    iconColor: "text-sky-600",
    borderColor: "border-sky-100"
  },
  {
    icon: <FaLaptopFile size={26} />,
    title: "Intuitive Workflow",
    description: "Simplified navigation designed for accessibility, regardless of your technical background.",
    gradient: "bg-white",
    textColor: "text-slate-600",
    titleColor: "text-slate-900",
    iconColor: "text-violet-600",
    borderColor: "border-violet-100"
  },
  {
    icon: <BiSolidCustomize size={26} />,
    title: "Tailored Solutions",
    description: "Adjust parameters to align our AI tools perfectly with your farm's unique requirements.",
    gradient: "bg-white",
    textColor: "text-slate-600",
    titleColor: "text-slate-900",
    iconColor: "text-amber-600",
    borderColor: "border-amber-100"
  },
];

const Features = () => {
  return (
    /* Reduced padding to py-12 and updated to font-poppins */
    <section className="bg-green-50/30 py-12 font-poppins">
      <div className="container px-5 mx-auto">
        
        {/* Section Header - Consistent with Home/AboutUs */}
        <div className="flex flex-col w-full mb-10 items-center text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>Our Features</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-3 tracking-tight">
            What We Offer to Farmers
          </h2>
          <div className="h-1 w-16 bg-green-600 mb-4 rounded-full" />
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Explore our cutting-edge AI-driven solutions crafted to transform farming practices for the better.
          </p>
        </div>

        <div className="flex flex-wrap -m-4">
          {featureData.map((feature, index) => (
            <div key={index} className="xl:w-1/4 md:w-1/2 p-4">
              <div className={`group shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${feature.gradient} h-full flex flex-col border-b-4 ${feature.borderColor}`}>
                <div className="mb-4">
                  {/* Icon Container */}
                  <div className={`w-12 h-12 inline-flex items-center justify-center rounded-xl bg-slate-50 ${feature.iconColor} group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-lg font-bold mt-4 ${feature.titleColor}`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`leading-relaxed text-sm ${feature.textColor}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;