import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #1a2e5a 0%, #0f1e3d 100%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-10">
        {/* Left image placeholder */}
        <div className="w-full lg:w-1/3 aspect-[3/4] max-w-xs rounded-xl overflow-hidden bg-white/10 border border-white/20 flex flex-col items-center justify-center">
          <img src="/cta.jpg" alt="CTA Image" className="w-full h-full object-cover" />
        </div>

        {/* Right buttons */}
        <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
          <Link
            href="/registration"
            className="bg-[#56aeff] hover:bg-[#22959d] text-white font-bold text-sm uppercase tracking-wide px-6 py-4 rounded-full text-center transition-colors flex items-center justify-center"
          >
            Register Here
          </Link>
          <Link
            href="#program"
            className="bg-[#56aeff] hover:bg-[#22959d] text-white font-bold text-sm uppercase tracking-wide px-6 py-4 rounded-full text-center transition-colors flex items-center justify-center"
          >
            View Congress Program
          </Link>
          <Link
            href="#faq"
            className="bg-[#56aeff] hover:bg-[#22959d] text-white font-bold text-sm uppercase tracking-wide px-6 py-4 rounded-full text-center transition-colors flex items-center justify-center"
          >
            Frequently Asked Questions
          </Link>
          <Link
            href="#contact"
            className="bg-[#56aeff] hover:bg-[#22959d] text-white font-bold text-sm uppercase tracking-wide px-6 py-4 rounded-full text-center transition-colors flex items-center justify-center"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}