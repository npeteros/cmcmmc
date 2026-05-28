const keynote = {
  name: "Most Rev. Rex Andrew Alarcon",
  role: "Chair, Episcopal Commission on Social Communications (ECSC)",
  topic:
    '"To Work and to Take Care (Gen. 2:15): Human Dignity at the Heart of AI Innovation in Media Ministry"',
};

const plenary = [
  {
    name: "Howie Severino",
    role: "GMA Broadcast Journalist",
    session: "Plenary Session 1",
    topic: '"To Work: Human Creativity in AI-Assisted Communication"',
  },
  {
    name: "Gretchen Ho",
    role: "——————————————",
    session: "Plenary Session 2",
    topic: '"To Take Care: Truth in the Age of Deepfakes"',
  },
  {
    name: "Alex Rich",
    role: "National Lead Manager of Corporate Partnership and Development, Make-A-Wish America",
    session: "Plenary Session 3",
    topic: "Income Generating Projects in the Church",
  },
];

function AvatarPlaceholder({ size = "md" }: { size?: "md" | "lg" }) {
  const dim = size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div
      className={`${dim} rounded-full bg-[#f0941430] border-2 border-[#f09414] flex items-center justify-center shrink-0`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-6 h-6 text-[#f09414]"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    </div>
  );
}

export default function SpeakersSection() {
  return (
    <section
      id="speakers"
      className="py-8"
      style={{
        height: "75vh",
        background:
          "linear-gradient(135deg, #eaf7f8 0%, #f5f9ff 50%, #fff8ee 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start h-full">
          {/* Left: speakers image (hidden on small screens) */}
          <div className="hidden lg:block w-1/3 rounded-xl overflow-hidden h-full">
            <img
              src="/speakers.jpg"
              alt="Speakers"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right: content */}
          <div className="flex-1 flex flex-col justify-between h-full">
            <div>
              {/* Section heading */}
              <div className="flex justify-center mb-6 lg:justify-start">
                <div className="bg-[#56aeff] text-white text-sm font-bold uppercase tracking-widest px-8 py-2 rounded-full">
                  Meet Our Congress&apos; Speakers
                </div>
              </div>

              {/* Keynote */}
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Keynote
                </p>
                <div className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <AvatarPlaceholder size="lg" />
                  <div>
                    <p className="font-bold text-[#1a2e5a] text-base">
                      {keynote.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">{keynote.role}</p>
                    <p className="text-sm text-gray-700 italic">{keynote.topic}</p>
                  </div>
                </div>
              </div>

              {/* Plenary sessions */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Plenary Sessions
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {plenary.map((s) => (
                    <div
                      key={s.name}
                      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <AvatarPlaceholder />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#2aadb5]">
                            {s.session}
                          </p>
                          <p className="font-bold text-[#1a2e5a] text-sm">
                            {s.name}
                          </p>
                          <p className="text-xs text-gray-500 leading-snug">
                            {s.role}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 italic border-t border-gray-100 pt-3">
                        {s.topic}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}