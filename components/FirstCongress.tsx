export default function FirstCongress() {
  return (
    <section className="py-16 bg-gray-50 md:h-screen">
      <div className="h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold text-[#1a2e5a] mb-3">
          Relive the fun and learnings from the first CM-CMMC
        </h2>
        <p className="text-gray-600 text-sm mb-8 max-w-2xl mx-auto">
          More than 350 participants from the Archdiocese of Cebu and
          neighboring dioceses joined the first Cebu Metropolitan Catholic Mass
          Media Congress (CM-CMMC) last September 28, 2024.
        </p>

        {/* Image placeholder */}
        <div className="relative w-full max-w-lg mx-auto aspect-video rounded-xl overflow-hidden bg-[#1a2e5a]/10 border border-gray-200 flex flex-col items-center justify-center gap-2">
          <iframe
            src="https://web.facebook.com/plugins/video.php?href=https%3A%2F%2Fweb.facebook.com%2Fsugboanongsimbahan%2Fvideos%2F1189786702307897%2F"
            width="560"
            height="315"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen={true}
          ></iframe>
        </div>
      </div>
    </section>
  );
}
